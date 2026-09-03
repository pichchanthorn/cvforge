import type { CvData } from "@/lib/cv/schema";

export type CvSectionKey =
  | "personalInfo"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "languages"
  | "certifications";

/** Shown individually in the progress UI as a required-feeling section. */
export const CORE_SECTION_KEYS: CvSectionKey[] = ["personalInfo", "experience", "education", "skills"];
/** Still shown, but never styled as "needs attention" the way core sections are. */
export const OPTIONAL_SECTION_KEYS: CvSectionKey[] = ["projects", "languages", "certifications"];
export const ALL_SECTION_KEYS: CvSectionKey[] = [...CORE_SECTION_KEYS, ...OPTIONAL_SECTION_KEYS];

export function sectionAnchorId(key: CvSectionKey): string {
  return `cv-section-${key}`;
}

/**
 * "Is there anything meaningful here yet" — a lightweight signal for the
 * progress UI, not schema validation. Mirrors each item schema's required
 * fields (see lib/cv/schema.ts) rather than requiring every field.
 */
export function isSectionComplete(key: CvSectionKey, data: CvData): boolean {
  switch (key) {
    case "personalInfo":
      return (
        Boolean(data.personalInfo.fullName.trim()) &&
        Boolean(data.personalInfo.email.trim() || data.personalInfo.phone.trim())
      );
    case "experience":
      return data.experience.some((item) => item.company.trim() && item.role.trim());
    case "education":
      return data.education.some((item) => item.institution.trim());
    case "skills":
      return data.skills.some((item) => item.name.trim());
    case "projects":
      return data.projects.some((item) => item.name.trim());
    case "languages":
      return data.languages.some((item) => item.name.trim());
    case "certifications":
      return data.certifications.some((item) => item.name.trim());
  }
}

export function computeCvProgress(data: CvData): { completed: number; total: number; percent: number } {
  const completed = ALL_SECTION_KEYS.filter((key) => isSectionComplete(key, data)).length;
  const total = ALL_SECTION_KEYS.length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}
