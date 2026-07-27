"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField, TextareaField, StringListField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function ProjectsSection({ control }: { control: Control<CvData> }) {
  const t = useT();
  const s = t.sections.projects;
  const { fields, append, remove } = useFieldArray({ control, name: "projects" });

  return (
    <SectionCard
      title={s.title}
      onAdd={() =>
        append({
          id: newId(),
          name: "",
          description: "",
          url: "",
          tech: [],
          startDate: "",
          endDate: "",
        })
      }
      addLabel={s.addLabel}
      isEmpty={fields.length === 0}
      emptyLabel={s.emptyLabel}
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)} removeLabel={t.common.remove}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField control={control} name={`projects.${index}.name`} label={s.name} />
            <TextField control={control} name={`projects.${index}.url`} label={s.url} placeholder="github.com/you/project" />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                control={control}
                name={`projects.${index}.startDate`}
                label={s.startDate}
                placeholder="2026-01"
              />
              <TextField
                control={control}
                name={`projects.${index}.endDate`}
                label={s.endDate}
                placeholder="2026-04"
              />
            </div>
          </div>
          <TextareaField
            control={control}
            name={`projects.${index}.description`}
            label={s.description}
            rows={2}
          />
          <StringListField
            control={control}
            name={`projects.${index}.tech`}
            label={s.tech}
            addLabel={s.addTech}
            placeholder="Next.js"
          />
        </ItemCard>
      ))}
    </SectionCard>
  );
}
