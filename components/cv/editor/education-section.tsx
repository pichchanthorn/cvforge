"use client";

import { Controller, useFieldArray, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField, TextareaField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function EducationSection({ control }: { control: Control<CvData> }) {
  const t = useT();
  const s = t.sections.education;
  const { fields, append, remove } = useFieldArray({ control, name: "education" });

  return (
    <SectionCard
      title={s.title}
      onAdd={() =>
        append({
          id: newId(),
          institution: "",
          degree: "",
          fieldOfStudy: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          description: "",
        })
      }
      addLabel={s.addLabel}
      isEmpty={fields.length === 0}
      emptyLabel={s.emptyLabel}
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)} removeLabel={t.common.remove}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField control={control} name={`education.${index}.institution`} label={s.institution} />
            <TextField control={control} name={`education.${index}.degree`} label={s.degree} placeholder="B.S." />
            <TextField
              control={control}
              name={`education.${index}.fieldOfStudy`}
              label={s.fieldOfStudy}
            />
            <TextField control={control} name={`education.${index}.location`} label={s.location} />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                control={control}
                name={`education.${index}.startDate`}
                label={s.startDate}
                placeholder="2021-08"
              />
              <TextField
                control={control}
                name={`education.${index}.endDate`}
                label={s.endDate}
                placeholder="2025-05"
              />
            </div>
          </div>
          <Controller
            control={control}
            name={`education.${index}.isCurrent`}
            render={({ field: checkboxField }) => (
              <label className="flex w-fit items-center gap-2 text-sm">
                <Checkbox
                  checked={checkboxField.value}
                  onCheckedChange={(checked) => checkboxField.onChange(checked === true)}
                />
                {s.current}
              </label>
            )}
          />
          <TextareaField
            control={control}
            name={`education.${index}.description`}
            label={s.description}
            placeholder={s.descriptionPlaceholder}
            rows={2}
          />
        </ItemCard>
      ))}
    </SectionCard>
  );
}
