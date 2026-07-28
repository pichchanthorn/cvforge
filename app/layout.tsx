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

const title = "CVForge — Build a professional CV, fast";
const description =
  "Create a professional, ATS-friendly CV or resume with CVForge. Fill in your details, preview live, and download a polished PDF.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cvforge.pichchanthorn.me"),
  title: {
    default: title,
    template: "%s · CVForge",
  },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "CVForge",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
