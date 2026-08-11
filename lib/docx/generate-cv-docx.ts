import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { CvData } from "@/lib/cv/schema";
import { formatDateRange, groupSkills, UNGROUPED_SKILLS } from "@/lib/cv/format";

const GRAY = "555555";
const DARK = "1A1A1A";

/** Section-heading accent. `border` draws an underline (ATS/Portrait/Sidebar
 * style); `dot` prepends a small colored square marker instead (Modern
 * style); neither gives plain colored uppercase text (Creative style). */
type HeadingAccent = { color: string; border?: string; dot?: boolean };
const HEADING_GRAY: HeadingAccent = { color: "333333", border: "CCCCCC" };
// Matches the amber accent used by the Portrait PDF/preview templates.
const HEADING_AMBER: HeadingAccent = { color: "78350F", border: "FCD34D" };
// Matches the indigo accent + square marker used by the Modern PDF/preview templates.
const HEADING_INDIGO_DOT: HeadingAccent = { color: "4338CA", dot: true };

const PHOTO_SIZE = 96; // pt — matches the Portrait PDF template's headshot size.
const PORTRAIT_PHOTO_COL_WIDTH = 1800; // ~1.25in in twips (DXA)
const PORTRAIT_TEXT_COL_WIDTH = 9000; // ~6.25in in twips (DXA)
const CONTENT_WIDTH_DXA = 10800; // Letter width (12240) minus 720-twip margins on each side.

const MODERN_INDIGO = "4338CA";
const MODERN_INDIGO_LIGHT = "E0E7FF";

function sectionHeading(text: string, accent: HeadingAccent = HEADING_GRAY): Paragraph {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    border: accent.border
      ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: accent.border, space: 4 } }
      : undefined,
    children: [
      ...(accent.dot ? [new TextRun({ text: "■ ", size: 12, color: accent.color })] : []),
      new TextRun({ text: text.toUpperCase(), bold: true, size: 19, color: accent.color }),
    ],
  });
}

function metaLine(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 18, color: GRAY, italics: true })],
  });
}

function bodyParagraph(text: string, opts: Partial<{ bold: boolean; spacingAfter: number }> = {}): Paragraph {
  return new Paragraph({
    spacing: { after: opts.spacingAfter ?? 80 },
    children: [new TextRun({ text, size: 21, color: DARK, bold: opts.bold })],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 20, color: DARK })],
  });
}

function spacerParagraph(after: number): Paragraph {
  return new Paragraph({ spacing: { after }, children: [] });
}

function headerTextParagraphs(
  personalInfo: CvData["personalInfo"],
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType],
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment,
      spacing: { after: 40 },
      children: [new TextRun({ text: personalInfo.fullName || "Your Name", bold: true, size: 40 })],
    }),
  ];

  if (personalInfo.headline) {
    paragraphs.push(
      new Paragraph({
        alignment,
        spacing: { after: 60 },
        children: [new TextRun({ text: personalInfo.headline, size: 21, color: GRAY })],
      }),
    );
  }

  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const linkParts = personalInfo.links.map((l) => l.url).filter(Boolean);
  const contactLine = [...contactParts, ...linkParts].join("   |   ");
  if (contactLine) {
    paragraphs.push(
      new Paragraph({
        alignment,
        spacing: { after: 0 },
        children: [new TextRun({ text: contactLine, size: 18, color: GRAY })],
      }),
    );
  }

  return paragraphs;
}

/** ATS Classic's header (also the fallback for any template not yet given
 * its own builder): name/headline/contact, centered. No photo — ATS
 * Classic's own PDF/preview never shows one, and Word export now mirrors
 * each template's PDF exactly rather than sharing one generic layout. */
function buildGenericHeader(personalInfo: CvData["personalInfo"]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  paragraphs.push(...headerTextParagraphs(personalInfo, AlignmentType.CENTER), spacerParagraph(200));
  return paragraphs;
}

/** The Portrait template's header: headshot to the left of a left-aligned
 * name/headline/contact block, mirroring the PDF/preview layout. docx has no
 * flexbox or absolute positioning, so a borderless single-row table is the
 * standard way to lay two blocks out side by side. Falls back to the plain
 * left-aligned text block (no table) when there's no photo to show. */
function buildPortraitHeader(personalInfo: CvData["personalInfo"]): (Paragraph | Table)[] {
  const textParagraphs = headerTextParagraphs(personalInfo, AlignmentType.LEFT);

  if (!personalInfo.photo) {
    return [...textParagraphs, spacerParagraph(200)];
  }

  const photoCell = new TableCell({
    width: { size: PORTRAIT_PHOTO_COL_WIDTH, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { right: 300 },
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            type: "jpg",
            data: personalInfo.photo,
            transformation: { width: PHOTO_SIZE, height: PHOTO_SIZE },
          }),
        ],
      }),
    ],
  });

  const textCell = new TableCell({
    width: { size: PORTRAIT_TEXT_COL_WIDTH, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    children: textParagraphs,
  });

  const table = new Table({
    width: { size: PORTRAIT_PHOTO_COL_WIDTH + PORTRAIT_TEXT_COL_WIDTH, type: WidthType.DXA },
    columnWidths: [PORTRAIT_PHOTO_COL_WIDTH, PORTRAIT_TEXT_COL_WIDTH],
    borders: TableBorders.NONE,
    rows: [new TableRow({ children: [photoCell, textCell] })],
  });

  return [table, spacerParagraph(160)];
}

/** The Modern template's header: a full-width indigo block (left-aligned
 * name/headline/contact in white/light text), mirroring the PDF/preview's
 * colored header band. docx has no element-level background color outside a
 * table, so a single-cell borderless table with cell shading is the
 * standard way to fill a block with color. Note this only fills the content
 * width (inside the page's 0.5in margins), not a true edge-to-edge bleed
 * like the PDF — Word documents don't fill past their margins without
 * reworking the section's page margins, so this is an intentional, common
 * approximation for Word-format headers. */
function buildModernHeader(personalInfo: CvData["personalInfo"]): (Paragraph | Table)[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: personalInfo.fullName || "Your Name", bold: true, size: 40, color: "FFFFFF" }),
      ],
    }),
  ];

  if (personalInfo.headline) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: personalInfo.headline, size: 21, color: MODERN_INDIGO_LIGHT })],
      }),
    );
  }

  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const linkParts = personalInfo.links.map((l) => l.url).filter(Boolean);
  const contactLine = [...contactParts, ...linkParts].join("   |   ");
  if (contactLine) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text: contactLine, size: 18, color: MODERN_INDIGO_LIGHT })],
      }),
    );
  }

  const headerCell = new TableCell({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    shading: { fill: MODERN_INDIGO, type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 280, bottom: 280, left: 260, right: 260 },
    children: paragraphs,
  });

  const table = new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH_DXA],
    borders: TableBorders.NONE,
    rows: [new TableRow({ children: [headerCell] })],
  });

  return [table, spacerParagraph(200)];
}

export async function generateCvDocx(data: CvData): Promise<Blob> {
  const { personalInfo, experience, education, skills, projects, languages, certifications, templateId } = data;

  const headingAccent: HeadingAccent =
    templateId === "portrait" ? HEADING_AMBER : templateId === "modern" ? HEADING_INDIGO_DOT : HEADING_GRAY;

  const children: (Paragraph | Table)[] =
    templateId === "portrait"
      ? buildPortraitHeader(personalInfo)
      : templateId === "modern"
        ? buildModernHeader(personalInfo)
        : buildGenericHeader(personalInfo);

  if (personalInfo.summary) {
    children.push(bodyParagraph(personalInfo.summary, { spacingAfter: 160 }));
  }

  if (experience.length > 0) {
    children.push(sectionHeading("Experience", headingAccent));
    for (const item of experience) {
      children.push(
        bodyParagraph(
          [item.role || "Role", item.company].filter(Boolean).join(" — "),
          { bold: true, spacingAfter: 20 },
        ),
      );
      const meta = [item.location, formatDateRange(item.startDate, item.endDate, item.isCurrent)]
        .filter(Boolean)
        .join("   ·   ");
      if (meta) children.push(metaLine(meta));
      for (const bullet of item.bullets.filter(Boolean)) {
        children.push(bulletParagraph(bullet));
      }
      children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
    }
  }

  if (education.length > 0) {
    children.push(sectionHeading("Education", headingAccent));
    for (const item of education) {
      children.push(bodyParagraph(item.institution || "Institution", { bold: true, spacingAfter: 20 }));
      const meta = [
        [item.degree, item.fieldOfStudy].filter(Boolean).join(", "),
        item.location,
        formatDateRange(item.startDate, item.endDate, item.isCurrent),
      ]
        .filter(Boolean)
        .join("   ·   ");
      if (meta) children.push(metaLine(meta));
      if (item.description) children.push(bodyParagraph(item.description, { spacingAfter: 100 }));
      else children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    }
  }

  if (skills.length > 0) {
    children.push(sectionHeading("Skills", headingAccent));
    for (const [group, items] of groupSkills(skills)) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            ...(group !== UNGROUPED_SKILLS
              ? [new TextRun({ text: `${group}: `, bold: true, size: 21, color: DARK })]
              : []),
            new TextRun({ text: items.join(", "), size: 21, color: DARK }),
          ],
        }),
      );
    }
  }

  if (projects.length > 0) {
    children.push(sectionHeading("Projects", headingAccent));
    for (const item of projects) {
      children.push(
        bodyParagraph([item.name || "Project", item.url].filter(Boolean).join(" — "), {
          bold: true,
          spacingAfter: 20,
        }),
      );
      const meta = formatDateRange(item.startDate, item.endDate, false);
      if (meta) children.push(metaLine(meta));
      if (item.description) children.push(bodyParagraph(item.description, { spacingAfter: 20 }));
      const tech = item.tech.filter(Boolean);
      if (tech.length > 0) children.push(metaLine(tech.join(", ")));
      children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    }
  }

  if (languages.length > 0) {
    children.push(sectionHeading("Languages", headingAccent));
    const text = languages.map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name)).join(", ");
    children.push(bodyParagraph(text));
  }

  if (certifications.length > 0) {
    children.push(sectionHeading("Certifications", headingAccent));
    for (const cert of certifications) {
      const text = [cert.name, cert.issuer].filter(Boolean).join(", ") +
        (cert.issueDate ? ` — ${formatDateRange(cert.issueDate, "", false)}` : "");
      children.push(bodyParagraph(text, { spacingAfter: 40 }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
