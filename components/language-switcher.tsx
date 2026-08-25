"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border p-0.5 text-xs",
        className,
      )}
    >
      <Button
        type="button"
        size="sm"
        variant={language === "en" ? "secondary" : "ghost"}
        className="h-7 px-2 text-xs"
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
      <Button
        type="button"
        size="sm"
        variant={language === "km" ? "secondary" : "ghost"}
        lang="km"
        // Kantumruy Pro renders visually lighter/smaller than Geist Sans at
        // the same declared size and weight — bump both up slightly so the
        // two labels read as the same visual weight, not just the same CSS
        // font-size.
        className="h-7 px-2 font-[family-name:var(--font-khmer)] text-sm font-semibold"
        onClick={() => setLanguage("km")}
      >
        ខ្មែរ
      </Button>
    </div>
  );
}
