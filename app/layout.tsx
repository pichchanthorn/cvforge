import type { Metadata } from "next";
import { Geist, Geist_Mono, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { DemoAccountProvider } from "@/lib/demo-account/demo-account-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-khmer",
  subsets: ["khmer", "latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://cvforge.pichchanthorn.me";
const title = "CVForge — Free CV & Resume Builder (ATS-Friendly)";
const description =
  "Build a professional, ATS-friendly CV or resume for free with CVForge. Fill in your details, preview live in English or Khmer, and download a polished PDF — no sign-up, no watermark, your data stays in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s · CVForge",
  },
  description,
  keywords: [
    "CV builder",
    "resume builder",
    "free CV maker",
    "ATS-friendly resume",
    "CV builder Cambodia",
    "online resume builder",
    "Khmer CV template",
    "CV template free download",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: SITE_URL,
    type: "website",
    siteName: "CVForge",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CVForge",
  url: SITE_URL,
  description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (runs in browser)",
  inLanguage: ["en", "km"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Live CV preview",
    "ATS-friendly templates",
    "PDF export",
    "Bilingual English/Khmer support",
    "No account required, data stays in the browser",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${kantumruyPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <DemoAccountProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </DemoAccountProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
