"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { TextField, TextareaField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function PersonalInfoSection({ control }: { control: Control<CvData> }) {
  const t = useT();
  const f = t.sections.personalInfoFields;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "personalInfo.links",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.sections.personalInfo.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField control={control} name="personalInfo.fullName" label={f.fullName} />
          <TextField
            control={control}
            name="personalInfo.headline"
            label={f.headline}
            placeholder={f.headlinePlaceholder}
          />
          <TextField control={control} name="personalInfo.email" label={f.email} type="email" />
          <TextField control={control} name="personalInfo.phone" label={f.phone} />
          <TextField
            control={control}
            name="personalInfo.location"
            label={f.location}
            placeholder={f.locationPlaceholder}
          />
        </div>
        <TextareaField
          control={control}
          name="personalInfo.summary"
          label={f.summary}
          placeholder={f.summaryPlaceholder}
          rows={4}
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{f.links}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ id: newId(), label: "", url: "" })}
            >
              <PlusIcon className="size-4" />
              {f.addLink}
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <TextField
                control={control}
                name={`personalInfo.links.${index}.label`}
                label={f.linkLabel}
                placeholder={f.linkLabelPlaceholder}
                className="w-32 shrink-0"
              />
              <TextField
                control={control}
                name={`personalInfo.links.${index}.url`}
                label={f.linkUrl}
                placeholder={f.linkUrlPlaceholder}
                className="flex-1"
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
      </CardContent>
    </Card>
  );
}
