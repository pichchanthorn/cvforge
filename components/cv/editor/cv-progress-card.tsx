"use client";

import { CheckIcon, CircleIcon } from "lucide-react";
import { useWatch, type Control } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { badgeVariants } from "@/components/ui/badge";
import {
  ALL_SECTION_KEYS,
  computeCvReadiness,
  isSectionComplete,
  isSectionOptional,
  sectionAnchorId,
  type CvSectionKey,
} from "@/lib/cv/progress";
import type { CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

function scrollToSection(key: CvSectionKey) {
  document.getElementById(sectionAnchorId(key))?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CvProgressCard({ control }: { control: Control<CvData> }) {
  const t = useT();
  const s = t.sections;
  const p = t.progress;
  const data = useWatch({ control }) as CvData;
  const { percent, isReady } = computeCvReadiness(data);

  function renderChip(key: CvSectionKey) {
    const complete = isSectionComplete(key, data);
    const optional = isSectionOptional(key, data);
    const statusLabel = complete ? p.complete : optional ? p.notAdded : p.needsAttention;
    return (
      <button
        key={key}
        type="button"
        onClick={() => scrollToSection(key)}
        className={cn(
          badgeVariants({ variant: complete ? "secondary" : "outline" }),
          "cursor-pointer gap-1",
          complete && "text-emerald-700 dark:text-emerald-400",
        )}
        aria-label={optional ? `${s[key].title} — ${statusLabel} (${p.optionalTag})` : `${s[key].title} — ${statusLabel}`}
      >
        {complete ? <CheckIcon aria-hidden className="size-3" /> : <CircleIcon aria-hidden className="size-3" />}
        {s[key].title}
        {optional && <span className="text-muted-foreground">· {p.optionalTag}</span>}
      </button>
    );
  }

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{p.title}</span>
          {isReady ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckIcon aria-hidden className="size-3.5" />
              {p.readyLabel}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{p.progressLabel.replace("{percent}", String(percent))}</span>
          )}
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${percent}%`}
          aria-label={p.title}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none",
              isReady ? "bg-emerald-600 dark:bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-0.5">{ALL_SECTION_KEYS.map((key) => renderChip(key))}</div>
      </CardContent>
    </Card>
  );
}
