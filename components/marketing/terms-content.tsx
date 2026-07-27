"use client";

import { LegalPage } from "@/components/marketing/legal-page";
import { useT } from "@/lib/i18n/language-context";

export function TermsContent() {
  const t = useT().legal.terms;

  return (
    <LegalPage
      title={t.title}
      lastUpdated={t.lastUpdated}
      intro={t.intro}
      contactNote
      sections={[
        { heading: t.section1Heading, body: t.section1Body },
        { heading: t.section2Heading, body: t.section2Body },
        { heading: t.section3Heading, body: t.section3Body },
        { heading: t.section4Heading, body: t.section4Body },
        { heading: t.section5Heading, body: t.section5Body },
        { heading: t.section6Heading, body: t.section6Body },
      ]}
    />
  );
}
