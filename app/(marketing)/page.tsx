import type { Metadata } from "next";
import { LandingContent } from "@/components/marketing/landing-content";

export const metadata: Metadata = {
  description:
    "CVForge helps students and job seekers build a professional, ATS-friendly CV with live preview and high-quality PDF export — free, bilingual English/Khmer, no sign-up.",
  alternates: {
    canonical: "/",
  },
};

export default function MarketingHomePage() {
  return <LandingContent />;
}
