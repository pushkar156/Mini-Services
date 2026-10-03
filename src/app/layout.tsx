import type { Metadata } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono, Newsreader, Italiana } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/context/ApiKeyContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import SettingsModal from "@/components/SettingsModal";
import { AuthModal } from "@/components/AuthModal";

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
  title: "OVI Atelier — Unified Creative Suite",
  description: "Focused suite of architectural micro-services for voice, humanizer, flowcharts, branding, media extraction, and photography.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${newsreader.variable} ${italiana.variable} bg-[#0b0c0e] text-[#e3e2e5] min-h-screen flex flex-col font-sans selection:bg-[#9E988E] selection:text-[#0b0c0e]`}
      >
        <ThemeProvider>
          <ApiKeyProvider>
            <AuthProvider>
              <Navbar />
              <div className="pt-12 flex-1 flex flex-col">
                {children}
              </div>
              <SettingsModal />
              <AuthModal />
            </AuthProvider>
          </ApiKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
