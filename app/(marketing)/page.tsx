import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, FileTextIcon, SparklesIcon, DownloadIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  description:
    "CVForge helps students and job seekers build a professional, ATS-friendly CV with live preview and high-quality PDF export.",
};

const features = [
  {
    icon: SparklesIcon,
    title: "Live preview",
    description: "See exactly how your CV looks as you type — no guessing, no round trips.",
  },
  {
    icon: ShieldCheckIcon,
    title: "ATS-friendly template",
    description: "A clean, single-column layout that applicant tracking systems can actually parse.",
  },
  {
    icon: DownloadIcon,
    title: "One-click PDF export",
    description: "Download a polished, print-ready PDF whenever you're ready to apply.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight">CVForge</span>
          <Button size="sm" nativeButton={false} render={<Link href="/editor" />}>
            Open editor
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Build a professional CV in minutes
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            Fill in your details, preview the result instantly, and download a
            polished, ATS-friendly PDF — ready for your next application.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" nativeButton={false} render={<Link href="/editor" />}>
              Start building
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
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FileTextIcon className="size-3.5" />
            CVForge
          </span>
          <span>Your data stays in your browser.</span>
        </div>
      </footer>
    </div>
  );
}
