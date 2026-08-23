"use client";

import { useState } from "react";
import { FileUpIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractPdfText, parsePdfPersonalInfo } from "@/lib/cv/pdf-import";
import type { CvData } from "@/lib/cv/schema";
import { useT } from "@/lib/i18n/language-context";

export function PdfImportDialog({
  onImport,
}: {
  onImport: (personalInfo: Pick<CvData["personalInfo"], "fullName" | "headline" | "email" | "phone" | "location" | "links">) => void;
}) {
  const t = useT();
  const s = t.editor;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function processFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error(s.pdfImportError);
      return;
    }
    setFileName(file.name);
    setLoading(true);
    try {
      setText(await extractPdfText(file));
    } catch {
      setText("");
      toast.error(s.pdfImportError);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void processFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void processFile(file);
  }

  function handleImport() {
    const personalInfo = parsePdfPersonalInfo(text);
    if (!personalInfo.fullName && !personalInfo.email && !personalInfo.phone) {
      toast.error(s.pdfImportNoData);
      return;
    }
    onImport(personalInfo);
    toast.success(s.pdfImportSuccess);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" disabled={loading} />}>
        <FileUpIcon className="size-4" />
        <span className="hidden sm:inline">{s.importPdf}</span>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-1rem)] max-w-2xl overflow-y-auto sm:max-h-[calc(100vh-2rem)]">
        <DialogHeader>
          <DialogTitle>{s.pdfImportTitle}</DialogTitle>
          <DialogDescription>{s.pdfImportDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div
            className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <FileUpIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{s.dropPdf}</p>
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
              {s.choosePdf}
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={s.pdfImportPlaceholder}
            rows={8}
            aria-label={s.pdfImportPreview}
          />
          <p className="text-xs text-muted-foreground">{s.pdfImportReviewNote}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{s.cancel}</Button>
          <Button onClick={handleImport} disabled={loading || !text.trim()}>
            {loading && <Loader2Icon className="size-4 animate-spin" />}
            {s.importToEditor}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
