"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { TextField, TextareaField } from "@/components/cv/editor/controlled-field";
import { newId, type CvData } from "@/lib/cv/schema";

export function PersonalInfoSection({ control }: { control: Control<CvData> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "personalInfo.links",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal info</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField control={control} name="personalInfo.fullName" label="Full name" />
          <TextField control={control} name="personalInfo.headline" label="Headline" placeholder="e.g. Frontend Developer" />
          <TextField control={control} name="personalInfo.email" label="Email" type="email" />
          <TextField control={control} name="personalInfo.phone" label="Phone" />
          <TextField control={control} name="personalInfo.location" label="Location" placeholder="City, State" />
        </div>
        <TextareaField
          control={control}
          name="personalInfo.summary"
          label="Summary"
          placeholder="A 2-3 sentence pitch of who you are and what you're looking for."
          rows={4}
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Links</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ id: newId(), label: "", url: "" })}
            >
              <PlusIcon className="size-4" />
              Add link
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <TextField
                control={control}
                name={`personalInfo.links.${index}.label`}
                label="Label"
                placeholder="Portfolio"
                className="w-32 shrink-0"
              />
              <TextField
                control={control}
                name={`personalInfo.links.${index}.url`}
                label="URL"
                placeholder="yoursite.com"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="mb-0.5 text-muted-foreground hover:text-destructive"
                aria-label="Remove link"
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
