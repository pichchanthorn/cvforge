"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionCard({
  id,
  title,
  description,
  onAdd,
  addLabel = "Add",
  isEmpty,
  emptyLabel,
  emptyIcon,
  children,
}: {
  /** Anchor id, e.g. so the progress navigator can scroll to this section. */
  id?: string;
  title: string;
  description?: string;
  onAdd: () => void;
  addLabel?: string;
  isEmpty: boolean;
  emptyLabel: string;
  /** Optional icon shown beside `emptyLabel` so the empty state isn't bare text. */
  emptyIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card id={id}>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <PlusIcon className="size-4" />
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isEmpty ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {emptyIcon}
            {emptyLabel}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function ItemCard({
  onRemove,
  removeLabel = "Remove",
  className,
  children,
}: {
  onRemove: () => void;
  removeLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4",
        className,
      )}
    >
      {children}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-4" />
          {removeLabel}
        </Button>
      </div>
    </div>
  );
}
