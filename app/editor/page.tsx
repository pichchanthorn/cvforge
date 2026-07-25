"use client";

import dynamic from "next/dynamic";

const CvEditorShell = dynamic(
  () => import("@/components/cv/editor-shell").then((m) => m.CvEditorShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </div>
    ),
  },
);

export default function EditorPage() {
  return <CvEditorShell />;
}
