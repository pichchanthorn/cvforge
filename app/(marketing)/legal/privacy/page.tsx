import type { Metadata } from "next";
import { PrivacyContent } from "@/components/marketing/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CVForge handles your data — in short, it never leaves your browser.",
  alternates: {
    canonical: "/legal/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
