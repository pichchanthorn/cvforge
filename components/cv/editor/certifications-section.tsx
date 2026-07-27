"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function CertificationsSection({ control }: { control: Control<CvData> }) {
  const t = useT();
  const s = t.sections.certifications;
  const { fields, append, remove } = useFieldArray({ control, name: "certifications" });

  return (
    <SectionCard
      title={s.title}
      onAdd={() =>
        append({ id: newId(), name: "", issuer: "", issueDate: "", credentialUrl: "" })
      }
      addLabel={s.addLabel}
      isEmpty={fields.length === 0}
      emptyLabel={s.emptyLabel}
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)} removeLabel={t.common.remove}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField control={control} name={`certifications.${index}.name`} label={s.name} />
            <TextField control={control} name={`certifications.${index}.issuer`} label={s.issuer} />
            <TextField
              control={control}
              name={`certifications.${index}.issueDate`}
              label={s.issueDate}
              placeholder="2024-02"
            />
            <TextField
              control={control}
              name={`certifications.${index}.credentialUrl`}
              label={s.credentialUrl}
            />
          </div>
        </ItemCard>
      ))}
    </SectionCard>
  );
}
