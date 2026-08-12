"use client";

import { Controller, useFieldArray, type Control, type UseFormSetValue } from "react-hook-form";
import { BriefcaseIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField, StringListField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function ExperienceSection({
  control,
  setValue,
}: {
  control: Control<CvData>;
  setValue: UseFormSetValue<CvData>;
}) {
  const t = useT();
  const s = t.sections.experience;
  const { fields, append, remove } = useFieldArray({ control, name: "experience" });

  return (
    <SectionCard
      title={s.title}
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
      addLabel={s.addLabel}
      isEmpty={fields.length === 0}
      emptyLabel={s.emptyLabel}
      emptyIcon={<BriefcaseIcon className="size-4 shrink-0 opacity-70" aria-hidden />}
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)} removeLabel={t.common.remove}>
          <Controller
            control={control}
            name={`experience.${index}.isCurrent`}
            render={({ field: checkboxField }) => (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField control={control} name={`experience.${index}.role`} label={s.role} />
                  <TextField control={control} name={`experience.${index}.company`} label={s.company} />
                  <TextField control={control} name={`experience.${index}.location`} label={s.location} />
                  <div className="grid grid-cols-2 gap-2">
                    <TextField
                      control={control}
                      name={`experience.${index}.startDate`}
                      label={s.startDate}
                      placeholder="2023-06"
                    />
                    <TextField
                      control={control}
                      name={`experience.${index}.endDate`}
                      label={s.endDate}
                      placeholder="2024-01"
                      disabled={checkboxField.value}
                    />
                  </div>
                </div>
                <label className="flex w-fit items-center gap-2 text-sm">
                  <Checkbox
                    checked={checkboxField.value}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      checkboxField.onChange(isChecked);
                      if (isChecked) {
                        setValue(`experience.${index}.endDate`, "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                  {s.current}
                </label>
              </>
            )}
          />
          <StringListField
            control={control}
            name={`experience.${index}.bullets`}
            label={s.achievements}
            addLabel={s.addBullet}
            placeholder={s.bulletPlaceholder}
            multiline
          />
        </ItemCard>
      ))}
    </SectionCard>
  );
}
