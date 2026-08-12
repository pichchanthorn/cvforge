"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { SparklesIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/cv/editor/section-card";
import { TextField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function SkillsSection({ control }: { control: Control<CvData> }) {
  const t = useT();
  const s = t.sections.skills;
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });

  return (
    <SectionCard
      title={s.title}
      description={s.description}
      onAdd={() => append({ id: newId(), name: "", groupName: "" })}
      addLabel={s.addLabel}
      isEmpty={fields.length === 0}
      emptyLabel={s.emptyLabel}
      emptyIcon={<SparklesIcon className="size-4 shrink-0 opacity-70" aria-hidden />}
    >
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <TextField
              control={control}
              name={`skills.${index}.name`}
              label={s.skill}
              placeholder="TypeScript"
              className="flex-1"
            />
            <TextField
              control={control}
              name={`skills.${index}.groupName`}
              label={s.group}
              placeholder="Languages"
              className="w-40 shrink-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="mb-0.5 text-muted-foreground hover:text-destructive"
              aria-label={t.common.remove}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
