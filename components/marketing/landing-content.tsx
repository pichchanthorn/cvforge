"use client";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, DownloadIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { PricingSection } from "@/components/marketing/pricing-section";
import { useT } from "@/lib/i18n/language-context";

export function LandingContent() {
  const t = useT();

  const features = [
    { icon: SparklesIcon, title: t.landing.featureLivePreviewTitle, description: t.landing.featureLivePreviewDesc },
    { icon: ShieldCheckIcon, title: t.landing.featureAtsTitle, description: t.landing.featureAtsDesc },
    { icon: DownloadIcon, title: t.landing.featurePdfTitle, description: t.landing.featurePdfDesc },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button size="sm" nativeButton={false} render={<Link href="/editor" />}>
              {t.nav.openEditor}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t.landing.heroTitle}
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            {t.landing.heroSubtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" nativeButton={false} render={<Link href="/editor" />}>
              {t.landing.startBuilding}
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 py-16 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-border/60 shadow-none">
                <CardContent className="flex flex-col gap-2">
                  <Icon className="size-5 text-foreground" />
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <PricingSection />
      </main>

      <SiteFooter />
    </div>
  );
}
