import { z } from "zod";
import {
  personalInfoSchema,
  experienceItemSchema,
  educationItemSchema,
  skillItemSchema,
  projectItemSchema,
  languageItemSchema,
  type CvData,
} from "@/lib/cv/schema";

/**
 * The subset of CvData sent to the ATS Match worker. Deliberately excludes
 * PII and anything with no matching value: photo, email, phone, location,
 * links, certifications, and every id/title/templateId field.
 */
const atsPersonalInfoSchema = personalInfoSchema.pick({
  headline: true,
  summary: true,
});
const atsExperienceItemSchema = experienceItemSchema.pick({
  role: true,
  company: true,
  bullets: true,
});
const atsEducationItemSchema = educationItemSchema.pick({
  degree: true,
  fieldOfStudy: true,
});
const atsSkillItemSchema = skillItemSchema.pick({
  name: true,
  groupName: true,
});
const atsProjectItemSchema = projectItemSchema.pick({
  name: true,
  description: true,
  tech: true,
});
const atsLanguageItemSchema = languageItemSchema.pick({ name: true });

export const atsMatchCvSchema = z.object({
  ...atsPersonalInfoSchema.shape,
  experience: z.array(atsExperienceItemSchema),
  education: z.array(atsEducationItemSchema),
  skills: z.array(atsSkillItemSchema),
  projects: z.array(atsProjectItemSchema),
  languages: z.array(atsLanguageItemSchema),
});

export type AtsMatchCv = z.infer<typeof atsMatchCvSchema>;

/** Strips CvData down to the AtsMatchCv payload sent to the worker. */
export function toAtsMatchPayload(cv: CvData): AtsMatchCv {
  const { headline, summary } = cv.personalInfo;
  return {
    headline,
    summary,
    experience: cv.experience.map(({ role, company, bullets }) => ({
      role,
      company,
      bullets,
    })),
    education: cv.education.map(({ degree, fieldOfStudy }) => ({
      degree,
      fieldOfStudy,
    })),
    skills: cv.skills.map(({ name, groupName }) => ({ name, groupName })),
    projects: cv.projects.map(({ name, description, tech }) => ({
      name,
      description,
      tech,
    })),
    languages: cv.languages.map(({ name }) => ({ name })),
  };
}
