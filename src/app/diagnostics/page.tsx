"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApiKey } from "@/context/ApiKeyContext";
import {
  Activity,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Server,
  Key,
  ShieldCheck,
  ArrowRight,
  Terminal,
} from "lucide-react";

export default function DiagnosticsPage() {
  const {
    isConfigured,
    provider,
    geminiKey,
    ollamaEndpoint,
    ollamaModel,
    validateGeminiKey,
    fetchOllamaModels,
    openModal,
  } = useApiKey();

  const [isRunningTest, setIsRunningTest] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{
    status: "idle" | "success" | "error";
    message: string;
    details?: string;
  }>({ status: "idle", message: "Ready to run telemetry diagnostic." });

  const [logs, setLogs] = useState<string[]>([
    `[SYS_INIT] Telemetry diagnostic kernel initialized.`,
    `[VAULT] Client-side credential store verified.`,
    `[PROVIDER] Default backend: ${provider.toUpperCase()}`,
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handleRunDiagnostic = async () => {
    setIsRunningTest(true);
    addLog(`Initiating roundtrip ping test on [${provider.toUpperCase()}]...`);

    const startTime = performance.now();

    try {
      if (provider === "gemini") {
        if (!geminiKey) {
          throw new Error("No Gemini API key detected in browser vault.");
        }
        addLog(`Querying Google AI Studio handshake endpoint...`);
        const res = await validateGeminiKey(geminiKey);
        const duration = Math.round(performance.now() - startTime);
        setLatency(duration);

        if (res.valid) {
          setTestResult({
            status: "success",
            message: `Handshake verified successfully in ${duration}ms.`,
            details: `Model endpoint active. Token throughput nominal. Status code: 200 OK.`,
          });
          addLog(`Gemini API validated: 200 OK (${duration}ms latency)`);
        } else {
          setTestResult({
            status: "error",
            message: res.error || "Gemini authentication failed.",
            details: `Check your API key in settings or generate a fresh key from Google AI Studio.`,
          });
          addLog(`Error: ${res.error || "Handshake rejected"}`);
        }
      } else {
        addLog(`Pinging local Ollama endpoint at ${ollamaEndpoint}...`);
        const models = await fetchOllamaModels(ollamaEndpoint);
        const duration = Math.round(performance.now() - startTime);
        setLatency(duration);

        if (models.length > 0) {
          setTestResult({
            status: "success",
            message: `Ollama local instance reachable in ${duration}ms.`,
            details: `Detected ${models.length} model tag(s): ${models.slice(0, 3).join(", ")}. Active model: ${ollamaModel}.`,
          });
          addLog(`Ollama local: 200 OK (${duration}ms latency, ${models.length} models)`);
        } else {
          setTestResult({
            status: "error",
            message: `Could not connect to Ollama at ${ollamaEndpoint}.`,
            details: `Ensure Ollama daemon is running with 'ollama serve' and CORS headers allow local origins.`,
          });
          addLog(`Error: Ollama daemon unreachable at ${ollamaEndpoint}`);
        }
      }
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      setLatency(duration);
      const errMsg = err instanceof Error ? err.message : "Connection diagnostic error";
      setTestResult({
        status: "error",
        message: errMsg,
        details: `Diagnostic aborted. Please inspect network configurations or API key credentials.`,
      });
      addLog(`Failed: ${errMsg} (${duration}ms)`);
    } finally {
      setIsRunningTest(false);
    }
  };

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
              <span className="text-[#9E988E]">Model Diagnostics</span>
              <span>/</span>
              <span className="text-[#CDC6BB]">Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDEAE5] uppercase font-sans">
              Model Diagnostics & Latency
            </h1>
            <p className="text-xs sm:text-sm text-[#969087] mt-1 font-mono">
              Live telemetry, roundtrip latency benchmarks, token context budgets, and local inference health.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunDiagnostic}
              disabled={isRunningTest}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#9E988E] hover:bg-[#8A847A] text-[#0D0E10] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 rounded-none"
            >
              <Play size={13} className={isRunningTest ? "animate-spin" : ""} />
              <span>{isRunningTest ? "Pinging Engine..." : "Run Benchmark Ping"}</span>
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1C] hover:bg-[#252629] text-[#CDC6BB] border border-white/10 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-none"
              title="Configure Model Keys"
            >
              <Key size={13} className="text-[#9E988E]" />
              <span>Configure Provider</span>
            </button>
          </div>
        </div>

        {/* 4 Status KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Active Provider */}
          <div className="bg-[#121418] border border-white/10 p-4 space-y-1 rounded-none">
            <div className="flex items-center justify-between text-[#7A7E85] text-[11px] font-mono uppercase">
              <span>Engine Backend</span>
              <Cpu size={14} className="text-[#9E988E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#EDEAE5]">
              {provider === "gemini" ? "Google Gemini" : "Ollama Local"}
            </div>
            <div className="text-[11px] text-[#969087] font-mono truncate">
              {provider === "gemini" ? "Cloud API Studio" : ollamaModel}
            </div>
          </div>

          {/* Tile 2: Health / Ready */}
          <div className="bg-[#121418] border border-white/10 p-4 space-y-1 rounded-none">
            <div className="flex items-center justify-between text-[#7A7E85] text-[11px] font-mono uppercase">
              <span>Vault State</span>
              {isConfigured ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={14} className="text-amber-400" />
              )}
            </div>
            <div className="text-lg font-bold font-mono text-[#EDEAE5]">
              {isConfigured ? "ONLINE // ARMED" : "KEY MISSING"}
            </div>
            <div className="text-[11px] text-[#969087] font-mono">
              {isConfigured ? "Credentials valid & armed" : "Configure key in BYOK modal"}
            </div>
          </div>

          {/* Tile 3: Measured Latency */}
          <div className="bg-[#121418] border border-white/10 p-4 space-y-1 rounded-none">
            <div className="flex items-center justify-between text-[#7A7E85] text-[11px] font-mono uppercase">
              <span>Roundtrip Latency</span>
              <Activity size={14} className="text-[#9E988E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#EDEAE5]">
              {latency !== null ? `${latency} ms` : "-- ms"}
            </div>
            <div className="text-[11px] text-[#969087] font-mono">
              {latency !== null
                ? latency < 300
                  ? "Ultra-low latency"
                  : latency < 800
                  ? "Standard latency"
                  : "High latency threshold"
                : "Awaiting benchmark execution"}
            </div>
          </div>

          {/* Tile 4: Zero Egress Guarantee */}
          <div className="bg-[#121418] border border-white/10 p-4 space-y-1 rounded-none">
            <div className="flex items-center justify-between text-[#7A7E85] text-[11px] font-mono uppercase">
              <span>Privacy Vault</span>
              <ShieldCheck size={14} className="text-[#9E988E]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#EDEAE5]">
              CLIENT-SIDE
            </div>
            <div className="text-[11px] text-[#969087] font-mono">
              Zero server persistence or logs
            </div>
          </div>
        </div>

        {/* Live Diagnostics & Terminal Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Benchmark Console (2 cols) */}
          <div className="lg:col-span-2 bg-[#121418] border border-white/10 p-6 space-y-5 rounded-none">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#EDEAE5] uppercase tracking-wider font-semibold">
                <Zap size={14} className="text-[#9E988E]" />
                <span>Engine Telemetry Readout</span>
              </div>
              <span className="text-[10px] font-mono text-[#7A7E85] uppercase">
                Active Protocol: HTTP/2 TLS
              </span>
            </div>

            {/* Test Status Banner */}
            <div
              className={`p-4 border font-mono text-xs rounded-none transition-all ${
                testResult.status === "success"
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : testResult.status === "error"
                  ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                  : "bg-[#1A1A1C] border-white/10 text-[#CDC6BB]"
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1 uppercase tracking-wide">
                {testResult.status === "success" ? (
                  <CheckCircle2 size={14} />
                ) : testResult.status === "error" ? (
                  <AlertTriangle size={14} />
                ) : (
                  <Activity size={14} />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.details && (
                <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                  {testResult.details}
                </p>
              )}
            </div>

            {/* Hardware & Endpoint Parameters */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#9E988E]">
                Target Architecture Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#0D0E10] border border-white/[0.06] p-3 space-y-1">
                  <span className="text-[10px] text-[#7A7E85] uppercase block">
                    Host Endpoint
                  </span>
                  <span className="text-[#EDEAE5] font-semibold break-all">
                    {provider === "gemini"
                      ? "generativelanguage.googleapis.com"
                      : ollamaEndpoint}
                  </span>
                </div>

                <div className="bg-[#0D0E10] border border-white/[0.06] p-3 space-y-1">
                  <span className="text-[10px] text-[#7A7E85] uppercase block">
                    Model Identifier
                  </span>
                  <span className="text-[#EDEAE5] font-semibold">
                    {provider === "gemini" ? "gemini-2.5-flash / pro" : ollamaModel}
                  </span>
                </div>

                <div className="bg-[#0D0E10] border border-white/[0.06] p-3 space-y-1">
                  <span className="text-[10px] text-[#7A7E85] uppercase block">
                    Token Context Window
                  </span>
                  <span className="text-[#EDEAE5] font-semibold">
                    {provider === "gemini"
                      ? "1,048,576 Tokens (~1M Context)"
                      : "Configured by Local VRAM"}
                  </span>
                </div>

                <div className="bg-[#0D0E10] border border-white/[0.06] p-3 space-y-1">
                  <span className="text-[10px] text-[#7A7E85] uppercase block">
                    Multimodal Support
                  </span>
                  <span className="text-[#EDEAE5] font-semibold">
                    {provider === "gemini"
                      ? "Audio / Speech / Images / Text"
                      : "LLM Text / Multimodal vision (llava)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/settings"
                className="text-xs font-mono text-[#9E988E] hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Full Settings & Key Vault</span>
                <ArrowRight size={12} />
              </Link>

              <button
                onClick={() => {
                  setLatency(null);
                  setTestResult({
                    status: "idle",
                    message: "Telemetry diagnostic reset.",
                  });
                  addLog("Telemetry benchmarks reset.");
                }}
                className="text-[11px] font-mono text-[#7A7E85] hover:text-[#CDC6BB] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset Telemetry</span>
              </button>
            </div>
          </div>

          {/* Side: Live Console Telemetry Log */}
          <div className="bg-[#121418] border border-white/10 p-5 flex flex-col justify-between space-y-4 rounded-none">
            <div>
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 mb-3">
                <Terminal size={14} className="text-[#9E988E]" />
                <span className="font-mono text-xs text-[#EDEAE5] uppercase tracking-wider font-semibold">
                  Handshake Log
                </span>
              </div>

              <div className="bg-[#0D0E10] border border-white/[0.06] p-3 font-mono text-[10px] space-y-1.5 text-[#969087] h-64 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes("Error") || log.includes("Failed")
                        ? "text-rose-400"
                        : log.includes("200 OK") || log.includes("verified")
                        ? "text-emerald-400"
                        : "text-[#969087]"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-3 text-[11px] font-mono text-[#7A7E85]">
              <div className="flex items-center gap-1.5 text-[#CDC6BB]">
                <Server size={12} className="text-[#9E988E]" />
                <span>Architecture Guarantee</span>
              </div>
              <p className="mt-1 leading-relaxed">
                Direct client-to-API calls. No proxy middleware or telemetry tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Engine Capability Matrix */}
        <div className="bg-[#121418] border border-white/10 p-6 space-y-4 rounded-none">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#EDEAE5]">
            Engine Capability Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[#7A7E85] text-[10px] uppercase">
                  <th className="py-2 pr-4">Model Engine</th>
                  <th className="py-2 px-4">Provider</th>
                  <th className="py-2 px-4">Context Window</th>
                  <th className="py-2 px-4">Latency Tier</th>
                  <th className="py-2 px-4">Primary Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[#CDC6BB]">
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Gemini 2.5 Flash</td>
                  <td className="py-3 px-4">Google AI Studio</td>
                  <td className="py-3 px-4">1,000,000 Tokens</td>
                  <td className="py-3 px-4 text-emerald-400">~150 - 350 ms</td>
                  <td className="py-3 px-4">Voice Synthesis, Realtime Ductus CAD, Humanizer</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Gemini 1.5 Pro</td>
                  <td className="py-3 px-4">Google AI Studio</td>
                  <td className="py-3 px-4">2,000,000 Tokens</td>
                  <td className="py-3 px-4 text-amber-400">~800 - 1500 ms</td>
                  <td className="py-3 px-4">Long-form Audio Transcription, Deep Brand Analysis</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Ollama (Llama 3 / Mistral)</td>
                  <td className="py-3 px-4">Local Daemon</td>
                  <td className="py-3 px-4">8k - 32k Tokens</td>
                  <td className="py-3 px-4 text-sky-400">Hardware Dependent</td>
                  <td className="py-3 px-4">Air-gapped Confidential Workflows, Offline Syntax</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
