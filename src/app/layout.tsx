import type { Metadata } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono, Newsreader, Italiana } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/context/ApiKeyContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import SettingsModal from "@/components/SettingsModal";
import { AuthModal } from "@/components/AuthModal";
import { Analytics } from "@vercel/analytics/next";

import Footer from "@/components/Footer";

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-italiana",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OVI Atelier — Unified Creative Suite",
    template: "%s | OVI Atelier",
  },
  description:
    "High-density suite of architectural AI micro-services for speech synthesis, anti-AI text humanization, CAD logic flowcharts, brand naming, media extraction, and photographic prose.",
  keywords: [
    "OVI Atelier",
    "Voice Studio",
    "Text Humanizer",
    "Ductus CAD",
    "Ident Brand Naming",
    "MediaDrop Extractor",
    "PhotoNarrator",
    "Google Gemini BYOK",
    "Local Ollama",
  ],
  authors: [{ name: "OVI Atelier" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "OVI Atelier — Unified Creative Suite",
    description:
      "High-density suite of architectural AI micro-services for speech synthesis, text cadence alignment, flowcharts, and media extraction.",
    type: "website",
    locale: "en_US",
    siteName: "OVI Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "OVI Atelier — Unified Creative Suite",
    description:
      "High-density tactile micro-services engineered for synthesis pipelines, lexical cadence alignment, and client-side media extraction.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" />
      </head>
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${newsreader.variable} ${italiana.variable} bg-[#0b0c0e] text-[#e3e2e5] min-h-screen flex flex-col font-sans selection:bg-[#9E988E] selection:text-[#0b0c0e]`}
      >
        <ThemeProvider>
          <ApiKeyProvider>
            <AuthProvider>
              <Navbar />
              <div className="pt-12 flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
                {children}
              </div>
              <Footer />
              <SettingsModal />
              <AuthModal />
            </AuthProvider>
          </ApiKeyProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
