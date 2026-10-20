"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Workflow,
  ArrowRight,
  Sparkles,
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  CloudDownload,
  Camera,
  Play,
  CheckCircle2,
  Layers,
  Cpu,
  Clock,
  ExternalLink,
} from "lucide-react";

interface PipelineStep {
  step: number;
  title: string;
  engine: string;
  href: string;
  description: string;
  badge: string;
}

interface WorkflowItem {
  id: string;
  code: string;
  title: string;
  tagline: string;
  category: "AUDIO & EXECUTIVE" | "BRAND ARCHITECTURE" | "EDITORIAL" | "MEDIA INGEST";
  estTime: string;
  backend: string;
  steps: PipelineStep[];
}

export default function WorkflowsPage() {
  const WORKFLOWS: WorkflowItem[] = [
    {
      id: "wf-01",
      code: "CHAIN-01",
      title: "Audio Executive Sprint",
      tagline: "Transform unstructured voice memos and board recordings into polished executive briefs.",
      category: "AUDIO & EXECUTIVE",
      estTime: "45s",
      backend: "Gemini 2.5 Flash Multimodal",
      steps: [
        {
          step: 1,
          title: "Speech Ingestion & Acoustic Cleaning",
          engine: "Voice Studio",
          href: "/voice?tab=transcribe",
          description: "48kHz audio ingestion with automatic noise filtering and timestamped transcription.",
          badge: "AUDIO",
        },
        {
          step: 2,
          title: "Executive Synthesis & Action Items",
          engine: "Audio Summarizer",
          href: "/voice?tab=summarize",
          description: "Compresses 30+ minutes of dialogue into prioritized executive deliverables.",
          badge: "SYNTHESIS",
        },
        {
          step: 3,
          title: "Editorial Cadence Polish",
          engine: "Text Humanizer",
          href: "/humanizer",
          description: "Elevates raw synthetic notes into nuanced, natural Japanese-linen prose.",
          badge: "EDITORIAL",
        },
      ],
    },
    {
      id: "wf-02",
      code: "CHAIN-02",
      title: "Brand & Architecture Blueprint",
      tagline: "From abstract concept to trademarked phonetic nomenclature and engineering architecture diagrams.",
      category: "BRAND ARCHITECTURE",
      estTime: "60s",
      backend: "Gemini 2.5 Flash + Ductus Engine",
      steps: [
        {
          step: 1,
          title: "Phonetic Naming Architecture",
          engine: "Ident Studio",
          href: "/ident",
          description: "Synthesizes Scandinavian and brutalist naming options with domain readiness.",
          badge: "NAMING",
        },
        {
          step: 2,
          title: "Technical Systems Drafting",
          engine: "Ductus CAD",
          href: "/ductus",
          description: "Generates vector-accurate system architecture flowcharts and sequence maps.",
          badge: "VECTOR CAD",
        },
        {
          step: 3,
          title: "Visual Asset Inspection",
          engine: "Photo Narrator",
          href: "/photonarrator?tab=inspect",
          description: "Inspects brand visual assets for RGB balance, composition, and darkroom histogram.",
          badge: "VISION",
        },
      ],
    },
    {
      id: "wf-03",
      code: "CHAIN-03",
      title: "Editorial De-Biasing & Humanizer Loop",
      tagline: "Strip synthetic cadence, clichés, and robotic markers from LLM-generated manuscripts.",
      category: "EDITORIAL",
      estTime: "15s",
      backend: "Gemini 1.5 Pro / Ollama Local",
      steps: [
        {
          step: 1,
          title: "Raw Manuscript Ingestion",
          engine: "Studio Workbench",
          href: "/humanizer",
          description: "Input raw draft with perplexity and burstiness metric evaluation.",
          badge: "INGEST",
        },
        {
          step: 2,
          title: "Syntactic De-Biasing",
          engine: "Text Humanizer",
          href: "/humanizer",
          description: "Removes repetitive sentence lengths, formulaic adjectives, and robotic punctuation.",
          badge: "REWRITE",
        },
        {
          step: 3,
          title: "Publication Review",
          engine: "Timeline Archive",
          href: "/history",
          description: "Saves polished variant into your encrypted timeline chronicles.",
          badge: "ARCHIVE",
        },
      ],
    },
    {
      id: "wf-04",
      code: "CHAIN-04",
      title: "Media Ingestion to Knowledge Graph",
      tagline: "Extract online media streams, extract dialogue stems, and convert into structured architecture graphs.",
      category: "MEDIA INGEST",
      estTime: "90s",
      backend: "MediaDrop + Ductus CAD",
      steps: [
        {
          step: 1,
          title: "Online Stream Capture",
          engine: "MediaDrop",
          href: "/mediadrop",
          description: "Extract clean audio stems and MP4 video containers with zero telemetry.",
          badge: "DOWNLOAD",
        },
        {
          step: 2,
          title: "Dialogue Transcription",
          engine: "Voice Studio",
          href: "/voice?tab=transcribe",
          description: "Timestamped dialogue transcription with speaker separation.",
          badge: "TRANSCRIPT",
        },
        {
          step: 3,
          title: "Logic Graph Synthesis",
          engine: "Ductus CAD",
          href: "/ductus",
          description: "Transforms conversational themes into an interactive SVG architecture flowchart.",
          badge: "GRAPH",
        },
      ],
    },
  ];

  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowItem>(WORKFLOWS[0]);

  return (
    <div className="min-h-screen bg-[#0D0E10] text-[#EDEAE5] selection:bg-[#9E988E] selection:text-[#0D0E10] pt-24 pb-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#7A7E85] mb-2">
              <Link href="/" className="hover:text-white transition-colors">
                Atelier Hub
              </Link>
              <span>/</span>
              <span className="text-[#9E988E]">Pipelines & Workflows</span>
              <span>/</span>
              <span className="text-[#CDC6BB]">Orchestration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDEAE5] uppercase font-sans">
              Studio Pipelines & Workflows
            </h1>
            <p className="text-xs sm:text-sm text-[#969087] mt-1 font-mono">
              Chained multi-engine creative pipelines linking audio, syntax, architecture, and media into streamlined workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/diagnostics"
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1A1A1C] hover:bg-[#252629] text-[#CDC6BB] border border-white/10 font-mono text-xs uppercase tracking-wider transition-colors rounded-none"
            >
              <Cpu size={13} className="text-[#9E988E]" />
              <span>Model Diagnostics</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-2 bg-[#9E988E] hover:bg-[#8A847A] text-[#0D0E10] font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
            >
              <span>Atelier Hub</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Workflow Master Grid: Left list, Right detail viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Workflow Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-[#7A7E85] uppercase tracking-wider pb-1">
              <span>Select Pipeline</span>
              <span>{WORKFLOWS.length} Orchestrations</span>
            </div>

            {WORKFLOWS.map((wf) => {
              const isSelected = activeWorkflow.id === wf.id;
              return (
                <button
                  key={wf.id}
                  onClick={() => setActiveWorkflow(wf)}
                  className={`w-full text-left p-4 border transition-all cursor-pointer rounded-none relative ${
                    isSelected
                      ? "bg-[#18191D] border-[#9E988E] text-white shadow-lg"
                      : "bg-[#121418] border-white/10 text-[#CDC6BB] hover:bg-[#1A1A1C] hover:border-white/20"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#9E988E]" />
                  )}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-[#9E988E] font-bold">{wf.code}</span>
                    <span className="text-[#7A7E85] uppercase tracking-wider">
                      {wf.category}
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-sm tracking-tight text-[#EDEAE5] mb-1">
                    {wf.title}
                  </h3>
                  <p className="text-xs text-[#969087] font-mono line-clamp-2 leading-relaxed">
                    {wf.tagline}
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/[0.06] text-[10px] font-mono text-[#7A7E85]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-[#9E988E]" />
                      {wf.estTime}
                    </span>
                    <span>•</span>
                    <span className="truncate">{wf.steps.length} Pipeline Stages</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Workflow Interactive Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-[#121418] border border-white/10 p-6 space-y-6 rounded-none">
            {/* Active Workflow Header */}
            <div className="border-b border-white/[0.08] pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#9E988E]/10 border border-[#9E988E]/30 text-[#9E988E] font-mono text-[10px] uppercase font-bold tracking-wider">
                  {activeWorkflow.code}
                </span>
                <span className="text-xs font-mono text-[#7A7E85]">
                  Est. Execution: <span className="text-white font-bold">{activeWorkflow.estTime}</span>
                </span>
              </div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-[#EDEAE5]">
                {activeWorkflow.title}
              </h2>
              <p className="text-xs font-mono text-[#969087] leading-relaxed">
                {activeWorkflow.tagline}
              </p>
              <div className="text-[11px] font-mono text-[#7A7E85] pt-1">
                Recommended Backend: <span className="text-[#CDC6BB]">{activeWorkflow.backend}</span>
              </div>
            </div>

            {/* Stepper Pipeline Visualizer */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#9E988E] flex items-center gap-2">
                <Layers size={13} />
                <span>Chained Execution Stages</span>
              </h3>

              <div className="space-y-3">
                {activeWorkflow.steps.map((st, idx) => (
                  <div
                    key={st.step}
                    className="bg-[#0D0E10] border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative rounded-none hover:border-white/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#1F2022] border border-white/10 font-mono text-[10px] font-bold text-[#9E988E] flex items-center justify-center">
                          0{st.step}
                        </span>
                        <h4 className="font-sans font-bold text-xs text-[#EDEAE5]">
                          {st.title}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/[0.04] text-[#7A7E85] border border-white/[0.06] uppercase">
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#969087] pl-7">
                        {st.description}
                      </p>
                    </div>

                    <Link
                      href={st.href}
                      className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 text-[#CDC6BB] hover:text-white font-mono text-xs transition-colors shrink-0 rounded-none cursor-pointer"
                    >
                      <span>Launch {st.engine}</span>
                      <ExternalLink size={11} className="text-[#9E988E]" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-[#7A7E85]">
                Stage outputs are automatically saved to your <Link href="/history" className="text-[#9E988E] hover:underline">Timeline Archive</Link>.
              </div>
              <Link
                href={activeWorkflow.steps[0].href}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#9E988E] hover:bg-[#8A847A] text-[#0D0E10] font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
              >
                <Play size={12} />
                <span>Begin Pipeline at Stage 1</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
