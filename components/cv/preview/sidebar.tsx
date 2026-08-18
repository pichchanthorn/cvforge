import type { CvData } from "@/lib/cv/schema";
import { formatDateRange, groupSkills, UNGROUPED_SKILLS } from "@/lib/cv/format";

function MainHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-b-2 border-teal-600 pb-1 text-[11px] font-bold tracking-[0.12em] text-teal-800 uppercase">
      {children}
    </h2>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[10.5px] font-bold tracking-[0.12em] text-teal-100 uppercase">
      {children}
    </h2>
  );
}

export function SidebarPreview({ data }: { data: CvData }) {
  const { personalInfo, experience, education, skills, projects, languages, certifications } = data;

  const contactItems = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(
    Boolean,
  );
  const skillGroups = groupSkills(skills);

  return (
    <div className="mx-auto flex w-full flex-col bg-white text-neutral-900 shadow-sm sm:w-[8.5in] sm:max-w-full sm:flex-row">
      <aside className="flex flex-col gap-5 bg-teal-800 p-6 text-white sm:w-[2.6in] sm:shrink-0 sm:p-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {personalInfo.fullName || "Your Name"}
          </h1>
          {personalInfo.headline && (
            <p className="mt-1 text-[12px] text-teal-100">{personalInfo.headline}</p>
          )}
        </div>

        {(contactItems.length > 0 || personalInfo.links.length > 0) && (
          <div>
            <SideHeading>Contact</SideHeading>
            <div className="space-y-1 text-[11.5px] text-teal-50">
              {contactItems.map((item) => (
                <p key={item} className="break-words">{item}</p>
              ))}
              {personalInfo.links.map((link) => (
                <p key={link.id} className="break-words">{link.url}</p>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <SideHeading>Skills</SideHeading>
            <div className="space-y-1.5">
              {skillGroups.map(([group, items]) => (
                <div key={group}>
                  {group !== UNGROUPED_SKILLS && (
                    <p className="text-[10.5px] font-semibold text-teal-200">{group}</p>
                  )}
                  <p className="text-[11.5px] text-teal-50">{items.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <SideHeading>Languages</SideHeading>
            <div className="space-y-0.5 text-[11.5px] text-teal-50">
              {languages.map((l) => (
                <p key={l.id}>
                  {l.name}
                  {l.proficiency && <span className="text-teal-200"> — {l.proficiency}</span>}
                </p>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <SideHeading>Certifications</SideHeading>
            <div className="space-y-1 text-[11.5px] text-teal-50">
              {certifications.map((cert) => (
                <p key={cert.id}>
                  {cert.name}
                  {cert.issuer && <span className="text-teal-200">, {cert.issuer}</span>}
                </p>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 p-6 sm:p-8">
        {personalInfo.summary && (
          <section className="mb-5">
            <p className="text-[13px] leading-relaxed text-neutral-800">{personalInfo.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-5">
            <MainHeading>Experience</MainHeading>
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
            <MainHeading>Education</MainHeading>
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

        {projects.length > 0 && (
          <section className="mb-5">
            <MainHeading>Projects</MainHeading>
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
      </div>
    </div>
  );
}
