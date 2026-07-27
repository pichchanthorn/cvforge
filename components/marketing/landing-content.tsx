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
import { Reveal } from "@/components/reveal";
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
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
          >
            <div className="size-[420px] rounded-full bg-primary/25 blur-[110px] motion-safe:animate-[hero-float_11s_ease-in-out_infinite] dark:bg-primary/20" />
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center gap-6 duration-700">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {t.landing.heroTitle}
              </h1>
              <p className="max-w-xl text-balance text-lg text-muted-foreground">
                {t.landing.heroSubtitle}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="group"
                  nativeButton={false}
                  render={<Link href="/editor" />}
                >
                  {t.landing.startBuilding}
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 py-16 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 100}>
                <Card className="group h-full border-border/60 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex flex-col gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <PricingSection />
      </main>

      <SiteFooter />
    </div>
  );
}
