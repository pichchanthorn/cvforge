"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField, TextareaField, StringListField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";

export function ProjectsSection({ control }: { control: Control<CvData> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "projects" });

  return (
    <SectionCard
      title="Projects"
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
      addLabel="Add project"
      isEmpty={fields.length === 0}
      emptyLabel="No projects added yet."
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField control={control} name={`projects.${index}.name`} label="Project name" />
            <TextField control={control} name={`projects.${index}.url`} label="URL" placeholder="github.com/you/project" />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                control={control}
                name={`projects.${index}.startDate`}
                label="Start date"
                placeholder="2026-01"
              />
              <TextField
                control={control}
                name={`projects.${index}.endDate`}
                label="End date"
                placeholder="2026-04"
              />
            </div>
          </div>
          <TextareaField
            control={control}
            name={`projects.${index}.description`}
            label="Description"
            rows={2}
          />
          <StringListField
            control={control}
            name={`projects.${index}.tech`}
            label="Technologies"
            addLabel="Add technology"
            placeholder="Next.js"
          />
        </ItemCard>
      ))}
    </SectionCard>
  );
}
