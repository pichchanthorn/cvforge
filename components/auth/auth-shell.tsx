"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { useT } from "@/lib/i18n/language-context";

export function AuthShell({ children }: { children: React.ReactNode }) {
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

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t.legal.backHome}
        </Link>

        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
