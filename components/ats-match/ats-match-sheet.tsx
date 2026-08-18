"use client";

import { useState } from "react";
import { Loader2Icon, SearchCheckIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TurnstileWidget } from "@/components/ats-match/turnstile-widget";
import { toAtsMatchPayload } from "@/lib/cv/ats-match";
import { fetchAtsMatch } from "@/lib/cv/ats-match-client";
import type { AtsMatchResponse, AtsMatchError } from "@/lib/cv/ats-match";
import type { CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function AtsMatchSheet({ cv }: { cv: CvData }) {
  const t = useT();
  const s = t.atsMatch;

  const [jobDescription, setJobDescription] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsMatchResponse | null>(null);
  const [error, setError] = useState<AtsMatchError | null>(null);

  async function handleSubmit() {
    if (!jobDescription.trim() || !turnstileToken) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const outcome = await fetchAtsMatch(jobDescription, toAtsMatchPayload(cv), turnstileToken);
    setLoading(false);
    if (outcome.ok) {
      setResult(outcome.data);
    } else {
      setError(outcome.error);
    }
  }

  function errorMessage(code: AtsMatchError["code"]): string {
    switch (code) {
      case "rate_limited":
        return s.errorRateLimited;
      case "invalid_input":
        return s.errorInvalidInput;
      case "upstream_error":
        return s.errorUpstream;
    }
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" aria-label={s.triggerLabel} />
        }
      >
        <SearchCheckIcon className="size-4" />
        {/* Label hidden below sm so this doesn't reintroduce the header
            overflow the save indicator caused (see editor-shell.tsx). */}
        <span className="hidden sm:inline">{s.triggerLabel}</span>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{s.sheetTitle}</SheetTitle>
          <SheetDescription>{s.sheetDescription}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ats-job-description" className="text-sm font-medium">
              {s.jobDescriptionLabel}
            </label>
            <Textarea
              id="ats-job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={s.jobDescriptionPlaceholder}
              rows={8}
              maxLength={10_000}
            />
          </div>

          <TurnstileWidget onToken={setTurnstileToken} />

          <Button
            onClick={handleSubmit}
            disabled={loading || !jobDescription.trim() || !turnstileToken}
          >
            {loading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {s.checkingLabel}
              </>
            ) : (
              s.submitLabel
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage(error.code)}
            </p>
          )}

          {!result && !error && !loading && (
            <p className="text-sm text-muted-foreground">{s.emptyState}</p>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium">{s.scoreLabel}</p>
                <p
                  className={cn(
                    "text-3xl font-bold tracking-tight",
                    result.score >= 70
                      ? "text-emerald-600 dark:text-emerald-400"
                      : result.score >= 40
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-destructive",
                  )}
                >
                  {result.score}%
                </p>
              </div>

              {result.matchedKeywords.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium">{s.matchedKeywordsLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((kw) => (
                      <Badge key={kw} variant="secondary">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium">{s.missingKeywordsLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw) => (
                      <Badge key={kw} variant="outline">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium">{s.suggestionsLabel}</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
