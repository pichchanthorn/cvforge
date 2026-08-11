"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  className?: string;
};

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  type = "text",
  disabled,
}: BaseProps<T> & { type?: string; disabled?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} data-disabled={disabled} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            value={typeof field.value === "boolean" ? undefined : (field.value ?? "")}
            id={field.name}
            type={type}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
          />
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  rows = 3,
}: BaseProps<T> & { rows?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Textarea
            {...field}
            value={typeof field.value === "string" ? field.value : ""}
            id={field.name}
            rows={rows}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

/** A repeatable list of plain strings (e.g. bullet points, tech tags). */
export function StringListField<T extends FieldValues>({
  control,
  name,
  label,
  addLabel = "Add",
  placeholder,
  multiline = false,
}: BaseProps<T> & { addLabel?: string; multiline?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const items: string[] = Array.isArray(field.value) ? field.value : [];
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{label}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.onChange([...items, ""])}
              >
                <PlusIcon className="size-4" />
                {addLabel}
              </Button>
            </div>
            {items.map((item, index) => {
              const onChangeItem = (value: string) => {
                const next = [...items];
                next[index] = value;
                field.onChange(next);
              };
              const onRemoveItem = () =>
                field.onChange(items.filter((_, i) => i !== index));

              return (
                <div key={index} className="flex items-start gap-2">
                  {multiline ? (
                    <Textarea
                      value={item}
                      onChange={(e) => onChangeItem(e.target.value)}
                      rows={2}
                      placeholder={placeholder}
                      className="flex-1"
                    />
                  ) : (
                    <Input
                      value={item}
                      onChange={(e) => onChangeItem(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1"
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemoveItem}
                    aria-label={`Remove ${label.toLowerCase()} item`}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        );
      }}
    />
  );
}
