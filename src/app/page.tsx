"use client";

import React from "react";
import Link from "next/link";
import { useApiKey } from "@/context/ApiKeyContext";
import {
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  DownloadCloud,
  Camera,
  Database,
  Cpu,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

const SERVICES = [
  {
    id: "voice",
    engine: "ENGINE 01",
    metric: "48kHz / 24-bit",
    title: "Voice Studio",
    desc: "Audio synthesis console, Braun/Dieter Rams Hi-Fi inspired hardware controls with physical harmonic waveform analysis.",
    badges: ["Spectral Scope", "Bespoke Timbre", "Zero Jitter"],
    route: "GET /voice",
    href: "/voice",
    icon: Mic,
  },
  {
    id: "humanizer",
    engine: "ENGINE 02",
    metric: "BURSTINESS: HIGH",
    title: "Text Humanizer",
    desc: "Editorial refinement desk, anti-AI prose cadence balancer, tuning synthetic rhythm toward tactile Japanese linen tone.",
    badges: ["Cadence Balancer", "Perplexity Tuner", "De-Cliche"],
    route: "GET /humanizer",
    href: "/humanizer",
    icon: FileEdit,
  },
  {
    id: "ductus",
    engine: "ENGINE 03",
    metric: "CAD DRAFT 0.1MM",
    title: "Ductus Flowchart",
    desc: "Technical CAD drafting board & logic diagram studio. Architectural blueprint vector generation with rigid constraints.",
    badges: ["Vector Matrix", "Mermaid Live", "SVG Blueprint"],
    route: "GET /ductus",
    href: "/ductus",
    icon: Network,
  },
  {
    id: "ident",
    engine: "ENGINE 04",
    metric: "LEXICON ATELIER",
    title: "Ident Naming",
    desc: "Haute couture brand atelier & lexicon synthesizer, generating phonetic architectures inspired by Scandinavian typography.",
    badges: ["Phonetic Mesh", "Domain Check", "Etymology Tree"],
    route: "GET /ident",
    href: "/ident",
    icon: Fingerprint,
  },
  {
    id: "mediadrop",
    engine: "ENGINE 05",
    metric: "CLIENT EXTRACTION",
    title: "MediaDrop",
    desc: "Nordic glacier vault, direct client-side media ingestion & extraction utility for Instagram and Pinterest public posts.",
    badges: ["Lossless Demux", "In-Browser Scraping", "Local Vault"],
    route: "GET /mediadrop",
    href: "/mediadrop",
    icon: DownloadCloud,
  },
  {
    id: "photonarrator",
    engine: "ENGINE 06",
    metric: "CINE SILVER 35MM",
    title: "PhotoNarrator",
    desc: "Film darkroom & cine-silver visual prose storytelling gallery. Transcribes photographic emulsion cues into deep narrative arcs.",
    badges: ["Grain Analysis", "Tone Curve Prose", "Contact Sheet"],
    route: "GET /photonarrator",
    href: "/photonarrator",
    icon: Camera,
  },
];

export default function AtelierHubPage() {
  const { isConfigured, provider, ollamaModel, openModal } = useApiKey();

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto pt-6 pb-12 px-4 sm:px-6 md:px-8 flex flex-col justify-between">
      
      {/* Top Architectural Hero Header */}
      <section className="mt-4 mb-8 pb-8 hairline-b flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-3 mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#969087]">SUITE DIRECTORY // 2026</span>
            <span className="w-1 h-1 bg-[#4a463f] rounded-full"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#9E988E]">SYS.CANVAS.V4</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-[#e3e2e5] font-bold tracking-tight leading-tight">
            Focused tools for writing, voice, design &amp; systems.
          </h1>
          <p className="font-sans text-sm text-[#969087] mt-3 max-w-xl leading-relaxed">
            High-density tactile micro-services engineered for synthesis pipelines, lexical cadence alignment, and client-side media extraction.
          </p>
        </div>

        {/* Right System Status Node Capsule */}
        <div className="bg-[#1f2022] border border-white/[0.08] p-4 flex flex-col space-y-2.5 min-w-[280px] self-start md:self-end">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#969087] border-b border-white/[0.06] pb-2">
            <span>PIPELINE TELEMETRY</span>
            <span className="text-[#cdc6bb] font-mono text-xs">LOCAL-FIRST</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Gemini BYOK</span>
            <span className="text-[#e3e2e5] flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConfigured && provider === "gemini" ? "bg-[#9E988E] glow-pip" : "bg-[#7A7E85]"}`}></span>
              {isConfigured && provider === "gemini" ? "Validated" : "Standby"}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Local Ollama</span>
            <span className="text-[#e3e2e5] flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${provider === "ollama" ? "bg-[#9E988E] glow-pip" : "bg-[#7A7E85]"}`}></span>
              {provider === "ollama" ? `Active (${ollamaModel})` : "Available"}
            </span>
          </div>
        </div>
      </section>

      {/* 3-Column Workstation Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {SERVICES.map((s) => {
          const IconComponent = s.icon;
          return (
            <article
              key={s.id}
              className="bg-[#121418] hairline-border p-6 flex flex-col justify-between group hover:border-white/20 transition-all duration-200"
            >
              <div>
                {/* Header Bar */}
                <div className="flex items-center justify-between hairline-b pb-3 mb-5">
                  <div className="flex items-center space-x-2">
                    <IconComponent size={16} className="text-[#9E988E]" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#969087]">{s.engine}</span>
                  </div>
                  <span className="font-mono text-xs text-[#7A7E85]">{s.metric}</span>
                </div>

                {/* Title & Description */}
                <h2 className="font-sans text-xl text-[#e3e2e5] font-semibold mb-2 group-hover:text-white transition-colors">
                  {s.title}
                </h2>
                <p className="font-sans text-xs text-[#969087] mb-6 leading-relaxed">
                  {s.desc}
                </p>

                {/* Feature Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {s.badges.map((b) => (
                    <span
                      key={b}
                      className="bg-[#1f2022] border border-white/[0.06] text-[#969087] font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="hairline-t pt-4 flex items-center justify-between mt-auto">
                <span className="font-mono text-xs text-[#7A7E85] group-hover:text-[#9E988E] transition-colors">
                  {s.route}
                </span>
                <Link
                  href={s.href}
                  className="font-mono text-xs text-[#cdc6bb] hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-all duration-150"
                >
                  <span>Enter Studio</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      {/* Workstation Quick-Metrics Drawer (Bottom Strip) */}
      <footer className="mt-8 hairline-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#121418] hairline-border p-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#1f2022] border border-white/[0.08] flex items-center justify-center text-[#969087]">
              <Database size={15} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">CLIENT-DRIVEN RUNTIME</span>
              <span className="font-mono text-xs text-[#e3e2e5]">In-Browser DOM &amp; Local Storage</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-white/[0.06] pt-2 md:pt-0 md:pl-4">
            <div className="w-8 h-8 bg-[#1f2022] border border-white/[0.08] flex items-center justify-center text-[#969087]">
              <Cpu size={15} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">HOSTING TOPOLOGY</span>
              <span className="font-mono text-xs text-[#cdc6bb]">Vercel Serverless Edge • Zero Overhead</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-white/[0.06] pt-2 md:pt-0 md:pl-4">
            <div className="w-8 h-8 bg-[#1f2022] border border-white/[0.08] flex items-center justify-center text-[#969087]">
              <ShieldCheck size={15} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">PRIVACY GUARANTEE</span>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#9E988E] rounded-full"></span>
                <span className="font-mono text-xs text-[#e3e2e5]">Zero API Keys Stored on Server</span>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-3 px-1 text-[#7A7E85] font-mono text-[10px] gap-2">
          <span>OVI PLATFORM ARCHITECTURE // CLIENT-FIRST MONOREPO MATRIX</span>
          <span>STITCH UI SPEC: 13115693836351847259 // VERIFIED</span>
        </div>
      </footer>

    </main>
  );
}
