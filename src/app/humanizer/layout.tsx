import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Humanizer — Anti-AI Cadence & Natural Prose Balancer",
  description:
    "Editorial refinement desk designed to eradicate AI clichés, modulate burstiness, and restore human syntactic cadence across essays, correspondence, and critiques.",
  openGraph: {
    title: "Text Humanizer — Anti-AI Prose Balancer | OVI Atelier",
    description: "Anti-AI prose cadence balancer tuning synthetic tokens toward natural human cadence.",
  },
};

export default function HumanizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
