"use client";

import { Controller, type Control } from "react-hook-form";
import { CheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { templateIds, templateRegistry } from "@/lib/cv/templates";
import type { CvData, TemplateId } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

const translationKeyByTemplate: Record<
  TemplateId,
  "atsOneColumn" | "modern" | "sidebar" | "creative"
> = {
  "ats-one-column": "atsOneColumn",
  modern: "modern",
  sidebar: "sidebar",
  creative: "creative",
};

export function TemplatePicker({ control }: { control: Control<CvData> }) {
  const t = useT();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.templates.sectionTitle}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{t.templates.sectionDescription}</p>
      </CardHeader>
      <CardContent>
        <Controller
          control={control}
          name="templateId"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templateIds.map((id) => {
                const { swatch } = templateRegistry[id];
                const label = t.templates[translationKeyByTemplate[id]];
                const isSelected = field.value === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => field.onChange(id)}
                    className={cn(
                      "flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-foreground/30",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-full overflow-hidden rounded-sm">
                        <span className="w-2/5" style={{ backgroundColor: swatch[0] }} />
                        <span className="flex-1" style={{ backgroundColor: swatch[1] }} />
                      </div>
                      {isSelected && (
                        <CheckIcon className="ml-2 size-4 shrink-0 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label.name}</p>
                      <p className="text-xs text-muted-foreground">{label.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
