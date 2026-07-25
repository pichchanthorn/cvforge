"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { SectionCard, ItemCard } from "@/components/cv/editor/section-card";
import { TextField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";

export function CertificationsSection({ control }: { control: Control<CvData> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "certifications" });

  return (
    <SectionCard
      title="Certifications"
      onAdd={() =>
        append({ id: newId(), name: "", issuer: "", issueDate: "", credentialUrl: "" })
      }
      addLabel="Add certification"
      isEmpty={fields.length === 0}
      emptyLabel="No certifications added yet."
    >
      {fields.map((field, index) => (
        <ItemCard key={field.id} onRemove={() => remove(index)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField control={control} name={`certifications.${index}.name`} label="Name" />
            <TextField control={control} name={`certifications.${index}.issuer`} label="Issuer" />
            <TextField
              control={control}
              name={`certifications.${index}.issueDate`}
              label="Issue date"
              placeholder="2024-02"
            />
            <TextField
              control={control}
              name={`certifications.${index}.credentialUrl`}
              label="Credential URL (optional)"
            />
          </div>
        </ItemCard>
      ))}
    </SectionCard>
  );
}
