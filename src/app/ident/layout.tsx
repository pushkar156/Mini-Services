import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ident Naming Studio — Haute Couture Brand Lexicon Atelier",
  description:
    "Phonosemantic branding studio & lexicon synthesizer generating luxury brand identities, phonetic transcriptions, and real-time .com/.io/.ai domain availability.",
  openGraph: {
    title: "Ident Naming Studio — Haute Couture Brand Atelier | OVI Atelier",
    description: "Generative linguistic brand identity atelier and phonemic synthesizer.",
  },
};

export default function IdentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
