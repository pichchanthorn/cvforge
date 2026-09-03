import type { CvData } from "@/lib/cv/schema";

export type CvSectionKey =
  | "personalInfo"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "languages"
  | "certifications";

/** All section chips shown in the progress UI, in display order. */
export const ALL_SECTION_KEYS: CvSectionKey[] = [
  "personalInfo",
  "experience",
  "education",
  "skills",
  "projects",
  "languages",
  "certifications",
];

/** Never counted toward readiness, and never styled as "needs attention". */
export const OPTIONAL_SECTION_KEYS: CvSectionKey[] = ["languages", "certifications"];

/** Experience and Projects satisfy the same "career content" requirement — see isCareerContentComplete. */
export const CAREER_CONTENT_KEYS: CvSectionKey[] = ["experience", "projects"];

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

/**
 * Experience and Projects are alternatives for the same "career content"
 * requirement — a fresh graduate with projects but no formal work
 * experience is still core-complete. Satisfying either is enough.
 */
export function isCareerContentComplete(data: CvData): boolean {
  return CAREER_CONTENT_KEYS.some((key) => isSectionComplete(key, data));
}

/**
 * Which career-content section currently counts toward readiness, so the
 * UI can show only one of Experience/Projects as "core" at a time —
 * whichever is filled first "wins" the requirement, and the other becomes
 * an optional bonus rather than a second required section.
 */
export function careerContentKeyInUse(data: CvData): CvSectionKey | null {
  return CAREER_CONTENT_KEYS.find((key) => isSectionComplete(key, data)) ?? null;
}

/** True for Languages/Certifications always, and for whichever of Experience/Projects isn't currently needed. */
export function isSectionOptional(key: CvSectionKey, data: CvData): boolean {
  if (OPTIONAL_SECTION_KEYS.includes(key)) return true;
  if (key === "experience" || key === "projects") {
    const inUse = careerContentKeyInUse(data);
    return inUse !== null && inUse !== key;
  }
  return false;
}

/**
 * Readiness = the 4 core requirements (Personal Info, Education, Skills,
 * and Experience-or-Projects). Languages and Certifications are optional
 * enhancements and never affect this percentage.
 */
export function computeCvReadiness(data: CvData): {
  completed: number;
  total: number;
  percent: number;
  isReady: boolean;
} {
  const coreChecks = [
    isSectionComplete("personalInfo", data),
    isSectionComplete("education", data),
    isSectionComplete("skills", data),
    isCareerContentComplete(data),
  ];
  const completed = coreChecks.filter(Boolean).length;
  const total = coreChecks.length;
  return { completed, total, percent: Math.round((completed / total) * 100), isReady: completed === total };
}
