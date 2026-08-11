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

const CREATIVE_VIOLET = "7C5CFF"; // timeline dot marker
const CREATIVE_VIOLET_LIGHT = "EDE9FE"; // header rule + timeline connecting line
const CREATIVE_VIOLET_TEXT = "5B3FD1"; // headline + section headings
const CREATIVE_VIOLET_DARK = "2E1065"; // name
const CREATIVE_CONTACT_GRAY = "525252";
// Matches the plain colored heading (no underline, no marker) used by the Creative PDF/preview templates.
const HEADING_VIOLET_PLAIN: HeadingAccent = { color: CREATIVE_VIOLET_TEXT };

const TIMELINE_MARKER_COL_WIDTH = 500; // narrow marker column, ~0.35in
const TIMELINE_CONTENT_COL_WIDTH = CONTENT_WIDTH_DXA - TIMELINE_MARKER_COL_WIDTH;

const SIDEBAR_TEAL = "115E59";
const SIDEBAR_TEAL_LIGHT = "99F6E4";
const SIDEBAR_TEXT_LIGHT = "F0FDFA";
const SIDEBAR_COL_WIDTH = 3520; // 176pt, matching the Sidebar PDF template's fixed sidebar width
const SIDEBAR_PAGE_MARGIN = 360; // 0.25in — tighter than the standard 0.5in so the teal
// column reads closer to the PDF's true edge-to-edge bleed (docx can't bleed past margins).
const SIDEBAR_CONTENT_WIDTH = 12240 - SIDEBAR_PAGE_MARGIN * 2; // Letter width minus this template's own margins
const SIDEBAR_MAIN_COL_WIDTH = SIDEBAR_CONTENT_WIDTH - SIDEBAR_COL_WIDTH;
// Matches the underlined teal heading used by the Sidebar PDF/preview template's main column.
const HEADING_TEAL: HeadingAccent = { color: SIDEBAR_TEAL, border: SIDEBAR_TEAL };

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

/** The Creative template's header: name/headline/contact centered, with a
 * violet rule underneath — mirroring the PDF/preview's bottom-bordered
 * header block. Each line needs its own color (dark violet name, lighter
 * violet headline, gray contact), so this builds bespoke paragraphs rather
 * than reusing headerTextParagraphs(). The border is attached to whichever
 * line ends up last, since that's the only way to draw one rule under the
 * whole block without wrapping it in a table. */
function buildCreativeHeader(personalInfo: CvData["personalInfo"]): Paragraph[] {
  const lines: { text: string; size: number; color: string; bold?: boolean; spacingAfter: number }[] = [
    { text: personalInfo.fullName || "Your Name", size: 44, color: CREATIVE_VIOLET_DARK, bold: true, spacingAfter: 40 },
  ];

  if (personalInfo.headline) {
    lines.push({ text: personalInfo.headline, size: 21, color: CREATIVE_VIOLET_TEXT, spacingAfter: 60 });
  }

  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const linkParts = personalInfo.links.map((l) => l.url).filter(Boolean);
  const contactLine = [...contactParts, ...linkParts].join("   |   ");
  if (contactLine) {
    lines.push({ text: contactLine, size: 18, color: CREATIVE_CONTACT_GRAY, spacingAfter: 0 });
  }

  const paragraphs = lines.map(
    (line, i) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: line.spacingAfter },
        border:
          i === lines.length - 1
            ? { bottom: { style: BorderStyle.SINGLE, size: 12, color: CREATIVE_VIOLET_LIGHT, space: 14 } }
            : undefined,
        children: [new TextRun({ text: line.text, size: line.size, color: line.color, bold: line.bold })],
      }),
  );

  return [...paragraphs, spacerParagraph(200)];
}

function experienceEntryParagraphs(item: CvData["experience"][number]): Paragraph[] {
  const paragraphs: Paragraph[] = [
    bodyParagraph([item.role || "Role", item.company].filter(Boolean).join(" — "), {
      bold: true,
      spacingAfter: 20,
    }),
  ];
  const meta = [item.location, formatDateRange(item.startDate, item.endDate, item.isCurrent)]
    .filter(Boolean)
    .join("   ·   ");
  if (meta) paragraphs.push(metaLine(meta));
  for (const bullet of item.bullets.filter(Boolean)) {
    paragraphs.push(bulletParagraph(bullet));
  }
  return paragraphs;
}

function educationEntryParagraphs(item: CvData["education"][number]): Paragraph[] {
  const paragraphs: Paragraph[] = [
    bodyParagraph(item.institution || "Institution", { bold: true, spacingAfter: 20 }),
  ];
  const meta = [
    [item.degree, item.fieldOfStudy].filter(Boolean).join(", "),
    item.location,
    formatDateRange(item.startDate, item.endDate, item.isCurrent),
  ]
    .filter(Boolean)
    .join("   ·   ");
  if (meta) paragraphs.push(metaLine(meta));
  if (item.description) paragraphs.push(bodyParagraph(item.description, { spacingAfter: 0 }));
  return paragraphs;
}

/** Wraps a list of entries (Experience/Education) in a borderless two-column
 * table — a narrow marker column with a violet dot, and a content column —
 * with a colored line drawn between the columns via the table's
 * insideVertical border. Because that border applies to the whole table,
 * not per row, it renders as one continuous line running down through every
 * entry, approximating the PDF/preview's border-left timeline with a dot
 * positioned on top of it. This is the closest practical approximation:
 * docx has no reliable freeform shape/absolute-positioning API to place a
 * dot exactly on a line the way CSS does. */
function timelineTable(entryGroups: Paragraph[][]): Table {
  const rows = entryGroups.map(
    (entryParagraphs) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: TIMELINE_MARKER_COL_WIDTH, type: WidthType.DXA },
            margins: { top: 60, bottom: 200 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "●", size: 16, color: CREATIVE_VIOLET })],
              }),
            ],
          }),
          new TableCell({
            width: { size: TIMELINE_CONTENT_COL_WIDTH, type: WidthType.DXA },
            margins: { left: 200, bottom: 200 },
            children: entryParagraphs,
          }),
        ],
      }),
  );

  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [TIMELINE_MARKER_COL_WIDTH, TIMELINE_CONTENT_COL_WIDTH],
    borders: { ...TableBorders.NONE, insideVertical: { style: BorderStyle.SINGLE, size: 8, color: CREATIVE_VIOLET_LIGHT } },
    rows,
  });
}

function projectEntryParagraphs(item: CvData["projects"][number]): Paragraph[] {
  const paragraphs: Paragraph[] = [
    bodyParagraph([item.name || "Project", item.url].filter(Boolean).join(" — "), {
      bold: true,
      spacingAfter: 20,
    }),
  ];
  const meta = formatDateRange(item.startDate, item.endDate, false);
  if (meta) paragraphs.push(metaLine(meta));
  if (item.description) paragraphs.push(bodyParagraph(item.description, { spacingAfter: 20 }));
  const tech = item.tech.filter(Boolean);
  if (tech.length > 0) paragraphs.push(metaLine(tech.join(", ")));
  return paragraphs;
}

/** A section heading for the Sidebar template's dark teal column: small,
 * light-teal, uppercase, no underline — matching the PDF/preview's
 * SideHeading style (distinct from the underlined teal heading used in the
 * same template's white main column, see HEADING_TEAL). */
function sidebarHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 15, color: SIDEBAR_TEAL_LIGHT })],
  });
}

function sidebarText(text: string, spacingAfter = 40): Paragraph {
  return new Paragraph({
    spacing: { after: spacingAfter },
    children: [new TextRun({ text, size: 16, color: SIDEBAR_TEXT_LIGHT })],
  });
}

/** The Sidebar template's full-page layout: a dark teal column (name,
 * headline, Contact, Skills, Languages, Certifications) beside a white
 * column (Summary, Experience, Education, Projects) — mirroring the
 * PDF/preview's two-column structure. Unlike every other template, this
 * *is* the whole document body, not just a header: docx has no way to make
 * an element stretch to fill the page height outside a table, so the
 * entire page is one borderless single-row table. Word sizes a table row to
 * its tallest cell and fills each cell's full rectangle with its shading,
 * so the teal column's background automatically extends to match whichever
 * column is taller — including across page breaks if the CV runs long. */
function buildSidebarDocument(data: CvData): Table {
  const { personalInfo, experience, education, skills, projects, languages, certifications } = data;

  const sidebarChildren: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: personalInfo.fullName || "Your Name", bold: true, size: 34, color: "FFFFFF" })],
    }),
  ];
  if (personalInfo.headline) {
    sidebarChildren.push(
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text: personalInfo.headline, size: 19, color: SIDEBAR_TEAL_LIGHT })],
      }),
    );
  }

  const contactItems = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const linkItems = personalInfo.links.map((l) => l.url).filter(Boolean);
  if (contactItems.length > 0 || linkItems.length > 0) {
    sidebarChildren.push(sidebarHeading("Contact"));
    for (const item of [...contactItems, ...linkItems]) {
      sidebarChildren.push(sidebarText(item, 20));
    }
  }

  if (skills.length > 0) {
    sidebarChildren.push(sidebarHeading("Skills"));
    for (const [group, items] of groupSkills(skills)) {
      if (group !== UNGROUPED_SKILLS) {
        sidebarChildren.push(
          new Paragraph({
            spacing: { after: 0 },
            children: [new TextRun({ text: group, bold: true, size: 15, color: SIDEBAR_TEAL_LIGHT })],
          }),
        );
      }
      sidebarChildren.push(sidebarText(items.join(", "), 40));
    }
  }

  if (languages.length > 0) {
    sidebarChildren.push(sidebarHeading("Languages"));
    for (const l of languages) {
      sidebarChildren.push(sidebarText(l.proficiency ? `${l.name} — ${l.proficiency}` : l.name, 20));
    }
  }

  if (certifications.length > 0) {
    sidebarChildren.push(sidebarHeading("Certifications"));
    for (const cert of certifications) {
      sidebarChildren.push(sidebarText([cert.name, cert.issuer].filter(Boolean).join(", "), 20));
    }
  }

  const mainChildren: Paragraph[] = [];
  if (personalInfo.summary) {
    mainChildren.push(bodyParagraph(personalInfo.summary, { spacingAfter: 160 }));
  }

  if (experience.length > 0) {
    mainChildren.push(sectionHeading("Experience", HEADING_TEAL));
    for (const item of experience) {
      mainChildren.push(...experienceEntryParagraphs(item));
      mainChildren.push(spacerParagraph(100));
    }
  }

  if (education.length > 0) {
    mainChildren.push(sectionHeading("Education", HEADING_TEAL));
    for (const item of education) {
      mainChildren.push(...educationEntryParagraphs(item));
      mainChildren.push(spacerParagraph(80));
    }
  }

  if (projects.length > 0) {
    mainChildren.push(sectionHeading("Projects", HEADING_TEAL));
    for (const item of projects) {
      mainChildren.push(...projectEntryParagraphs(item));
      mainChildren.push(spacerParagraph(80));
    }
  }

  const sidebarCell = new TableCell({
    width: { size: SIDEBAR_COL_WIDTH, type: WidthType.DXA },
    shading: { fill: SIDEBAR_TEAL, type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 400, bottom: 400, left: 260, right: 260 },
    children: sidebarChildren,
  });

  const mainCell = new TableCell({
    width: { size: SIDEBAR_MAIN_COL_WIDTH, type: WidthType.DXA },
    margins: { top: 400, bottom: 400, left: 320, right: 220 },
    children: mainChildren,
  });

  return new Table({
    width: { size: SIDEBAR_CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [SIDEBAR_COL_WIDTH, SIDEBAR_MAIN_COL_WIDTH],
    borders: TableBorders.NONE,
    rows: [new TableRow({ children: [sidebarCell, mainCell] })],
  });
}

export async function generateCvDocx(data: CvData): Promise<Blob> {
  if (data.templateId === "sidebar") {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: SIDEBAR_PAGE_MARGIN,
                bottom: SIDEBAR_PAGE_MARGIN,
                left: SIDEBAR_PAGE_MARGIN,
                right: SIDEBAR_PAGE_MARGIN,
              },
            },
          },
          children: [buildSidebarDocument(data)],
        },
      ],
    });
    return Packer.toBlob(doc);
  }

  const { personalInfo, experience, education, skills, projects, languages, certifications, templateId } = data;
  const isCreative = templateId === "creative";

  const headingAccent: HeadingAccent =
    templateId === "portrait"
      ? HEADING_AMBER
      : templateId === "modern"
        ? HEADING_INDIGO_DOT
        : isCreative
          ? HEADING_VIOLET_PLAIN
          : HEADING_GRAY;

  const children: (Paragraph | Table)[] =
    templateId === "portrait"
      ? buildPortraitHeader(personalInfo)
      : templateId === "modern"
        ? buildModernHeader(personalInfo)
        : isCreative
          ? buildCreativeHeader(personalInfo)
          : buildGenericHeader(personalInfo);

  if (personalInfo.summary) {
    children.push(bodyParagraph(personalInfo.summary, { spacingAfter: 160 }));
  }

  if (experience.length > 0) {
    children.push(sectionHeading("Experience", headingAccent));
    if (isCreative) {
      children.push(timelineTable(experience.map(experienceEntryParagraphs)));
      children.push(spacerParagraph(160));
    } else {
      for (const item of experience) {
        children.push(...experienceEntryParagraphs(item));
        children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
      }
    }
  }

  if (education.length > 0) {
    children.push(sectionHeading("Education", headingAccent));
    if (isCreative) {
      children.push(timelineTable(education.map(educationEntryParagraphs)));
      children.push(spacerParagraph(160));
    } else {
      for (const item of education) {
        children.push(...educationEntryParagraphs(item));
        children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      }
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
      children.push(...projectEntryParagraphs(item));
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
