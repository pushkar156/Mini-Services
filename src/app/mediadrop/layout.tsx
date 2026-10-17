import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MediaDrop Vault — Instagram Reel & Pinterest Media Extractor",
  description:
    "Direct client-side media ingestion and lossless extractor for public Instagram Reels, videos, carousels, and high-resolution Pinterest pins.",
  openGraph: {
    title: "MediaDrop Vault — Media Extractor | OVI Atelier",
    description: "Nordic glacier vault client media ingestion & direct video extraction utility.",
  },
};

export default function MediaDropLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
