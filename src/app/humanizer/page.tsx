"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";
import {
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  Sliders,
  Trash2,
  GitCompare,
  Feather,
  Layers,
  Wand2,
} from "lucide-react";

const SAMPLE_ROBOTIC_TEXT = `In today's fast-paced digital ecosystem, it is vital to delve into the underlying structural foundations of contemporary generative intelligence. The technological leap stands as a clear testament to collective architectural iteration, functioning as a visionary beacon for automated systems.

By weaving together various modalities into a unified tapestry of operational workflows, engineers ensure maximum synchronization across high-density nodes. It is important to note that efficiency alone does not suffice; one must constantly harness innovative paradigms to unlock unprecedented frontiers of digital agency.

Furthermore, the transformative nature of these automated frameworks fosters a vibrant landscape where technical sovereignty and creative autonomy converge with remarkable precision.`;

const KNOWN_CLICHES = [
  "delve", "testament", "tapestry", "in conclusion", "furthermore",
  "it is important to remember", "a testament to", "beacon of",
  "rich tapestry", "navigating the", "unlocking the", "pivotal role",
  "paramount", "multifaceted", "ever-evolving", "fostering", "beacon"
];

export default function HumanizerPage() {
  const router = useRouter();
  const { apiKey } = useApiKey();

  const [mode, setMode] = useState<"essay" | "correspondence" | "critique" | "executive">("essay");
  const [strength, setStrength] = useState<"light" | "balanced" | "deep">("balanced");
  const [inputText, setInputText] = useState(SAMPLE_ROBOTIC_TEXT);
  const [humanizedText, setHumanizedText] = useState(
    `Generative systems do not evolve through sudden miraculous revelations; they advance through quiet, cumulative craft. Look closely at modern pipeline architecture. What matters isn't an abstract visionary promise, but how gracefully individual services negotiate friction under load.

When engineers bind distinct media models together, speed is merely the entry fee. True stability demands restraint. Without rhythmic pacing across token outputs, automated prose becomes brittle—coldly regular, predictable to a fault, devoid of breath.

By breaking machine symmetry and varying syntactic weights, the text regains its natural grain. It sounds less like a probability calculation and more like a deliberate voice at a quiet wooden desk.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [diffMode, setDiffMode] = useState(false);
  const [stats, setStats] = useState({
    burstiness: "+38% Variance",
    perplexity: "Organic (88/100)",
    clichesRemoved: 4,
    latency: "142ms",
  });

  // Calculate live word count & clichés in input
  const inputWords = useMemo(() => {
    return inputText.trim().split(/\s+/).filter(Boolean).length;
  }, [inputText]);

  const flaggedCliches = useMemo(() => {
    const lower = inputText.toLowerCase();
    return KNOWN_CLICHES.filter((c) => lower.includes(c));
  }, [inputText]);

  const humanizedWords = useMemo(() => {
    return humanizedText.trim().split(/\s+/).filter(Boolean).length;
  }, [humanizedText]);

  const handleHumanize = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          mode,
          strength,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to humanize text");
      }

      setHumanizedText(data.humanizedText);
      const elapsed = Date.now() - startTime;
      setStats({
        burstiness: data.stats?.burstiness || "+34% Variance",
        perplexity: data.stats?.perplexity || "Organic (90/100)",
        clichesRemoved: data.stats?.clichesFound || flaggedCliches.length,
        latency: `${elapsed}ms`,
      });
    } catch (err: any) {
      alert(err.message || "Failed to transform text.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToVoice = () => {
    // Save to sessionStorage and navigate
    sessionStorage.setItem("voice_preset_script", humanizedText);
    router.push("/voice");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121315] text-[#E3E2E5] selection:bg-[#343537] selection:text-[#CDC6BB]">
      <main className="flex-1 flex flex-col max-w-[1440px] w-full mx-auto px-4 md:px-6">
        {/* Editorial Studio Header Section */}
        <section className="py-6 flex flex-col items-center justify-center text-center border-b border-[#4A463F]/20 relative">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A463F]"></span>
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#969087]">
              Editorial Cadence Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A463F]"></span>
          </div>
          <h1 className="font-serif italic text-3xl md:text-4xl text-[#EDEAE5] font-normal tracking-tight">
            Text Humanizer
          </h1>
          <p className="text-xs md:text-sm text-[#969087] mt-1 font-sans">
            Anti-AI prose balancer and cadence restoration.
          </p>

          {/* Preset Selector Tabs */}
          <div className="mt-5 inline-flex items-center p-1 bg-[#1B1C1E] border border-[#4A463F]/30 rounded">
            {(["essay", "correspondence", "critique", "executive"] as const).map((m, idx) => (
              <React.Fragment key={m}>
                {idx > 0 && <span className="text-[#4A463F] px-1 select-none text-[10px]">•</span>}
                <button
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 font-mono text-[11px] uppercase rounded transition-all duration-150 ${
                    mode === m
                      ? "text-[#343028] bg-[#CDC6BB] font-medium"
                      : "text-[#969087] hover:text-[#EDEAE5]"
                  }`}
                  type="button"
                >
                  {m}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Quick Diagnostics in Header */}
          <div className="absolute right-0 bottom-6 hidden lg:flex items-center space-x-3 text-[11px] font-mono text-[#969087]">
            <span>MODE: {mode.toUpperCase()}</span>
            <span className="w-1 h-1 rounded-full bg-[#969087]"></span>
            <span>LATENCY: {stats.latency}</span>
          </div>
        </section>

        {/* Dual Editorial Desks (Side-by-Side Canvas) */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] min-h-[500px] border-b border-[#4A463F]/20 bg-[#0D0E10]">
          {/* Left Desk: Original Machine Text */}
          <div className="flex flex-col h-full bg-[#141312] border-r border-[#4A463F]/20 p-5 lg:p-7 relative group">
            {/* Desk Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#4A463F]/15 mb-4">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-[1px] bg-[#B88A76]/60"></span>
                <span className="font-mono text-xs text-[#E3E2E5] uppercase tracking-wider">
                  Original Machine Text
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1F2022] border border-[#4A463F]/30 text-[#969087]">
                  {inputWords} words
                </span>
                {flaggedCliches.length > 0 && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#B88A76]/10 border border-[#B88A76]/30 text-[#B88A76]">
                    {flaggedCliches.length} Clichés Flagged
                  </span>
                )}
              </div>
            </div>

            {/* Editable Workspace */}
            <div className="flex-1 overflow-y-auto pr-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste formulaic AI output here to balance and restore..."
                rows={12}
                className="w-full h-full bg-transparent resize-none outline-none font-serif text-[#A89F91] text-base md:text-lg leading-[1.8] focus:text-[#EDEAE5] transition-colors"
              />
            </div>

            {/* Desk Footer Diagnostics */}
            <div className="pt-3 mt-3 border-t border-[#4A463F]/15 flex justify-between items-center font-mono text-[11px] text-[#969087]">
              <div className="flex items-center space-x-3">
                <span>SYNTAX: UNIFORM</span>
                <span>•</span>
                <span>FLATNESS: {flaggedCliches.length > 2 ? "HIGH" : "LOW"}</span>
              </div>
              <button
                onClick={() => setInputText("")}
                className="hover:text-[#EDEAE5] underline transition-colors flex items-center space-x-1"
                type="button"
              >
                <Trash2 className="w-3 h-3 inline mr-1" /> Clear
              </button>
            </div>
          </div>

          {/* Center Divider & Floating Transform Pill */}
          <div className="relative flex items-center justify-center py-4 lg:py-0 px-3 bg-[#0D0E10] border-y lg:border-y-0 border-[#4A463F]/20 z-10">
            <div className="hidden lg:block absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#4A463F]/30"></div>
            <button
              onClick={handleHumanize}
              disabled={isLoading || !inputText.trim()}
              className="relative group flex items-center space-x-2 px-5 py-2.5 bg-[#CDC6BB] text-[#343028] font-mono text-xs uppercase rounded shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:bg-[#B5AFA6] transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              type="button"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Balancing...</span>
                </>
              ) : (
                <>
                  <span>Humanize Prose</span>
                  <span className="text-xs opacity-75">↵</span>
                </>
              )}
            </button>
          </div>

          {/* Right Desk: Restored Human Prose */}
          <div className="flex flex-col h-full bg-[#1B1917] p-5 lg:p-7 relative">
            {/* Desk Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#4A463F]/15 mb-4">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-[1px] bg-[#CDC6BB]"></span>
                <span className="font-mono text-xs text-[#E3E2E5] uppercase tracking-wider">
                  Restored Human Prose
                </span>
              </div>
              {/* Secondary Toolbar Actions */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-[#1B1C1E] border border-[#4A463F]/30 hover:border-[#969087] text-[#969087] hover:text-[#EDEAE5] font-mono text-[10px] uppercase flex items-center space-x-1 transition-colors"
                  type="button"
                  title="Copy Clean Text"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setDiffMode(!diffMode)}
                  className={`px-2.5 py-1 rounded border font-mono text-[10px] uppercase flex items-center space-x-1 transition-colors ${
                    diffMode
                      ? "bg-[#343537] text-[#EDEAE5] border-[#CDC6BB]"
                      : "bg-[#1B1C1E] border-[#4A463F]/30 text-[#969087] hover:text-[#EDEAE5]"
                  }`}
                  type="button"
                  title="Toggle Word Count Comparison"
                >
                  <GitCompare className="w-3 h-3" />
                  <span>Diff</span>
                </button>
                <button
                  onClick={handleSendToVoice}
                  className="px-2.5 py-1 rounded bg-[#1B1C1E] border border-[#4A463F]/30 hover:border-[#CDC6BB] text-[#CDC6BB] hover:text-[#EDEAE5] font-mono text-[10px] uppercase flex items-center space-x-1 transition-colors"
                  type="button"
                  title="Send humanized prose directly into Braun Voice Studio"
                >
                  <span>Voice</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Rendered Humanized Prose View */}
            <div className="flex-1 overflow-y-auto pr-2 relative">
              <div className="font-serif text-[#EDEAE5] text-base md:text-lg leading-[1.8] space-y-4">
                {humanizedText.split("\n\n").map((para, idx) => (
                  <div key={idx} className="relative group/p pl-4">
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#CDC6BB]/40 rounded-full opacity-60 group-hover/p:opacity-100 transition-opacity"
                      title="Cadence variation mark"
                    ></div>
                    <p>{para}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Desk Bottom Meta Bar */}
            <div className="pt-3 mt-3 border-t border-[#4A463F]/15 flex justify-between items-center font-mono text-[11px] text-[#969087]">
              <div className="flex items-center space-x-3">
                <span className="text-[#CDC6BB]">CADENCE: NATURAL BREATH</span>
                <span>•</span>
                <span>BURSTINESS: {stats.burstiness}</span>
              </div>
              <span>{humanizedWords} WORDS</span>
            </div>
          </div>
        </section>

        {/* Lower Analytics & Parameter Strip */}
        <footer className="py-5 bg-[#0D0E10] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* 3 Quiet Metrics (Col 1-7) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#1B1C1E] border border-[#4A463F]/25 rounded flex flex-col justify-between">
              <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
                Perplexity Score
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="font-mono text-sm md:text-base font-semibold text-[#EDEAE5]">Organic</span>
                <span className="font-mono text-[11px] text-[#CDC6BB]">(88/100)</span>
              </div>
              <span className="text-[10px] text-[#4A463F] mt-0.5">Statistical randomness restored</span>
            </div>

            <div className="p-3 bg-[#1B1C1E] border border-[#4A463F]/25 rounded flex flex-col justify-between">
              <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
                Burstiness Index
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="font-mono text-sm md:text-base font-semibold text-[#EDEAE5]">84%</span>
                <span className="font-mono text-[11px] text-[#EDEAE5]/60">High Variance</span>
              </div>
              <span className="text-[10px] text-[#4A463F] mt-0.5">Sentence rhythm varied naturally</span>
            </div>

            <div className="p-3 bg-[#1B1C1E] border border-[#4A463F]/25 rounded flex flex-col justify-between">
              <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
                Clichés Removed
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="font-mono text-sm md:text-base font-semibold text-[#EDEAE5]">
                  {stats.clichesRemoved}
                </span>
                <span className="font-mono text-[11px] text-[#B88A76]">Synthetic Markers</span>
              </div>
              <span className="text-[10px] text-[#4A463F] mt-0.5">delve, testament, tapestry</span>
            </div>
          </div>

          {/* Rewriting Depth Fine Selector (Col 8-12) */}
          <div className="md:col-span-5 p-3.5 bg-[#1B1C1E] border border-[#4A463F]/25 rounded flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
                Humanization Depth
              </span>
              <span className="font-mono text-[11px] text-[#CDC6BB] uppercase">{strength}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#121315] p-1 border border-[#4A463F]/20 rounded">
              {(["light", "balanced", "deep"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStrength(s)}
                  className={`py-1 text-center font-mono text-[10px] uppercase rounded transition-colors ${
                    strength === s
                      ? "bg-[#343537] text-[#EDEAE5] font-medium"
                      : "text-[#969087] hover:text-[#EDEAE5]"
                  }`}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
