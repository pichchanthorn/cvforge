"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { useT } from "@/lib/i18n/language-context";

type Section = { heading: string; body: string };

export function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
  contactNote,
}: {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: Section[];
  contactNote?: boolean;
}) {
  const t = useT();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t.legal.backHome}
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">{lastUpdated}</p>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-8 flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm font-semibold">{section.heading}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {section.body}
                {contactNote && section === sections[sections.length - 1] && (
                  <>
                    {" "}
                    <a
                      href="mailto:chanthornpich22@gmail.com"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      chanthornpich22@gmail.com
                    </a>
                  </>
                )}
              </p>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
