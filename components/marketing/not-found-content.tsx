"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { useT } from "@/lib/i18n/language-context";

export function NotFoundContent() {
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

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <span className="text-sm font-semibold text-primary">404</span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t.notFound.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.notFound.subtitle}</p>
        <Button className="group mt-2" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {t.notFound.cta}
        </Button>
      </main>

      <SiteFooter />
    </div>
  );
}
