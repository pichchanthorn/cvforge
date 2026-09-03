"use client";

import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { BriefcaseIcon, ChevronDownIcon, Trash2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard } from "@/components/cv/editor/section-card";
import { TextField, StringListField } from "@/components/cv/editor/controlled-field";
import { sectionAnchorId } from "@/lib/cv/progress";
import { formatDateRange } from "@/lib/cv/format";
import { newId, type CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";
import type { Translations } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

type ExperienceCopy = Translations["sections"]["experience"];

function ExperienceEntryCard({
  control,
  setValue,
  index,
  fieldId,
  expanded,
  onToggle,
  onRemove,
  hasErrors,
  s,
  removeLabel,
}: {
  control: Control<CvData>;
  setValue: UseFormSetValue<CvData>;
  index: number;
  fieldId: string;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  hasErrors: boolean;
  s: ExperienceCopy;
  removeLabel: string;
}) {
  const values = useWatch({ control, name: `experience.${index}` });
  const role = values?.role?.trim() ?? "";
  const company = values?.company?.trim() ?? "";
  const dateRange = formatDateRange(values?.startDate ?? "", values?.endDate ?? "", values?.isCurrent ?? false);
  const primaryLabel = role || company || s.newEntryLabel;
  const secondaryLabel = role && company ? company : "";
  const headerId = `experience-header-${fieldId}`;
  const contentId = `experience-content-${fieldId}`;

  return (
    <div className="rounded-lg border border-border bg-muted/30">
      <div className="flex items-stretch">
        <button
          type="button"
          id={headerId}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-1.5 truncate font-medium">
              {hasErrors && (
                <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden />
              )}
              <span className="truncate">{primaryLabel}</span>
            </span>
            {secondaryLabel && <span className="truncate text-sm text-muted-foreground">{secondaryLabel}</span>}
            {dateRange && <span className="text-xs text-muted-foreground">{dateRange}</span>}
            {hasErrors && <span className="text-xs text-destructive">{s.entryHasErrors}</span>}
          </div>
          <ChevronDownIcon
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
              expanded && "rotate-180",
            )}
          />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={primaryLabel ? `${removeLabel}: ${primaryLabel}` : removeLabel}
          className="flex items-center px-3 text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-4" aria-hidden />
        </button>
      </div>
      {expanded && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="flex flex-col gap-4 border-t border-border p-4"
        >
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
            helperText={s.achievementsTip}
            multiline
          />
        </div>
      )}
    </div>
  );
}

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
  const { errors } = useFormState({ control, name: "experience" });
  const projects = useWatch({ control, name: "projects" }) ?? [];
  const isProjectsFilled = projects.some((item) => item?.name?.trim());

  // Tracked by array position rather than field.id: both mutations below are
  // synchronous with the useFieldArray call that changes the array shape, so
  // indices never go stale between a mutation and its bookkeeping here.
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(() => new Set());

  function toggle(index: number) {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleAdd() {
    const newIndex = fields.length;
    append({
      id: newId(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      bullets: [],
    });
    setExpandedIndices((prev) => new Set(prev).add(newIndex));
  }

  function handleRemove(index: number) {
    remove(index);
    setExpandedIndices((prev) => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i === index) continue;
        next.add(i > index ? i - 1 : i);
      }
      return next;
    });
  }

  return (
    <SectionCard
      id={sectionAnchorId("experience")}
      title={s.title}
      onAdd={handleAdd}
      addLabel={s.addLabel}
      isEmpty={fields.length === 0}
      emptyLabel={isProjectsFilled ? s.emptyLabelProjectsCovered : s.emptyLabel}
      emptyIcon={<BriefcaseIcon className="size-4 shrink-0 opacity-70" aria-hidden />}
    >
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <ExperienceEntryCard
            key={field.id}
            control={control}
            setValue={setValue}
            index={index}
            fieldId={field.id}
            expanded={expandedIndices.has(index)}
            onToggle={() => toggle(index)}
            onRemove={() => handleRemove(index)}
            hasErrors={Boolean(errors.experience?.[index])}
            s={s}
            removeLabel={t.common.remove}
          />
        ))}
      </div>
    </SectionCard>
  );
}
