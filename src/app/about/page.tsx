import React from "react";
import Link from "next/link";
import {
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  CloudDownload,
  Camera,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";
import OviLogo from "@/components/OviLogo";

export const metadata = {
  title: "About Atelier — Philosophy & Architecture",
  description: "The design ethos, sovereign local-first privacy, and architectural AI engines of OVI Atelier.",
};

export default function AboutPage() {
  const ENGINES = [
    {
      id: "01",
      name: "Voice Studio",
      href: "/voice",
      icon: Mic,
      tech: "48kHz / 24-bit Synthesis",
      desc: "Acoustic analog modeling and multi-speaker hardware synthesis console inspired by Braun audio equipment.",
    },
    {
      id: "02",
      name: "Text Humanizer",
      href: "/humanizer",
      icon: FileEdit,
      tech: "Burstiness & Perplexity Balance",
      desc: "Editorial refinement desk balancing synthetic cadence into textured, tactile Japanese linen prose.",
    },
    {
      id: "03",
      name: "Ductus CAD",
      href: "/ductus",
      icon: Network,
      tech: "0.1mm Vector Constraints",
      desc: "Technical drafting board translating logic and system architectures into blueprint diagrams.",
    },
    {
      id: "04",
      name: "Ident Naming",
      href: "/ident",
      icon: Fingerprint,
      tech: "Scandinavian Lexicon Mesh",
      desc: "Haute couture brand lexicon atelier generating phonetic architectures with domain availability verification.",
    },
    {
      id: "05",
      name: "MediaDrop",
      href: "/mediadrop",
      icon: CloudDownload,
      tech: "Lossless Client Vault",
      desc: "Direct edge media extractor and vault downloader for high-density photography and reels.",
    },
    {
      id: "06",
      name: "PhotoNarrator",
      href: "/photonarrator",
      icon: Camera,
      tech: "Silver-Halide Vision Core",
      desc: "Darkroom prose interpreter generating Leica-monochrome poetic vignettes from visual compositions.",
    },
  ];

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-20 flex flex-col justify-between">
      {/* Hero Strip */}
      <section className="mt-4 mb-12 pb-8 hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-3 mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#969087]">STUDIO PEDIGREE // 2026</span>
            <span className="w-1 h-1 bg-[#4a463f] inline-block"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#9E988E]">MANIFESTO V4.0</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-[#EDEAE5] font-bold tracking-tight leading-tight">
            Tools built like precision instruments, not disposable web apps.
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#969087] mt-4 max-w-2xl leading-relaxed">
            OVI Atelier was founded on a singular conviction: creative computing should feel as deliberate, tactile, and durable as high-end mid-century physical hardware. No bloated SaaS dashboards, no dark patterns, and absolute client-side sovereignty.
          </p>
        </div>

        {/* Right Status Capsule */}
        <div className="bg-[#121418] border border-white/[0.08] p-5 flex flex-col space-y-3 min-w-[300px] self-start lg:self-end">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#969087] border-b border-white/[0.06] pb-2">
            <span>ATELIER ARCHITECTURE</span>
            <span className="text-[#CDC6BB] font-mono text-xs font-semibold">SOVEREIGN EDGE</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Design Philosophy</span>
            <span className="text-[#EDEAE5]">Braun Functionalism</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Data Retention</span>
            <span className="text-[#9E988E] font-semibold">Zero Server Storage</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Neural Topology</span>
            <span className="text-[#EDEAE5]">BYOK &amp; Local Ollama</span>
          </div>
        </div>
      </section>

      {/* Core Principles: 3 Architectural Pillars */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-6 font-mono text-xs text-[#969087] uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-[#9E988E]"></span>
          <span>Foundational Principles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#121418] border border-white/[0.08] p-6 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-[#1B1C1E] border border-white/[0.08] flex items-center justify-center text-[#9E988E] mb-4">
                <Layers size={16} />
              </div>
              <h2 className="font-sans text-lg font-bold text-[#EDEAE5] mb-2">Tactile Minimalism</h2>
              <p className="font-sans text-xs text-[#969087] leading-relaxed">
                Every slider, toggle, and display in OVI Atelier is modeled after Braun hi-fi consoles and architectural blueprints. Form follows function without decorative fluff.
              </p>
            </div>
            <div className="hairline-t pt-3 mt-6 font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">
              PRINCIPLE 01 // AESTHETIC INTEGRITY
            </div>
          </div>

          <div className="bg-[#121418] border border-white/[0.08] p-6 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-[#1B1C1E] border border-white/[0.08] flex items-center justify-center text-[#9E988E] mb-4">
                <ShieldCheck size={16} />
              </div>
              <h2 className="font-sans text-lg font-bold text-[#EDEAE5] mb-2">Private by Architecture</h2>
              <p className="font-sans text-xs text-[#969087] leading-relaxed">
                Your API keys, creative outputs, and audio files never touch our servers. Storage is pinned directly inside your browser’s encrypted localStorage or connected to local Ollama nodes.
              </p>
            </div>
            <div className="hairline-t pt-3 mt-6 font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">
              PRINCIPLE 02 // ZERO RETENTION
            </div>
          </div>

          <div className="bg-[#121418] border border-white/[0.08] p-6 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-[#1B1C1E] border border-white/[0.08] flex items-center justify-center text-[#9E988E] mb-4">
                <Cpu size={16} />
              </div>
              <h2 className="font-sans text-lg font-bold text-[#EDEAE5] mb-2">Hybrid Intelligence</h2>
              <p className="font-sans text-xs text-[#969087] leading-relaxed">
                Switch seamlessly between state-of-the-art Google Gemini cloud models (Bring Your Own Key) or completely offline, air-gapped local models running on your machine via Ollama.
              </p>
            </div>
            <div className="hairline-t pt-3 mt-6 font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">
              PRINCIPLE 03 // MODEL FREEDOM
            </div>
          </div>
        </div>
      </section>

      {/* The 6 Engines Catalog */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#969087] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#9E988E]"></span>
            <span>The Six Studio Engines</span>
          </div>
          <span className="font-mono text-xs text-[#7A7E85]">MATRIX V4</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGINES.map((eng) => {
            const Icon = eng.icon;
            return (
              <Link
                key={eng.id}
                href={eng.href}
                className="group bg-[#121418] border border-white/[0.08] hover:border-white/20 p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon size={16} className="text-[#9E988E]" />
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#969087]">ENGINE {eng.id}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#7A7E85]">{eng.tech}</span>
                  </div>
                  <h3 className="font-sans text-base font-bold text-[#EDEAE5] group-hover:text-white transition-colors">
                    {eng.name}
                  </h3>
                  <p className="font-sans text-xs text-[#969087] mt-1.5 leading-relaxed">
                    {eng.desc}
                  </p>
                </div>

                <div className="hairline-t pt-3 mt-5 flex items-center justify-between font-mono text-[11px] text-[#7A7E85] group-hover:text-[#EDEAE5] transition-colors">
                  <span>LAUNCH CONSOLE</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom Dispatch / Action */}
      <section className="bg-[#121418] border border-white/[0.08] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <OviLogo size={36} />
          <div>
            <h3 className="font-sans text-base sm:text-lg font-bold text-[#EDEAE5]">
              Ready to create with sovereign precision?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#969087] mt-0.5">
              Jump straight into any engine or return to the main workstation directory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] font-mono text-xs uppercase tracking-wider text-[#EDEAE5] transition-all cursor-pointer"
          >
            Workstation Home
          </Link>
          <Link
            href="/voice"
            className="px-4 py-2 border border-white/20 bg-[#EDEAE5] hover:bg-white font-mono text-xs uppercase tracking-wider text-[#0D0E10] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Open Studio</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </main>
  );
}
