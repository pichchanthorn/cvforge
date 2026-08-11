import { z } from "zod";

export function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export const linkSchema = z.object({
  id: z.string(),
  label: z.string().max(60),
  url: z.string().max(300),
});

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, { error: "Full name is required" }).max(120),
  headline: z.string().max(150),
  email: z.union([z.literal(""), z.email({ error: "Enter a valid email" })]),
  phone: z.string().max(40),
  location: z.string().max(120),
  summary: z.string().max(800),
  links: z.array(linkSchema).max(5),
  /** JPEG data URL from resizeImageToSquareDataUrl(); "" means no photo. */
  photo: z.string().max(300_000),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, { error: "Company is required" }).max(120),
  role: z.string().min(1, { error: "Role is required" }).max(120),
  location: z.string().max(120),
  startDate: z.string().max(20),
  endDate: z.string().max(20),
  isCurrent: z.boolean(),
  bullets: z.array(z.string().max(300)).max(10),
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z
    .string()
    .min(1, { error: "Institution is required" })
    .max(120),
  degree: z.string().max(120),
  fieldOfStudy: z.string().max(120),
  location: z.string().max(120),
  startDate: z.string().max(20),
  endDate: z.string().max(20),
  isCurrent: z.boolean(),
  description: z.string().max(500),
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { error: "Skill name is required" }).max(60),
  groupName: z.string().max(60),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { error: "Project name is required" }).max(120),
  description: z.string().max(500),
  url: z.string().max(300),
  tech: z.array(z.string().max(40)).max(15),
  startDate: z.string().max(20),
  endDate: z.string().max(20),
});

export const languageItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { error: "Language is required" }).max(60),
  proficiency: z.string().max(40),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { error: "Certification name is required" }).max(150),
  issuer: z.string().max(120),
  issueDate: z.string().max(20),
  credentialUrl: z.string().max(300),
});

export const templateIds = [
  "ats-one-column",
  "modern",
  "sidebar",
  "creative",
  "portrait",
] as const;
export type TemplateId = (typeof templateIds)[number];

export const cvDataSchema = z.object({
  title: z.string().max(120),
  templateId: z.enum(templateIds),
  personalInfo: personalInfoSchema,
  experience: z.array(experienceItemSchema).max(15),
  education: z.array(educationItemSchema).max(10),
  skills: z.array(skillItemSchema).max(40),
  projects: z.array(projectItemSchema).max(10),
  languages: z.array(languageItemSchema).max(10),
  certifications: z.array(certificationItemSchema).max(10),
});

export type CvData = z.infer<typeof cvDataSchema>;
export type LinkItem = z.infer<typeof linkSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type LanguageItem = z.infer<typeof languageItemSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;

export function createEmptyCv(): CvData {
  return {
    title: "My CV",
    templateId: "ats-one-column",
    personalInfo: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      links: [],
      photo: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
  };
}
