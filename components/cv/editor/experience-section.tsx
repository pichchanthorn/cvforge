"use client";

import { Controller, useFieldArray, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField, StringListField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";

export function ExperienceSection({ control }: { control: Control<CvData> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "experience" });

  return (
    <SectionCard
      title="Experience"
      onAdd={() =>
        append({
          id: newId(),
          company: "",
          role: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          bullets: [],
        })
      }
      addLabel="Add experience"
      isEmpty={fields.length === 0}
      emptyLabel="No work experience added yet."
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField control={control} name={`experience.${index}.role`} label="Role" />
            <TextField control={control} name={`experience.${index}.company`} label="Company" />
            <TextField control={control} name={`experience.${index}.location`} label="Location" />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                control={control}
                name={`experience.${index}.startDate`}
                label="Start date"
                placeholder="2023-06"
              />
              <TextField
                control={control}
                name={`experience.${index}.endDate`}
                label="End date"
                placeholder="2024-01"
              />
            </div>
          </div>
          <Controller
            control={control}
            name={`experience.${index}.isCurrent`}
            render={({ field: checkboxField }) => (
              <label className="flex w-fit items-center gap-2 text-sm">
                <Checkbox
                  checked={checkboxField.value}
                  onCheckedChange={(checked) => checkboxField.onChange(checked === true)}
                />
                I currently work here
              </label>
            )}
          />
          <StringListField
            control={control}
            name={`experience.${index}.bullets`}
            label="Achievements"
            addLabel="Add bullet"
            placeholder="Describe an achievement, using numbers where possible"
            multiline
          />
        </ItemCard>
      ))}
    </SectionCard>
  );
}
