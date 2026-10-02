"use client";

import React, { useState } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import { useAuth } from "@/context/AuthContext";
import { saveHistoryItem } from "@/lib/historyService";
import {
  Sparkles,
  Bookmark,
  Check,
  Copy,
  Sliders,
  Download,
  ExternalLink,
  ChevronDown,
  Layers,
  Wand2,
} from "lucide-react";

interface BrandCard {
  name: string;
  phonetic: string;
  category: string;
  score: number;
  rationale: string;
  domains: {
    com: boolean;
    io: boolean;
    ai: boolean;
  };
}

const INITIAL_BRANDS: BrandCard[] = [
  {
    name: "KINETIC",
    phonetic: "/ˈkaɪ.nɛt.ɪk/",
    category: "GREEK / DYNAMIC",
    score: 98.2,
    rationale:
      "Crisp velar plosives (/k/) bracketed around fluid vowels invoke rigorous mechanical action and precision calibrated response. Ideal for tactile haptic computing surfaces.",
    domains: { com: false, io: true, ai: true },
  },
  {
    name: "AETHERIS",
    phonetic: "/ˈiː.θər.ɪs/",
    category: "LATIN / ATMOSPHERIC",
    score: 96.8,
    rationale:
      "Soft sibilants combined with an unvoiced dental fricative evoke expansive weightlessness, ambient acoustics, and non-invasive acoustic hardware engineering.",
    domains: { com: true, io: true, ai: true },
  },
  {
    name: "MONOLITH",
    phonetic: "/ˈmɒn.ə.lɪθ/",
    category: "ARCHITECTURAL / SOLID",
    score: 95.4,
    rationale:
      "Resonant bilabial nasal (/m/) descending into dental closure denotes unyielding structural permanence and uncompromised industrial permanence.",
    domains: { com: false, io: false, ai: true },
  },
];

export default function IdentPage() {
  const { apiKey } = useApiKey();
  const { user } = useAuth();

  const [keywords, setKeywords] = useState("Tactile computing, audio hardware, quiet luxury");
  const [archetype, setArchetype] = useState("Minimalist Hardware");
  const [constraint, setConstraint] = useState("Latin root & Phonemic Balance");
  const [brands, setBrands] = useState<BrandCard[]>(INITIAL_BRANDS);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const ARCHETYPES = [
    "Minimalist Hardware",
    "Avant-Garde Architecture",
    "Horological",
    "Tactile Luxury",
  ];

  const CONSTRAINTS = [
    "Latin root & Phonemic Balance",
    "Compound Anglo-Saxon",
    "Pure Invented Neologism",
    "Architectural Monolith",
  ];

  const handleSynthesize = async () => {
    if (!keywords.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/ident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          archetype,
          constraint,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synthesize brands");
      }

      setBrands(data.names);

      if (user && data.names && data.names.length > 0) {
        const topName = data.names[0].name;
        saveHistoryItem(
          user.uid,
          "ident",
          `Lexicon: ${topName} (${data.names.length} concepts)`,
          `Synthesized for "${archetype}" — ${keywords}`,
          { names: data.names, archetype, constraint, keywords }
        ).catch((err) => console.error("History save failed:", err));
      }
    } catch (err: any) {
      alert(err.message || "Synthesis error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Phonetic,Category,Score,Rationale,.COM,.IO,.AI"]
        .concat(
          brands.map(
            (b) =>
              `"${b.name}","${b.phonetic}","${b.category}",${b.score},"${b.rationale.replace(/"/g, '""')}",${b.domains.com},${b.domains.io},${b.domains.ai}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ident_lexicon_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0D0E10] text-[#E3E2E5] selection:bg-[#CDC6BB] selection:text-[#0D0E10] min-h-[calc(100vh-48px)]">
      <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Atelier Header Section */}
        <section className="border-b border-[#4A463F]/30 pb-6 pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#969087] tracking-widest uppercase">
                ATELIER ARCHIVE // SPEC-09
              </span>
              <span className="w-1 h-1 rounded-full bg-[#4A463F]"></span>
              <span className="font-mono text-[11px] text-[#CDC6BB]/70">
                PHONOSEMANTIC ENGINE V4.2
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-[#EDEAE5] tracking-wide font-normal">
              Ident Brand Naming Studio
            </h1>
            <p className="text-xs md:text-sm text-[#969087] max-w-2xl font-sans">
              Generative linguistic brand identity, phonosemantic clustering, and real-time domain
              availability crafted for luxury tech, tactile computing, and architectural studios.
            </p>
          </div>

          {/* Atelier Status & Metrics */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
                Lexical Registry
              </span>
              <span className="font-mono text-xs md:text-sm text-[#E3E2E5]">32,490 NODES</span>
            </div>
            <div className="h-8 w-px bg-[#4A463F]/30"></div>
            <div className="flex flex-col text-right">
              <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
                Resonance Target
              </span>
              <span className="font-mono text-xs md:text-sm text-[#CDC6BB]">0.984 PHO-SCORE</span>
            </div>
          </div>
        </section>

        {/* Briefing Console */}
        <section className="bg-[#1B1C1E] border border-[#4A463F]/30 rounded p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#4A463F]/20 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#969087]" />
              <span className="font-mono text-[11px] uppercase text-[#E3E2E5] tracking-widest">
                Atelier Synthesis Briefing Matrix
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#969087]">LATENCY: ~140ms // BYOK ENCRYPTED</span>
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Keyword Input (Cols 1-5) */}
            <div className="lg:col-span-5 flex flex-col space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#969087] flex items-center justify-between">
                <span>Industry Essence & Keywords</span>
                <span className="text-[#969087]/70">MAX 5 CONCEPTS</span>
              </label>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. Tactile computing, audio hardware, quiet luxury"
                className="w-full h-[38px] bg-[#0D0E10] border border-[#4A463F]/40 rounded px-3 font-mono text-xs text-[#E3E2E5] placeholder-[#969087] focus:border-[#CDC6BB] outline-none transition-colors"
              />
            </div>

            {/* Target Archetype Pills (Cols 6-8) */}
            <div className="lg:col-span-4 flex flex-col space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#969087]">
                Target Archetype Matrix
              </label>
              <div className="flex items-center gap-2 h-[38px] overflow-x-auto">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch}
                    onClick={() => setArchetype(arch)}
                    className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${
                      archetype === arch
                        ? "bg-[#292A2C] border border-[#CDC6BB]/60 text-[#CDC6BB]"
                        : "bg-[#1F2022] border border-[#4A463F]/30 text-[#969087] hover:text-[#EDEAE5]"
                    }`}
                  >
                    {arch}
                  </button>
                ))}
              </div>
            </div>

            {/* Linguistic Constraints (Cols 9-12) */}
            <div className="lg:col-span-3 flex flex-col space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#969087]">
                Linguistic Constraint
              </label>
              <select
                value={constraint}
                onChange={(e) => setConstraint(e.target.value)}
                className="w-full h-[38px] bg-[#0D0E10] border border-[#4A463F]/40 rounded px-3 font-mono text-xs text-[#E3E2E5] focus:border-[#CDC6BB] outline-none"
              >
                {CONSTRAINTS.map((c) => (
                  <option key={c} value={c} className="bg-[#1B1C1E]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Console Footer Bar */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#4A463F]/20 gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#969087]">Syllabic Cadence:</span>
                <span className="px-2 py-0.5 bg-[#343537] rounded font-mono text-[10px] text-[#EDEAE5]">
                  2-3 BEATS
                </span>
              </div>
              <div className="h-3 w-px bg-[#4A463F]/40"></div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#969087]">TLD Verification:</span>
                <span className="font-mono text-[10px] text-[#CDC6BB]">.COM / .IO / .AI</span>
              </div>
            </div>

            <button
              onClick={handleSynthesize}
              disabled={isLoading || !keywords.trim()}
              className="h-[38px] px-6 bg-[#9E988E] hover:bg-[#CDC6BB] text-[#0D0E10] font-mono text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "SYNTHESIZING..." : "SYNTHESIZE LEXICON"}</span>
            </button>
          </div>
        </section>

        {/* Secondary Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-[11px] uppercase text-[#969087] tracking-widest">
              Synthesized Lexicon Portfolio ({brands.length} Curated Vectors)
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#CDC6BB]/40"></span>
            <span className="font-mono text-[10px] text-[#969087]">Sorted by Resonance Factor</span>
          </div>
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1 bg-[#1B1C1E] border border-[#4A463F]/30 text-[#969087] hover:text-[#EDEAE5] rounded font-mono text-[10px] uppercase transition-colors flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Generated Brand Cards (3-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((card, idx) => (
            <article
              key={idx}
              className="bg-[#1B1C1E] border border-[#4A463F]/30 hover:border-[#CDC6BB]/40 transition-all rounded flex flex-col justify-between group shadow-lg"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-[#4A463F]/20 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#292A2C] border border-[#4A463F]/30 text-[#CDC6BB] rounded">
                    {card.category}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-[#969087]">SCORE</span>
                    <span className="font-semibold text-[#EDEAE5]">{card.score}</span>
                  </div>
                </div>

                {/* Logotype Rendering */}
                <div className="py-8 text-center bg-[#0D0E10]/60 rounded border border-[#4A463F]/20">
                  <h3 className="font-serif text-3xl lg:text-4xl text-[#EDEAE5] tracking-[0.25em] font-normal uppercase pl-2">
                    {card.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="font-mono text-[10px] text-[#969087]">PHONETIC</span>
                    <span className="font-mono text-xs text-[#CDC6BB] tracking-wider">
                      {card.phonetic}
                    </span>
                  </div>
                </div>

                {/* Semantic Rationale */}
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#969087]">
                    Linguistic & Sensory Rationale
                  </span>
                  <p className="text-xs text-[#CDC6BC] font-sans leading-relaxed">
                    {card.rationale}
                  </p>
                </div>
              </div>

              {/* Domain Availability Tiers */}
              <div className="px-6 py-4 border-b border-[#4A463F]/20 bg-[#0D0E10]/30 space-y-2.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#969087] uppercase">
                  <span>Registry Availability</span>
                  <span>EST. ACQUISITION</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {/* .COM */}
                  <div className="border border-[#4A463F]/40 bg-[#1F2022] p-2 rounded flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#EDEAE5] font-semibold">.com</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          card.domains.com ? "bg-emerald-400" : "bg-red-400/80"
                        }`}
                      ></span>
                    </div>
                    <span className="text-[9px] text-[#969087] mt-1 uppercase">
                      {card.domains.com ? "Available" : "Reserved"}
                    </span>
                  </div>
                  {/* .IO */}
                  <div className="border border-[#CDC6BB]/30 bg-[#292A2C] p-2 rounded flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#CDC6BB] font-semibold">.io</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          card.domains.io ? "bg-emerald-400" : "bg-red-400/80"
                        }`}
                      ></span>
                    </div>
                    <span className="text-[9px] text-[#CDC6BB] mt-1 uppercase">
                      {card.domains.io ? "Available" : "Reserved"}
                    </span>
                  </div>
                  {/* .AI */}
                  <div className="border border-[#CDC6BB]/30 bg-[#292A2C] p-2 rounded flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#CDC6BB] font-semibold">.ai</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          card.domains.ai ? "bg-emerald-400" : "bg-red-400/80"
                        }`}
                      ></span>
                    </div>
                    <span className="text-[9px] text-[#CDC6BB] mt-1 uppercase">
                      {card.domains.ai ? "Available" : "Reserved"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleCopy(card.name)}
                  className="h-9 px-3 border border-[#4A463F]/40 hover:border-[#CDC6BB] text-[#969087] hover:text-[#EDEAE5] rounded flex items-center justify-center transition-colors"
                  title="Copy Name"
                >
                  {copiedName === card.name ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleCopy(`${card.name} (${card.phonetic}) - ${card.rationale}`)}
                  className="h-9 flex-1 bg-[#1F2022] hover:bg-[#292A2C] border border-[#4A463F]/40 text-[#EDEAE5] rounded flex items-center justify-center gap-2 transition-all font-mono text-[11px] uppercase tracking-wider"
                >
                  <span>Copy Brand Dossier</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
