import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Studio — Braun Hi-Fi Audio Synthesis",
  description:
    "Acoustic orchestration console inspired by Braun Dieter Rams hardware controls. Features multi-speaker dialogue synthesis, spectral analysis, and low-latency audio generation.",
  openGraph: {
    title: "Voice Studio — Braun Hi-Fi Audio Synthesis | OVI Atelier",
    description: "Multi-speaker voice synthesis console with tactile hardware acoustic controls.",
  },
};

export default function VoiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
