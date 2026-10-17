import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhotoNarrator — Cine-Silver Visual Prose & Darkroom Storytelling",
  description:
    "Multimodal film darkroom and visual prose gallery. Transcribes photographic emulsion cues, dynamic range metrology, and tonal curves into exhibition narratives.",
  openGraph: {
    title: "PhotoNarrator — Cine-Silver Visual Prose | OVI Atelier",
    description: "Transcribes photographic emulsion cues and optical metadata into museum-grade narrative arcs.",
  },
};

export default function PhotoNarratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
