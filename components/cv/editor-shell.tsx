"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { CheckIcon, ChevronDownIcon, DownloadIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cvDataSchema, type CvData } from "@/lib/cv/schema";
import { loadCv, saveCv, cvStorageKey } from "@/lib/cv/storage";
import { useDemoAccount } from "@/lib/demo-account/demo-account-context";
import { createSampleCv } from "@/lib/cv/sample-data";
import { templateRegistry } from "@/lib/cv/templates";
import { generateCvDocx } from "@/lib/docx/generate-cv-docx";
import { TemplatePicker } from "@/components/cv/editor/template-picker";
import { PersonalInfoSection } from "@/components/cv/editor/personal-info-section";
import { ExperienceSection } from "@/components/cv/editor/experience-section";
import { EducationSection } from "@/components/cv/editor/education-section";
import { SkillsSection } from "@/components/cv/editor/skills-section";
import { ProjectsSection } from "@/components/cv/editor/projects-section";
import { LanguagesSection } from "@/components/cv/editor/languages-section";
import { CertificationsSection } from "@/components/cv/editor/certifications-section";
import { AtsMatchSheet } from "@/components/ats-match/ats-match-sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved";

function sanitizeFilename(name: string) {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9\- _]/g, "").replace(/\s+/g, "-");
  return cleaned || "cv";
}

function isIOSSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return isIOSDevice;
}

export function CvEditorShell() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isDownloading, setIsDownloading] = useState(false);
  const hasMounted = useRef(false);
  const { account } = useDemoAccount();
  // Logged-in demo accounts get their own CV, namespaced by email, so
  // switching accounts on the same browser doesn't share one CV. Read once —
  // this page never renders on the server, so `account` is already correct
  // on the very first client render.
  const [storageKey] = useState(() => cvStorageKey(account?.email));

  const form = useForm<CvData>({
    resolver: zodResolver(cvDataSchema),
    mode: "onBlur",
    defaultValues: () => Promise.resolve(loadCv(storageKey) ?? createSampleCv()),
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
      saveCv(values, storageKey);
      setSaveStatus("saved");
    }, 500);
    return () => clearTimeout(timeout);
  }, [values, storageKey]);

  // "saved" is the brief confirmation window that shows the checkmark; it
  // decays back to "idle" so the switch from "Saving…" reads as a completed
  // action rather than a silent text swap. Both states render the same label.
  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timeout = setTimeout(() => setSaveStatus("idle"), 1500);
    return () => clearTimeout(timeout);
  }, [saveStatus]);

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const onIOS = isIOSSafari();

    if (onIOS) {
      // iOS Safari doesn't reliably honor the `download` attribute on blob
      // URLs. Opening the file in a new tab lets the user save it via the
      // native Share sheet instead.
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    // Revoking too soon can race with the browser's (sometimes async)
    // handling of the blob URL, especially on mobile — give it time.
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    toast.success(onIOS ? t.editor.downloadSuccessIOS : t.editor.downloadSuccess);
  }

  async function handleDownload(format: "pdf" | "docx") {
    setIsDownloading(true);
    try {
      const data = form.getValues();
      const filenameBase = sanitizeFilename(data.personalInfo.fullName);
      if (format === "pdf") {
        const PdfComponent = templateRegistry[data.templateId].PdfComponent;
        const blob = await pdf(<PdfComponent data={data} />).toBlob();
        downloadBlob(blob, `${filenameBase}.pdf`);
      } else {
        const blob = await generateCvDocx(data);
        downloadBlob(blob, `${filenameBase}.docx`);
      }
    } catch {
      toast.error(t.editor.downloadError);
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

  const activeData = values ?? createSampleCv();
  const PreviewComponent = templateRegistry[activeData.templateId ?? "ats-one-column"].PreviewComponent;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0">
            <Logo showWordmark={false} />
          </Link>
          <Input
            value={values?.title ?? ""}
            onChange={(e) => form.setValue("title", e.target.value, { shouldDirty: true })}
            className="h-8 w-40 border-none bg-transparent text-sm font-medium shadow-none focus-visible:ring-1 sm:w-56"
            aria-label={t.editor.cvTitleLabel}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            aria-live="polite"
          >
            {/* Kept mounted at all times so fading it in never shifts the header. */}
            <CheckIcon
              aria-hidden
              className={cn(
                "size-3.5 text-emerald-600 transition-all duration-300 ease-out motion-reduce:transition-none dark:text-emerald-400",
                saveStatus === "saved" ? "scale-100 opacity-100" : "scale-75 opacity-0",
              )}
            />
            {/* Text hidden below ~360px so the header's icon buttons never
                overflow; the checkmark alone still confirms a save there. */}
            <span className="hidden min-[360px]:inline">
              {saveStatus === "saving" ? t.editor.saving : t.editor.savedLocally}
            </span>
          </span>
          <AtsMatchSheet cv={activeData} />
          <ThemeToggle />
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button disabled={isDownloading} size="sm" />}>
              <DownloadIcon className="size-4" />
              {isDownloading ? t.editor.preparingPdf : t.editor.download}
              <ChevronDownIcon className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownload("pdf")}>
                {t.editor.downloadAsPdf}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("docx")}>
                {t.editor.downloadAsWord}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
        className="md:hidden"
      >
        <TabsList className="mx-4 mt-3 w-[calc(100%-2rem)]">
          <TabsTrigger value="edit">{t.editor.edit}</TabsTrigger>
          <TabsTrigger value="preview">
            <FileTextIcon className="size-4" />
            {t.editor.preview}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-2">
        <div className={cn("flex flex-col gap-4", activeTab !== "edit" && "hidden md:flex")}>
          <TemplatePicker control={form.control} />
          <PersonalInfoSection control={form.control} />
          <ExperienceSection control={form.control} setValue={form.setValue} />
          <EducationSection control={form.control} setValue={form.setValue} />
          <SkillsSection control={form.control} />
          <ProjectsSection control={form.control} />
          <LanguagesSection control={form.control} />
          <CertificationsSection control={form.control} />
        </div>

        <div
          className={cn(
            "md:sticky md:top-20 md:h-[calc(100vh-6rem)] md:overflow-auto md:rounded-lg md:border md:border-border",
            activeTab !== "preview" && "hidden md:block",
          )}
        >
          <PreviewComponent data={activeData} />
        </div>
      </main>
    </div>
  );
}
