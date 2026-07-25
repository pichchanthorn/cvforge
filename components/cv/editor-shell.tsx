"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cvDataSchema, type CvData } from "@/lib/cv/schema";
import { loadCv, saveCv } from "@/lib/cv/storage";
import { createSampleCv } from "@/lib/cv/sample-data";
import { AtsOneColumnPreview } from "@/components/cv/preview/ats-one-column";
import { AtsOneColumnDocument } from "@/components/pdf/templates/ats-one-column";
import { PersonalInfoSection } from "@/components/cv/editor/personal-info-section";
import { ExperienceSection } from "@/components/cv/editor/experience-section";
import { EducationSection } from "@/components/cv/editor/education-section";
import { SkillsSection } from "@/components/cv/editor/skills-section";
import { ProjectsSection } from "@/components/cv/editor/projects-section";
import { LanguagesSection } from "@/components/cv/editor/languages-section";
import { CertificationsSection } from "@/components/cv/editor/certifications-section";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved";

function sanitizeFilename(name: string) {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9\- _]/g, "").replace(/\s+/g, "-");
  return cleaned || "cv";
}

export function CvEditorShell() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isDownloading, setIsDownloading] = useState(false);
  const hasMounted = useRef(false);

  const form = useForm<CvData>({
    resolver: zodResolver(cvDataSchema),
    mode: "onBlur",
    defaultValues: () => Promise.resolve(loadCv() ?? createSampleCv()),
  });

  const values = useWatch({ control: form.control }) as CvData;

  useEffect(() => {
    if (!hasMounted.current) {
      // Skip the save-on-mount tick — nothing has changed yet.
      hasMounted.current = true;
      return;
    }
    setSaveStatus("saving");
    const timeout = setTimeout(() => {
      saveCv(values);
      setSaveStatus("saved");
    }, 500);
    return () => clearTimeout(timeout);
  }, [values]);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const data = form.getValues();
      const blob = await pdf(<AtsOneColumnDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(data.personalInfo.fullName)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Couldn't generate the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  if (form.formState.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading your CV…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
            CVForge
          </Link>
          <Input
            value={values?.title ?? ""}
            onChange={(e) => form.setValue("title", e.target.value, { shouldDirty: true })}
            className="h-8 w-40 border-none bg-transparent text-sm font-medium shadow-none focus-visible:ring-1 sm:w-56"
            aria-label="CV title"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {saveStatus === "saving" ? "Saving…" : "Saved locally"}
          </span>
          <Button onClick={handleDownload} disabled={isDownloading} size="sm">
            <DownloadIcon className="size-4" />
            {isDownloading ? "Preparing…" : "Download PDF"}
          </Button>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
        className="lg:hidden"
      >
        <TabsList className="mx-4 mt-3 w-[calc(100%-2rem)]">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">
            <FileTextIcon className="size-4" />
            Preview
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <div className={cn("flex flex-col gap-4", activeTab !== "edit" && "hidden lg:flex")}>
          <PersonalInfoSection control={form.control} />
          <ExperienceSection control={form.control} />
          <EducationSection control={form.control} />
          <SkillsSection control={form.control} />
          <ProjectsSection control={form.control} />
          <LanguagesSection control={form.control} />
          <CertificationsSection control={form.control} />
        </div>

        <div
          className={cn(
            "lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-auto lg:rounded-lg lg:border lg:border-border",
            activeTab !== "preview" && "hidden lg:block",
          )}
        >
          <AtsOneColumnPreview data={values ?? createSampleCv()} />
        </div>
      </main>
    </div>
  );
}
