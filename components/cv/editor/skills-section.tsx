"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/cv/editor/section-card";
import { TextField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";

export function SkillsSection({ control }: { control: Control<CvData> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });

  return (
    <SectionCard
      title="Skills"
      description="Group related skills together, e.g. Languages, Frameworks, Tools."
      onAdd={() => append({ id: newId(), name: "", groupName: "" })}
      addLabel="Add skill"
      isEmpty={fields.length === 0}
      emptyLabel="No skills added yet."
    >
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <TextField
              control={control}
              name={`skills.${index}.name`}
              label="Skill"
              placeholder="TypeScript"
              className="flex-1"
            />
            <TextField
              control={control}
              name={`skills.${index}.groupName`}
              label="Group (optional)"
              placeholder="Languages"
              className="w-40 shrink-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="mb-0.5 text-muted-foreground hover:text-destructive"
              aria-label="Remove skill"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
