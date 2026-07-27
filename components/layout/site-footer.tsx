"use client";

import Link from "next/link";
import { FileTextIcon } from "lucide-react";
import { useT } from "@/lib/i18n/language-context";

const CONTACT_EMAIL = "chanthornpich22@gmail.com";
const CREATOR_NAME = "Chanthorn Pich";
const CREATOR_URL = "https://pichchanthorn.me";

export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <FileTextIcon className="size-4" />
            CVForge
          </span>
          <p className="max-w-xs text-xs text-muted-foreground">{t.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/legal/privacy" className="hover:text-foreground">
            {t.footer.privacy}
          </Link>
          <Link href="/legal/terms" className="hover:text-foreground">
            {t.footer.terms}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
            {t.footer.contact}
          </a>
        </nav>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} CVForge. {t.footer.rights}
          </span>
          <span>
            {t.footer.builtBy}{" "}
            <a
              href={CREATOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground"
            >
              {CREATOR_NAME}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
