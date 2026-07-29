import type { Metadata } from "next";
import { TermsContent } from "@/components/marketing/terms-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using CVForge.",
  alternates: {
    canonical: "/legal/terms",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
