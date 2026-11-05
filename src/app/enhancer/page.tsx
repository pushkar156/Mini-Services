"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";
import {
  Sparkles,
  Copy,
  Check,
  Code2,
  Bot,
  BrainCircuit,
  Zap,
  Feather,
  Trash2,
  GitCompare,
  ArrowUpRight,
  Download,
  Sliders,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
} from "lucide-react";
import Footer from "@/components/Footer";

type EnhancementStyle = "coding" | "agentic" | "reasoning" | "concise" | "creative";
type TargetModel = "general" | "claude" | "gemini" | "gpt4" | "deepseek";
type OutputFormat = "markdown" | "xml" | "raw";

interface EnhanceResponse {
  title: string;
  enhancedPrompt: string;
  explanation: string;
  techniquesUsed: string[];
  metrics: {
    originalTokens: number;
    enhancedTokens: number;
    expansionRatio: string;
    style: string;
    targetModel: string;
    modelUsed: string;
    latencyMs: number;
  };
}

const STYLE_OPTIONS: { id: EnhancementStyle; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: "coding",
    label: "Coding & Specs",
    desc: "Rigorous architecture, edge cases & clean code constraints",
    icon: Code2,
  },
  {
    id: "agentic",
    label: "Autonomous Agent",
    desc: "Tool protocols, step verification & stopping criteria",
    icon: Bot,
  },
  {
    id: "reasoning",
    label: "Chain-of-Thought",
    desc: "Cognitive scratchpad, verification & counter-hypotheses",
    icon: BrainCircuit,
  },
  {
    id: "concise",
    label: "Concise & Dense",
    desc: "Zero fluff, maximum token efficiency & imperatives",
    icon: Zap,
  },
  {
    id: "creative",
    label: "Creative Nuance",
    desc: "Atmospheric worldbuilding, tone & narrative depth",
    icon: Feather,
  },
];

const MODEL_OPTIONS: { id: TargetModel; label: string; tag: string }[] = [
  { id: "general", label: "Universal Clean", tag: "Markdown" },
  { id: "claude", label: "Claude 3.7", tag: "XML Tags" },
  { id: "gemini", label: "Gemini 2.5", tag: "Directives" },
  { id: "gpt4", label: "GPT-4o", tag: "Delimiters" },
  { id: "deepseek", label: "DeepSeek R1", tag: "Reasoning" },
];

const SAMPLE_PROMPT = `Make a python script that fetches the latest top 10 hacker news posts and sends a summary to my slack webhook every morning.`;

const SAMPLE_ENHANCED = `<context>
You are an expert systems automation engineer specializing in robust, fault-tolerant Python background jobs and webhook notifications.
</context>

<task>
Develop a production-grade, container-friendly Python script that queries the official Hacker News Firebase API to retrieve the current top 10 stories, formats an elegant digest, and delivers it to a designated Slack channel via an Incoming Webhook.
</task>

<technical_specifications>
1. API Ingestion:
   - Use the official Firebase HN endpoint: \`https://hacker-news.firebaseio.com/v0/topstories.json\`.
   - Concurrently fetch story details for the top 10 item IDs using \`httpx\` or \`asyncio\` with connection pooling.
   - Set a strict 8-second request timeout with exponential backoff retry (3 attempts) on network failure.

2. Data Processing:
   - Extract title, author, score, comment count, and URL (fallback to the item discussion URL if external link is missing).
   - Sanitize inputs to prevent payload injection into Slack JSON blocks.

3. Slack Formatting:
   - Utilize Slack Block Kit (\`header\`, \`section\`, and \`context\` blocks).
   - Display story rank, score pip, comment count, and clickable hyperlinked title.

4. Configuration & Security:
   - Read \`SLACK_WEBHOOK_URL\` strictly from environment variables. Raise an explicit configuration error if absent.
   - Do NOT hardcode credentials or secrets anywhere in source code.

5. Execution & Error Handling:
   - Include structured logging with timestamps.
   - Gracefully catch and log HTTP errors; do not crash silently.
</technical_specifications>

<negative_constraints>
- DO NOT use unmaintained third-party HN scraping libraries; rely only on the standard official API.
- DO NOT use synchronous blocking \`time.sleep\` in async loops.
- DO NOT leave placeholders, incomplete snippets, or "// TODO" blocks; output full, executable code.
</negative_constraints>

<output_format>
Output the complete, production-ready Python script, followed by a minimal \`requirements.txt\` and a sample \`.env.example\` file.
</output_format>`;

export default function PromptEnhancerPage() {
  const router = useRouter();
  const { apiKey } = useApiKey();

  const [inputPrompt, setInputPrompt] = useState(SAMPLE_PROMPT);
  const [style, setStyle] = useState<EnhancementStyle>("coding");
  const [targetModel, setTargetModel] = useState<TargetModel>("claude");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("xml");
  const [includeNegative, setIncludeNegative] = useState(true);

  const [enhancedResult, setEnhancedResult] = useState<EnhanceResponse>({
    title: "Hacker News Slack Digest Pipeline",
    enhancedPrompt: SAMPLE_ENHANCED,
    explanation: "Fortified with async connection pooling, Slack Block Kit formatting, strict env secret handling, and explicit negative constraints.",
    techniquesUsed: ["Context Framing", "Negative Constraints", "XML Schema Tags", "Execution Protocol"],
    metrics: {
      originalTokens: 24,
      enhancedTokens: 412,
      expansionRatio: "+1617%",
      style: "coding",
      targetModel: "claude",
      modelUsed: "gemini-2.5-flash",
      latencyMs: 180,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [diffMode, setDiffMode] = useState(false);

  // Live token estimate for input
  const inputWords = useMemo(() => {
    return inputPrompt.trim().split(/\s+/).filter(Boolean).length;
  }, [inputPrompt]);

  const estimatedInputTokens = useMemo(() => {
    return Math.max(0, Math.round(inputWords * 1.33));
  }, [inputWords]);

  const outputWords = useMemo(() => {
    return enhancedResult.enhancedPrompt.trim().split(/\s+/).filter(Boolean).length;
  }, [enhancedResult.enhancedPrompt]);

  const handleEnhance = async () => {
    if (!inputPrompt.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputPrompt,
          style,
          targetModel,
          outputFormat,
          includeNegative,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to enhance prompt");
      }

      setEnhancedResult(data);
    } catch (err: any) {
      alert(err.message || "Failed to process prompt enhancement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedResult.enhancedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([enhancedResult.enhancedPrompt], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(enhancedResult.title || "prompt").toLowerCase().replace(/\s+/g, "-")}.prompt.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToHumanizer = () => {
    sessionStorage.setItem("humanizer_preset_text", enhancedResult.enhancedPrompt);
    router.push("/humanizer");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0D0E10] text-[#E3E2E5] selection:bg-[#343537] selection:text-[#CDC6BB] min-h-[calc(100vh-48px)]">
      <main className="flex-1 flex flex-col max-w-[1440px] w-full mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* Studio Architectural Header */}
        <section className="border-b border-[#4A463F]/25 pb-6 pt-2 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E988E] animate-pulse"></span>
              <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#969087]">
                ATELIER ENGINE 07 // PROMPT SYNTHESIS & METROLOGY
              </span>
            </div>
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#EDEAE5]">
              Prompt Enhancer
            </h1>
            <p className="text-xs md:text-sm text-[#969087] max-w-2xl font-sans">
              Transform raw, underspecified instructions into master-grade production prompts with
              deterministic guardrails, cognitive reasoning structures, and model-specific XML/Markdown syntax.
            </p>
          </div>

          {/* Telemetry Status Strip */}
          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[#969087] uppercase tracking-wider">Target Optimization</span>
              <span className="text-[#CDC6BB] font-semibold uppercase">{targetModel} / {outputFormat}</span>
            </div>
            <div className="h-8 w-px bg-[#4A463F]/30 hidden sm:block"></div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[#969087] uppercase tracking-wider">Engine Latency</span>
              <span className="text-[#EDEAE5]">{enhancedResult.metrics?.latencyMs || 180}ms</span>
            </div>
          </div>
        </section>

        {/* Control Matrix: Archetype Styles & Model Targets */}
        <section className="bg-[#14161A] border border-[#4A463F]/30 rounded p-4 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b border-[#4A463F]/20 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#9E988E]" />
              <span className="font-mono text-[11px] uppercase text-[#E3E2E5] tracking-wider">
                Enhancement Matrix Configuration
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#969087]">
              BYOK ENCRYPTED • ZERO LEAKAGE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Style Selector Pills (Cols 1-8) */}
            <div className="lg:col-span-8 flex flex-col space-y-2">
              <label className="font-mono text-[10px] uppercase text-[#969087]">
                Enhancement Archetype
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {STYLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = style === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setStyle(opt.id);
                        if (opt.id === "coding" || opt.id === "agentic") {
                          setOutputFormat("xml");
                        }
                      }}
                      className={`p-2.5 rounded text-left border transition-all flex flex-col justify-between h-[84px] ${
                        active
                          ? "bg-[#1E2228] border-[#CDC6BB] text-[#EDEAE5] shadow-sm"
                          : "bg-[#0F1114] border-[#4A463F]/30 text-[#969087] hover:border-[#9E988E] hover:text-[#E3E2E5]"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-3.5 h-3.5 ${active ? "text-[#CDC6BB]" : "text-[#969087]"}`} />
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-[#CDC6BB]"></span>}
                      </div>
                      <div>
                        <div className="font-mono text-[11px] font-semibold tracking-tight leading-tight">
                          {opt.label}
                        </div>
                        <div className="text-[9px] text-[#7A7E85] line-clamp-1 mt-0.5 font-sans">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Model & Format Controls (Cols 9-12) */}
            <div className="lg:col-span-4 flex flex-col space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase text-[#969087] block mb-1.5">
                  Target AI Architecture
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#0F1114] p-1 border border-[#4A463F]/30 rounded">
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setTargetModel(m.id)}
                      className={`py-1 text-center font-mono text-[10px] uppercase rounded transition-colors ${
                        targetModel === m.id
                          ? "bg-[#292E36] text-[#EDEAE5] font-semibold"
                          : "text-[#969087] hover:text-[#EDEAE5]"
                      }`}
                      type="button"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles Strip */}
              <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-[#969087]">Format:</span>
                  {(["markdown", "xml"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`px-2 py-0.5 rounded uppercase ${
                        outputFormat === fmt
                          ? "bg-[#CDC6BB] text-[#0D0E10] font-semibold"
                          : "text-[#969087] hover:text-[#EDEAE5] border border-[#4A463F]/30"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#969087] hover:text-[#EDEAE5]">
                  <input
                    type="checkbox"
                    checked={includeNegative}
                    onChange={(e) => setIncludeNegative(e.target.checked)}
                    className="rounded bg-[#0F1114] border-[#4A463F] text-[#CDC6BB] focus:ring-0 w-3 h-3"
                  />
                  <span>Negative Guardrails</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Dual Workspace Desks: Raw Input vs Fortified Output */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] min-h-[540px] border border-[#4A463F]/30 rounded bg-[#0D0E10] shadow-xl overflow-hidden">
          
          {/* Left Desk: Raw Draft Prompt */}
          <div className="flex flex-col h-full bg-[#111317] border-b lg:border-b-0 lg:border-r border-[#4A463F]/30 p-5 md:p-6 relative group">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#4A463F]/20 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-[1px] bg-[#969087]"></span>
                <span className="font-mono text-xs text-[#E3E2E5] uppercase tracking-wider">
                  Raw Draft Input
                </span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#1B1E24] border border-[#4A463F]/30 text-[#969087]">
                  {inputWords} words (~{estimatedInputTokens} tokens)
                </span>
              </div>
            </div>

            {/* Editable Textarea */}
            <div className="flex-1 overflow-y-auto">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Type or paste your raw prompt or idea here...
e.g. Build a CLI that monitors my docker containers and restarts them if memory exceeds 80%."
                rows={14}
                className="w-full h-full bg-transparent resize-none outline-none font-mono text-xs md:text-sm text-[#A89F91] leading-relaxed focus:text-[#EDEAE5] transition-colors placeholder:text-[#555860]"
              />
            </div>

            {/* Footer Diagnostics & Actions */}
            <div className="pt-3 mt-3 border-t border-[#4A463F]/20 flex justify-between items-center font-mono text-[11px] text-[#969087]">
              <div className="flex items-center space-x-2">
                <span className="text-[10px]">MODE: {style.toUpperCase()}</span>
                <span>•</span>
                <span className="text-[10px]">AUTODETECT INTENT</span>
              </div>
              <button
                onClick={() => setInputPrompt("")}
                className="hover:text-[#EDEAE5] transition-colors flex items-center space-x-1 text-[11px]"
                type="button"
              >
                <Trash2 className="w-3 h-3 inline mr-1" /> Clear
              </button>
            </div>
          </div>

          {/* Center Divider & Synthesize Button */}
          <div className="relative flex items-center justify-center py-4 lg:py-0 px-3 bg-[#0D0E10] border-y lg:border-y-0 border-[#4A463F]/30 z-10">
            <div className="hidden lg:block absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#4A463F]/30"></div>
            <button
              onClick={handleEnhance}
              disabled={isLoading || !inputPrompt.trim()}
              className="relative group flex items-center space-x-2 px-5 py-3 bg-[#CDC6BB] text-[#121315] font-mono text-xs uppercase font-bold rounded shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-[#E0DAD0] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              type="button"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#121315]" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#121315]" />
                  <span>Fortify Prompt</span>
                  <span className="text-xs opacity-75">↵</span>
                </>
              )}
            </button>
          </div>

          {/* Right Desk: Fortified Production-Ready Prompt */}
          <div className="flex flex-col h-full bg-[#14171C] p-5 md:p-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#4A463F]/20 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-[1px] bg-[#CDC6BB]"></span>
                <span className="font-mono text-xs text-[#E3E2E5] uppercase tracking-wider truncate max-w-[180px] sm:max-w-none">
                  {enhancedResult.title || "Fortified Production Prompt"}
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-[#1C2027] border border-[#4A463F]/30 hover:border-[#CDC6BB] text-[#CDC6BB] hover:text-[#EDEAE5] uppercase flex items-center space-x-1 transition-colors"
                  type="button"
                  title="Copy Enhanced Prompt"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded bg-[#1C2027] border border-[#4A463F]/30 hover:border-[#969087] text-[#969087] hover:text-[#EDEAE5] uppercase flex items-center space-x-1 transition-colors"
                  type="button"
                  title="Download .prompt.md"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={() => setDiffMode(!diffMode)}
                  className={`px-2.5 py-1 rounded border uppercase flex items-center space-x-1 transition-colors ${
                    diffMode
                      ? "bg-[#292E36] text-[#EDEAE5] border-[#CDC6BB]"
                      : "bg-[#1C2027] border-[#4A463F]/30 text-[#969087] hover:text-[#EDEAE5]"
                  }`}
                  type="button"
                  title="Toggle Word Count Comparison"
                >
                  <GitCompare className="w-3 h-3" />
                  <span>Diff</span>
                </button>

                <button
                  onClick={handleSendToHumanizer}
                  className="px-2 py-1 rounded bg-[#1C2027] border border-[#4A463F]/30 hover:border-[#CDC6BB] text-[#969087] hover:text-[#CDC6BB] uppercase flex items-center space-x-1 transition-colors"
                  type="button"
                  title="Send to Text Humanizer"
                >
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Prompt Viewport */}
            <div className="flex-1 overflow-y-auto pr-1">
              {diffMode ? (
                <div className="font-mono text-xs space-y-4 leading-relaxed p-2 bg-[#0D0E10] border border-[#4A463F]/30 rounded">
                  <div>
                    <span className="text-[10px] text-[#B88A76] uppercase block font-semibold mb-1">
                      --- ORIGINAL DRAFT ({inputWords} words):
                    </span>
                    <p className="text-[#969087] whitespace-pre-wrap">{inputPrompt}</p>
                  </div>
                  <div className="pt-2 border-t border-[#4A463F]/20">
                    <span className="text-[10px] text-emerald-400 uppercase block font-semibold mb-1">
                      +++ FORTIFIED PROMPT ({outputWords} words):
                    </span>
                    <p className="text-[#CDC6BB] whitespace-pre-wrap">{enhancedResult.enhancedPrompt}</p>
                  </div>
                </div>
              ) : (
                <pre className="font-mono text-xs md:text-sm text-[#EDEAE5] leading-relaxed whitespace-pre-wrap break-words select-text">
                  {enhancedResult.enhancedPrompt}
                </pre>
              )}
            </div>

            {/* Bottom Meta & Rationale Bar */}
            <div className="pt-3 mt-3 border-t border-[#4A463F]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center font-mono text-[11px] text-[#969087] gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-[#CDC6BB] font-semibold">{outputWords} WORDS</span>
                <span>(~{enhancedResult.metrics?.enhancedTokens || 0} TOKENS)</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{enhancedResult.metrics?.expansionRatio || "+100%"} DENSITY</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px]">
                {enhancedResult.techniquesUsed?.slice(0, 3).map((t, idx) => (
                  <span key={idx} className="bg-[#1C2027] px-1.5 py-0.5 rounded border border-[#4A463F]/30 text-[#969087]">
                    #{t.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Analytical Metric Strip */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-[#14161A] border border-[#4A463F]/25 rounded flex flex-col justify-between">
            <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
              Token Expansion & Density
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="font-mono text-base font-bold text-[#EDEAE5]">
                {enhancedResult.metrics?.expansionRatio || "+140%"}
              </span>
              <span className="font-mono text-[10px] text-[#9E988E]">
                ({estimatedInputTokens} → {enhancedResult.metrics?.enhancedTokens || 0} tokens)
              </span>
            </div>
            <span className="text-[10px] text-[#6E737D] mt-1 font-sans">
              Precision constraints and edge case boundaries added
            </span>
          </div>

          <div className="p-3 bg-[#14161A] border border-[#4A463F]/25 rounded flex flex-col justify-between">
            <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
              Model Steerability Target
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="font-mono text-base font-bold text-[#CDC6BB] uppercase">
                {targetModel}
              </span>
              <span className="font-mono text-[10px] text-[#9E988E]">
                ({outputFormat.toUpperCase()} formatted)
              </span>
            </div>
            <span className="text-[10px] text-[#6E737D] mt-1 font-sans">
              Tailored delimiters and instruction hierarchy applied
            </span>
          </div>

          <div className="p-3 bg-[#14161A] border border-[#4A463F]/25 rounded flex flex-col justify-between">
            <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
              Extensions Integration
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="font-mono text-base font-bold text-emerald-400">
                API Live
              </span>
              <span className="font-mono text-[10px] text-[#9E988E]">
                (CORS Enabled)
              </span>
            </div>
            <span className="text-[10px] text-[#6E737D] mt-1 font-sans">
              Ready for Chrome & VS Code / Antigravity extensions
            </span>
          </div>
        </footer>
      </main>

      <Footer />
    </div>
  );
}

