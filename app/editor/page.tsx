import type { Metadata } from "next";
import { EditorLoader } from "@/components/editor-loader";

export const metadata: Metadata = {
  title: "Free CV Editor",
  description:
    "Fill in your details, preview your CV live, switch templates, and export a polished, ATS-friendly PDF — free, no sign-up required.",
  alternates: {
    canonical: "/editor",
  },
};

export default function EditorPage() {
  return <EditorLoader />;
}
