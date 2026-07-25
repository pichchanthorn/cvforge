"use client";

import { Controller, useFieldArray, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField, TextareaField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";

export function EducationSection({ control }: { control: Control<CvData> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "education" });

  return (
    <SectionCard
      title="Education"
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
      addLabel="Add education"
      isEmpty={fields.length === 0}
      emptyLabel="No education added yet."
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField control={control} name={`education.${index}.institution`} label="Institution" />
            <TextField control={control} name={`education.${index}.degree`} label="Degree" placeholder="B.S." />
            <TextField
              control={control}
              name={`education.${index}.fieldOfStudy`}
              label="Field of study"
            />
            <TextField control={control} name={`education.${index}.location`} label="Location" />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                control={control}
                name={`education.${index}.startDate`}
                label="Start date"
                placeholder="2021-08"
              />
              <TextField
                control={control}
                name={`education.${index}.endDate`}
                label="End date"
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
                I currently study here
              </label>
            )}
          />
          <TextareaField
            control={control}
            name={`education.${index}.description`}
            label="Description"
            placeholder="Relevant coursework, honors, activities"
            rows={2}
          />
        </ItemCard>
      ))}
    </SectionCard>
  );
}
