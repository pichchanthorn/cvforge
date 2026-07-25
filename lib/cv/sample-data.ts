import { newId, type CvData } from "@/lib/cv/schema";

export function createSampleCv(): CvData {
  return {
    title: "My CV",
    personalInfo: {
      fullName: "Jordan Avery",
      headline: "Frontend Developer",
      email: "jordan.avery@example.com",
      phone: "+1 (555) 012-3456",
      location: "Austin, TX",
      summary:
        "Frontend developer with 3 years of experience building accessible, high-performance web applications with React and TypeScript. Focused on clean UI, maintainable code, and shipping features that hold up in production.",
      links: [
        { id: newId(), label: "Portfolio", url: "jordanavery.dev" },
        { id: newId(), label: "GitHub", url: "github.com/jordanavery" },
      ],
    },
    experience: [
      {
        id: newId(),
        company: "Northwind Software",
        role: "Frontend Developer",
        location: "Austin, TX",
        startDate: "2023-06",
        endDate: "",
        isCurrent: true,
        bullets: [
          "Rebuilt the customer dashboard in React and TypeScript, cutting median load time by 40%",
          "Introduced a component library adopted across 4 product teams, reducing duplicate UI code",
          "Partnered with design to close accessibility gaps, bringing key flows to WCAG AA",
        ],
      },
      {
        id: newId(),
        company: "Beacon Analytics",
        role: "Junior Web Developer",
        location: "Remote",
        startDate: "2021-08",
        endDate: "2023-05",
        isCurrent: false,
        bullets: [
          "Built and maintained internal reporting tools used by 50+ analysts daily",
          "Migrated a legacy jQuery codebase to React incrementally with zero downtime",
        ],
      },
    ],
    education: [
      {
        id: newId(),
        institution: "University of Texas at Austin",
        degree: "B.S.",
        fieldOfStudy: "Computer Science",
        location: "Austin, TX",
        startDate: "2017-08",
        endDate: "2021-05",
        isCurrent: false,
        description: "Relevant coursework: Data Structures, Web Systems, Human-Computer Interaction.",
      },
    ],
    skills: [
      { id: newId(), name: "TypeScript", groupName: "Languages" },
      { id: newId(), name: "JavaScript", groupName: "Languages" },
      { id: newId(), name: "React", groupName: "Frameworks" },
      { id: newId(), name: "Next.js", groupName: "Frameworks" },
      { id: newId(), name: "Tailwind CSS", groupName: "Frameworks" },
      { id: newId(), name: "Git", groupName: "Tools" },
      { id: newId(), name: "Figma", groupName: "Tools" },
    ],
    projects: [
      {
        id: newId(),
        name: "CVForge",
        description:
          "An online resume builder with live preview and one-click PDF export.",
        url: "github.com/jordanavery/cvforge",
        tech: ["Next.js", "TypeScript", "Tailwind CSS"],
        startDate: "2026-05",
        endDate: "",
      },
    ],
    languages: [
      { id: newId(), name: "English", proficiency: "Native" },
      { id: newId(), name: "Spanish", proficiency: "Professional" },
    ],
    certifications: [
      {
        id: newId(),
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        issueDate: "2024-02",
        credentialUrl: "",
      },
    ],
  };
}
