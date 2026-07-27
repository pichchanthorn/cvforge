import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { CvData } from "@/lib/cv/schema";
import { formatDateRange, groupSkills, UNGROUPED_SKILLS } from "@/lib/cv/format";

const GRAY = "555555";
const DARK = "1A1A1A";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 },
    },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 19, color: "333333" }),
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

export async function generateCvDocx(data: CvData): Promise<Blob> {
  const { personalInfo, experience, education, skills, projects, languages, certifications } = data;

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: personalInfo.fullName || "Your Name", bold: true, size: 40 }),
      ],
    }),
  );

  if (personalInfo.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: personalInfo.headline, size: 21, color: GRAY })],
      }),
    );
  }

  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const linkParts = personalInfo.links.map((l) => l.url).filter(Boolean);
  const contactLine = [...contactParts, ...linkParts].join("   |   ");
  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: contactLine, size: 18, color: GRAY })],
      }),
    );
  }

  if (personalInfo.summary) {
    children.push(bodyParagraph(personalInfo.summary, { spacingAfter: 160 }));
  }

  if (experience.length > 0) {
    children.push(sectionHeading("Experience"));
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
    children.push(sectionHeading("Education"));
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
    children.push(sectionHeading("Skills"));
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
    children.push(sectionHeading("Projects"));
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
    children.push(sectionHeading("Languages"));
    const text = languages.map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name)).join(", ");
    children.push(bodyParagraph(text));
  }

  if (certifications.length > 0) {
    children.push(sectionHeading("Certifications"));
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
