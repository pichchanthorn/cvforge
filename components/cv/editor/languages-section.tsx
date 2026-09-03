"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { LanguagesIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/cv/editor/section-card";
import { TextField } from "@/components/cv/editor/controlled-field";
import { sectionAnchorId } from "@/lib/cv/progress";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function LanguagesSection({ control }: { control: Control<CvData> }) {
  const t = useT();
  const s = t.sections.languages;
  const { fields, append, remove } = useFieldArray({ control, name: "languages" });

  return (
    <SectionCard
      id={sectionAnchorId("languages")}
      title={s.title}
      onAdd={() => append({ id: newId(), name: "", proficiency: "" })}
      addLabel={s.addLabel}
      isEmpty={fields.length === 0}
      emptyLabel={s.emptyLabel}
      emptyIcon={<LanguagesIcon className="size-4 shrink-0 opacity-70" aria-hidden />}
    >
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <TextField
              control={control}
              name={`languages.${index}.name`}
              label={s.language}
              placeholder="Spanish"
              className="flex-1"
            />
            <TextField
              control={control}
              name={`languages.${index}.proficiency`}
              label={s.proficiency}
              placeholder="Fluent"
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
