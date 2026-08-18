import type { CvData } from "@/lib/cv/schema";
import { formatDateRange, groupSkills, UNGROUPED_SKILLS } from "@/lib/cv/format";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-indigo-700 uppercase">
      <span className="h-2.5 w-2.5 rounded-[2px] bg-indigo-600" />
      {children}
    </h2>
  );
}

export function ModernPreview({ data }: { data: CvData }) {
  const { personalInfo, experience, education, skills, projects, languages, certifications } = data;

  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(
    Boolean,
  );
  const skillGroups = groupSkills(skills);

  return (
    <div className="mx-auto w-full bg-white text-neutral-900 shadow-sm sm:w-[8.5in] sm:max-w-full">
      <header className="bg-indigo-700 px-8 py-10 text-white sm:px-[0.75in]">
        <h1 className="text-3xl font-bold tracking-tight">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.headline && (
          <p className="mt-1 text-sm text-indigo-100">{personalInfo.headline}</p>
        )}
        {(contactParts.length > 0 || personalInfo.links.length > 0) && (
          <p className="mt-3 text-xs break-words text-indigo-100">
            {contactParts.join("  ·  ")}
            {contactParts.length > 0 && personalInfo.links.length > 0 && "  ·  "}
            {personalInfo.links.map((link, i) => (
              <span key={link.id}>
                {i > 0 && "  ·  "}
                {link.url}
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="p-8 sm:p-[0.75in] sm:pt-8">
        {personalInfo.summary && (
          <section className="mb-5">
            <p className="text-[13px] leading-relaxed text-neutral-800">{personalInfo.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Experience</SectionHeading>
            <div className="space-y-3">
              {experience.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 break-words text-[13px] font-semibold text-neutral-900">
                      {item.role || "Role"}
                      {item.company && (
                        <span className="font-normal text-neutral-700"> · {item.company}</span>
                      )}
                    </p>
                    <p className="shrink-0 text-[11px] text-neutral-500">
                      {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                    </p>
                  </div>
                  {item.location && (
                    <p className="text-[11px] text-neutral-500">{item.location}</p>
                  )}
                  {item.bullets.filter(Boolean).length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                      {item.bullets.filter(Boolean).map((bullet, i) => (
                        <li key={i} className="text-[12.5px] leading-relaxed text-neutral-800">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Education</SectionHeading>
            <div className="space-y-3">
              {education.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 break-words text-[13px] font-semibold text-neutral-900">
                      {item.institution || "Institution"}
                    </p>
                    <p className="shrink-0 text-[11px] text-neutral-500">
                      {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                    </p>
                  </div>
                  <p className="text-[12px] text-neutral-700">
                    {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                    {item.location && ` · ${item.location}`}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-800">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Skills</SectionHeading>
            <div className="space-y-1">
              {skillGroups.map(([group, items]) => (
                <p key={group} className="text-[12.5px] text-neutral-800">
                  {group !== UNGROUPED_SKILLS && <span className="font-semibold">{group}: </span>}
                  {items.join(", ")}
                </p>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Projects</SectionHeading>
            <div className="space-y-3">
              {projects.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold text-neutral-900">
                      {item.name || "Project"}
                      {item.url && (
                        <span className="font-normal text-neutral-600"> · {item.url}</span>
                      )}
                    </p>
                    <p className="shrink-0 text-[11px] text-neutral-500">
                      {formatDateRange(item.startDate, item.endDate, false)}
                    </p>
                  </div>
                  {item.description && (
                    <p className="text-[12.5px] leading-relaxed text-neutral-800">
                      {item.description}
                    </p>
                  )}
                  {item.tech.filter(Boolean).length > 0 && (
                    <p className="text-[11.5px] text-neutral-500">
                      {item.tech.filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(languages.length > 0 || certifications.length > 0) && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {languages.length > 0 && (
              <section>
                <SectionHeading>Languages</SectionHeading>
                <p className="text-[12.5px] text-neutral-800">
                  {languages
                    .map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name))
                    .join(", ")}
                </p>
              </section>
            )}

            {certifications.length > 0 && (
              <section>
                <SectionHeading>Certifications</SectionHeading>
                <div className="space-y-1">
                  {certifications.map((cert) => (
                    <p key={cert.id} className="text-[12.5px] text-neutral-800">
                      {cert.name}
                      {cert.issuer && `, ${cert.issuer}`}
                      {cert.issueDate && ` — ${formatDateRange(cert.issueDate, "", false)}`}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
