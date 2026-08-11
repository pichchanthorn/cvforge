"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  SparklesIcon,
  DownloadIcon,
  ShieldCheckIcon,
  LanguagesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Reveal } from "@/components/reveal";
import { useT } from "@/lib/i18n/language-context";
import { useDemoAccount } from "@/lib/demo-account/demo-account-context";

export function LandingContent() {
  const t = useT();
  const { isLoggedIn } = useDemoAccount();

  const features = [
    { icon: SparklesIcon, title: t.landing.featureLivePreviewTitle, description: t.landing.featureLivePreviewDesc },
    { icon: ShieldCheckIcon, title: t.landing.featureAtsTitle, description: t.landing.featureAtsDesc },
    { icon: DownloadIcon, title: t.landing.featurePdfTitle, description: t.landing.featurePdfDesc },
    { icon: LanguagesIcon, title: t.landing.featureBilingualTitle, description: t.landing.featureBilingualDesc },
  ];

  const templateShowcase = [
    { id: "ats-one-column", name: t.templates.atsOneColumn.name, image: "/images/template-ats-classic.webp" },
    { id: "modern", name: t.templates.modern.name, image: "/images/template-modern.webp" },
    { id: "sidebar", name: t.templates.sidebar.name, image: "/images/template-sidebar.webp" },
    { id: "creative", name: t.templates.creative.name, image: "/images/template-creative.webp" },
    { id: "portrait", name: t.templates.portrait.name, image: "/images/template-portrait.webp" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              size="sm"
              variant="ghost"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link href={isLoggedIn ? "/dashboard" : "/login"} />}
            >
              {isLoggedIn ? t.nav.dashboard : t.nav.logIn}
            </Button>
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
            className="pointer-events-none absolute inset-0 -z-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
              backgroundSize: "32px 32px",
              maskImage:
                "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 50% at 50% -10%, oklch(from var(--primary) l c h / 0.16), transparent 70%)",
            }}
          />

          <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-32">
            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center gap-6 text-center duration-700 lg:items-start lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
                {t.landing.footerNote}
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
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

            <div className="animate-in fade-in slide-in-from-bottom-6 relative delay-150 duration-700 lg:justify-self-end">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] blur-2xl"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 70% 70% at 50% 40%, oklch(from var(--primary) l c h / 0.25), transparent 70%)",
                }}
              />
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/50">
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-yellow-400/70" />
                  <span className="size-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-3 truncate rounded-md bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                    cvforge.pichchanthorn.me/editor
                  </span>
                </div>
                <Image
                  src="/images/editor-preview.webp"
                  alt="CVForge editor showing form fields on the left and a live CV preview on the right"
                  width={1800}
                  height={1125}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 py-20 sm:grid-cols-2 sm:py-24 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 100}>
                <Card className="group h-full border-border/60 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex flex-col gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t.landing.templatesTitle}
              </h2>
              <p className="mt-2 text-muted-foreground">{t.landing.templatesSubtitle}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {templateShowcase.map(({ id, name, image }, index) => (
                <Reveal key={id} delay={index * 100}>
                  <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div
                      className="h-56 overflow-hidden"
                      style={{
                        maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                      }}
                    >
                      <Image
                        src={image}
                        alt={name}
                        width={720}
                        height={715}
                        className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="border-t border-border px-4 py-3 text-sm font-medium">{name}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
      </main>

      <SiteFooter />
    </div>
  );
}
