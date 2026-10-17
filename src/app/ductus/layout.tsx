import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ductus CAD — Architectural Blueprint & Logic Diagramming",
  description:
    "Precision drafting board and logic diagram studio. Generates clean orthogonal Mermaid flowcharts, SVG architectural blueprints, and interactive vector matrices.",
  openGraph: {
    title: "Ductus CAD — Architectural Blueprint Studio | OVI Atelier",
    description: "Technical CAD drafting board & logic diagram studio with interactive pan, zoom, and SVG export.",
  },
};

export default function DuctusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
