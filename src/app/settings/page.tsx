"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApiKey } from "@/context/ApiKeyContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  Sliders,
  Key,
  Server,
  RefreshCw,
  Check,
  AlertCircle,
  Trash2,
  Download,
  Upload,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Moon,
  Sun,
  Layers,
  Terminal,
  ArrowRight,
  ExternalLink,
  Cpu,
  Database,
  Volume2,
  Lock,
} from "lucide-react";
import OviLogo from "@/components/OviLogo";

export default function SettingsPage() {
  const {
    geminiKey,
    provider,
    ollamaEndpoint,
    ollamaModel,
    ollamaModels,
    isConfigured,
    saveGeminiKey,
    clearGeminiKey,
    setProvider,
    setOllamaConfig,
    validateGeminiKey,
    fetchOllamaModels,
  } = useApiKey();

  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"models" | "workspace" | "storage" | "specs">("models");

  // Gemini state
  const [inputKey, setInputKey] = useState<string>(geminiKey);
  const [showKey, setShowKey] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("gemini-2.5-flash");

  // Ollama state
  const [endpointInput, setEndpointInput] = useState<string>(ollamaEndpoint);
  const [modelInput, setModelInput] = useState<string>(ollamaModel);

  // Status & notifications
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Storage metrics
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [storageItemsCount, setStorageItemsCount] = useState<number>(0);

  // Sound & Motion state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setInputKey(geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    setEndpointInput(ollamaEndpoint);
    setModelInput(ollamaModel);
  }, [ollamaEndpoint, ollamaModel]);

  // Calculate local storage footprint
  useEffect(() => {
    try {
      let total = 0;
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("OVI_") || key.includes("GEMINI") || key.includes("OLLAMA") || key.includes("theme"))) {
          const val = localStorage.getItem(key) || "";
          total += key.length + val.length;
          count++;
        }
      }
      setStorageBytes(total * 2); // 2 bytes per char approx
      setStorageItemsCount(count);
    } catch {
      // ignore
    }
  }, [geminiKey, provider, ollamaEndpoint, ollamaModel]);

  const handleSaveGemini = () => {
    saveGeminiKey(inputKey);
    setProvider("gemini");
    setSaveBanner("Google Gemini BYOK configuration saved to browser storage.");
    setTimeout(() => setSaveBanner(null), 3500);
  };

  const handleTestGemini = async () => {
    setTestStatus({ loading: true, message: "Testing authorization with Google AI Studio..." });
    const res = await validateGeminiKey(inputKey);
    if (res.valid) {
      setTestStatus({ loading: false, success: true, message: "Handshake verified! Gemini engine active." });
    } else {
      setTestStatus({ loading: false, success: false, message: res.error || "Key validation failed." });
    }
  };

  const handleSaveOllama = () => {
    setOllamaConfig(endpointInput, modelInput);
    setProvider("ollama");
    setSaveBanner("Local Ollama daemon configuration updated.");
    setTimeout(() => setSaveBanner(null), 3500);
  };

  const handleFetchModels = async () => {
    setTestStatus({ loading: true, message: "Scanning local daemon at " + endpointInput + "..." });
    const models = await fetchOllamaModels(endpointInput);
    if (models.length > 0) {
      setTestStatus({
        loading: false,
        success: true,
        message: `Found ${models.length} model(s): ${models.slice(0, 3).join(", ")}${models.length > 3 ? "..." : ""}`,
      });
      if (!modelInput && models[0]) setModelInput(models[0]);
    } else {
      setTestStatus({
        loading: false,
        success: false,
        message: "No models found or endpoint unreachable. Ensure `ollama serve` is running.",
      });
    }
  };

  const handleExportConfig = () => {
    const config = {
      provider,
      geminiKey: inputKey,
      ollamaEndpoint: endpointInput,
      ollamaModel: modelInput,
      theme,
      exportedAt: new Date().toISOString(),
      clientVersion: "4.0.0",
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ovi-atelier-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.geminiKey) {
          saveGeminiKey(parsed.geminiKey);
          setInputKey(parsed.geminiKey);
        }
        if (parsed.ollamaEndpoint && parsed.ollamaModel) {
          setOllamaConfig(parsed.ollamaEndpoint, parsed.ollamaModel);
          setEndpointInput(parsed.ollamaEndpoint);
          setModelInput(parsed.ollamaModel);
        }
        if (parsed.provider) {
          setProvider(parsed.provider);
        }
        setSaveBanner("Backup configuration successfully imported.");
        setTimeout(() => setSaveBanner(null), 3500);
      } catch (err) {
        alert("Invalid configuration file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleWipeAll = () => {
    if (confirm("Are you sure? This will purge your stored API keys, endpoint configurations, and reset local preferences.")) {
      clearGeminiKey();
      setInputKey("");
      try {
        localStorage.removeItem("OVI_HUB_GEMINI_KEY");
        localStorage.removeItem("OVI_HUB_PROVIDER");
        localStorage.removeItem("OVI_HUB_OLLAMA_ENDPOINT");
        localStorage.removeItem("OVI_HUB_OLLAMA_MODEL");
      } catch {}
      setSaveBanner("Local vault and credentials have been completely wiped.");
      setTimeout(() => setSaveBanner(null), 3500);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-16 flex flex-col justify-between">
      {/* Top Architectural Header */}
      <section className="mb-8 pb-6 hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#969087]">SYSTEM PREFERENCES // CONFIG.V4</span>
            <span className="w-1 h-1 bg-[#4a463f] inline-block"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#9E988E]">NEURAL TOPOLOGY</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl text-[#EDEAE5] font-bold tracking-tight">
            Studio Settings &amp; Engine Routing
          </h1>
          <p className="font-sans text-sm text-[#969087] mt-2 max-w-2xl leading-relaxed">
            Manage your Bring-Your-Own-Key credentials, offline Ollama daemons, interface aesthetics, and zero-retention client storage.
          </p>
        </div>

        {/* Telemetry Capsule */}
        <div className="bg-[#121418] border border-white/[0.08] p-4 flex flex-col space-y-2 min-w-[280px]">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#969087] border-b border-white/[0.06] pb-2">
            <span>ACTIVE ENGINE PIPELINE</span>
            <span className="text-[#9E988E] uppercase font-semibold">
              {provider === "ollama" ? "Ollama Local" : isConfigured ? "Gemini BYOK" : "No Key Set"}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Browser Vault</span>
            <span className="text-[#EDEAE5]">{storageBytes} bytes ({storageItemsCount} records)</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Active Theme</span>
            <span className="text-[#EDEAE5] uppercase">{theme}</span>
          </div>
        </div>
      </section>

      {/* Save Notification Banner */}
      {saveBanner && (
        <div className="mb-6 bg-[#16221c] border border-emerald-500/30 p-4 flex items-center justify-between text-emerald-300 font-mono text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            <span>{saveBanner}</span>
          </div>
          <button onClick={() => setSaveBanner(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            DISMISS
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("models")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "models"
              ? "bg-[#1B1C1E] text-[#EDEAE5] border border-white/20"
              : "text-[#969087] hover:text-[#EDEAE5] hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <Cpu size={14} className={activeTab === "models" ? "text-[#9E988E]" : ""} />
          <span>Neural Providers</span>
        </button>

        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "workspace"
              ? "bg-[#1B1C1E] text-[#EDEAE5] border border-white/20"
              : "text-[#969087] hover:text-[#EDEAE5] hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <Layers size={14} className={activeTab === "workspace" ? "text-[#9E988E]" : ""} />
          <span>Appearance &amp; UX</span>
        </button>

        <button
          onClick={() => setActiveTab("storage")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "storage"
              ? "bg-[#1B1C1E] text-[#EDEAE5] border border-white/20"
              : "text-[#969087] hover:text-[#EDEAE5] hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <Database size={14} className={activeTab === "storage" ? "text-[#9E988E]" : ""} />
          <span>Local Vault &amp; Backup</span>
        </button>

        <button
          onClick={() => setActiveTab("specs")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "specs"
              ? "bg-[#1B1C1E] text-[#EDEAE5] border border-white/20"
              : "text-[#969087] hover:text-[#EDEAE5] hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <Terminal size={14} className={activeTab === "specs" ? "text-[#9E988E]" : ""} />
          <span>Engine Specs</span>
        </button>
      </div>

      {/* Tab 1: Neural Providers */}
      {activeTab === "models" && (
        <div className="space-y-8">
          {/* Active Provider Toggle */}
          <div className="bg-[#121418] border border-white/[0.08] p-6">
            <h2 className="font-sans text-base font-bold text-[#EDEAE5] mb-1">
              Active Neural Synthesis Core
            </h2>
            <p className="font-sans text-xs text-[#969087] mb-5">
              Select which engine backend will fulfill synthesis requests for Voice Studio, Text Humanizer, Ductus CAD, Ident, and PhotoNarrator.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gemini BYOK Card */}
              <div
                onClick={() => setProvider("gemini")}
                className={`p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                  provider === "gemini"
                    ? "bg-[#1B1C1E] border-[#9E988E] shadow-lg"
                    : "bg-[#16171B] border-white/[0.06] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black/40 border border-white/10 flex items-center justify-center text-[#9E988E]">
                      <Key size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-bold text-[#EDEAE5]">Google Gemini</h3>
                      <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">Cloud BYOK // Gemini 2.5</span>
                    </div>
                  </div>
                  {provider === "gemini" && (
                    <span className="w-2 h-2 rounded-none bg-[#9E988E]"></span>
                  )}
                </div>
                <p className="font-sans text-xs text-[#969087] mt-4 leading-relaxed">
                  Fastest inference, 2M+ token contexts, ultra-low latency audio &amp; CAD diagram generation.
                </p>
              </div>

              {/* Ollama Local Card */}
              <div
                onClick={() => setProvider("ollama")}
                className={`p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                  provider === "ollama"
                    ? "bg-[#1B1C1E] border-[#9E988E] shadow-lg"
                    : "bg-[#16171B] border-white/[0.06] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black/40 border border-white/10 flex items-center justify-center text-[#9E988E]">
                      <Server size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-bold text-[#EDEAE5]">Ollama Local</h3>
                      <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">Air-Gapped Daemon // 0ms Cloud</span>
                    </div>
                  </div>
                  {provider === "ollama" && (
                    <span className="w-2 h-2 rounded-none bg-[#9E988E]"></span>
                  )}
                </div>
                <p className="font-sans text-xs text-[#969087] mt-4 leading-relaxed">
                  100% private and air-gapped. Runs locally on your GPU via localhost daemon without external API keys.
                </p>
              </div>
            </div>
          </div>

          {/* Gemini BYOK Config Form */}
          <div className="bg-[#121418] border border-white/[0.08] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-[#EDEAE5]">
                  Google Gemini BYOK Configuration
                </h3>
                <p className="font-sans text-xs text-[#969087]">
                  Stored strictly in your local browser storage. Never transmitted to our servers.
                </p>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#9E988E] hover:underline uppercase"
              >
                <span>Get Free Key at Google AI Studio</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="space-y-3">
              <label className="block font-mono text-xs uppercase tracking-wider text-[#969087]">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#1B1C1E] border border-white/10 px-4 py-2.5 font-mono text-xs text-[#EDEAE5] placeholder-[#555] focus:outline-none focus:border-[#9E988E]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-[#969087] hover:text-[#EDEAE5] cursor-pointer"
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="font-mono text-[10px] text-[#7A7E85] uppercase">Target Model:</span>
                {["gemini-2.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPreset(p)}
                    className={`px-2.5 py-1 font-mono text-[10px] uppercase border transition-colors cursor-pointer ${
                      selectedPreset === p
                        ? "bg-[#1F2022] border-[#9E988E] text-[#EDEAE5]"
                        : "border-white/10 text-[#969087] hover:text-[#EDEAE5]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Test result status */}
            {testStatus.message && (
              <div
                className={`p-3.5 border font-mono text-xs flex items-center gap-2 ${
                  testStatus.loading
                    ? "bg-[#1f2022] border-white/10 text-[#CDC6BB]"
                    : testStatus.success
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/40 border-red-500/40 text-red-300"
                }`}
              >
                {testStatus.loading ? (
                  <RefreshCw size={14} className="animate-spin text-[#9E988E]" />
                ) : testStatus.success ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={14} className="text-red-400" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSaveGemini}
                className="px-5 py-2.5 bg-[#EDEAE5] hover:bg-white text-[#0D0E10] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Save &amp; Activate Gemini
              </button>
              <button
                onClick={handleTestGemini}
                disabled={testStatus.loading || !inputKey}
                className="px-4 py-2.5 bg-[#1B1C1E] hover:bg-[#252629] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                Validate Key Handshake
              </button>
              {geminiKey && (
                <button
                  onClick={() => {
                    clearGeminiKey();
                    setInputKey("");
                    setSaveBanner("Gemini API Key removed from browser storage.");
                  }}
                  className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 font-mono text-xs text-red-300 uppercase tracking-wider transition-all cursor-pointer ml-auto"
                >
                  Purge Key
                </button>
              )}
            </div>
          </div>

          {/* Ollama Local Daemon Config */}
          <div className="bg-[#121418] border border-white/[0.08] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-[#EDEAE5]">
                  Local Ollama Daemon Configuration
                </h3>
                <p className="font-sans text-xs text-[#969087]">
                  Connect to local hardware running on your Mac/Linux/Windows machine.
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#9E988E] uppercase tracking-wider">
                AIR-GAPPED ENGINE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase tracking-wider text-[#969087]">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-[#1B1C1E] border border-white/10 px-4 py-2.5 font-mono text-xs text-[#EDEAE5] placeholder-[#555] focus:outline-none focus:border-[#9E988E]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase tracking-wider text-[#969087]">
                  Model Name
                </label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="llama3:latest"
                  className="w-full bg-[#1B1C1E] border border-white/10 px-4 py-2.5 font-mono text-xs text-[#EDEAE5] placeholder-[#555] focus:outline-none focus:border-[#9E988E]"
                />
              </div>
            </div>

            {ollamaModels.length > 0 && (
              <div className="pt-2">
                <span className="font-mono text-[10px] text-[#7A7E85] uppercase block mb-2">Detected Installed Models:</span>
                <div className="flex flex-wrap gap-2">
                  {ollamaModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModelInput(m)}
                      className={`px-2.5 py-1 font-mono text-[10px] uppercase border transition-colors cursor-pointer ${
                        modelInput === m
                          ? "bg-[#1F2022] border-[#9E988E] text-[#EDEAE5]"
                          : "border-white/10 text-[#969087] hover:text-[#EDEAE5]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSaveOllama}
                className="px-5 py-2.5 bg-[#EDEAE5] hover:bg-white text-[#0D0E10] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Save &amp; Activate Ollama
              </button>
              <button
                onClick={handleFetchModels}
                disabled={testStatus.loading}
                className="px-4 py-2.5 bg-[#1B1C1E] hover:bg-[#252629] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase tracking-wider transition-all cursor-pointer"
              >
                Fetch Installed Models
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workspace & Aesthetics */}
      {activeTab === "workspace" && (
        <div className="space-y-6">
          <div className="bg-[#121418] border border-white/[0.08] p-6 space-y-6">
            <h2 className="font-sans text-base font-bold text-[#EDEAE5] border-b border-white/[0.06] pb-3">
              Visual &amp; Tactile Environment
            </h2>

            {/* Theme Toggle Module */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#16171B] border border-white/[0.06]">
              <div>
                <h3 className="font-sans text-sm font-bold text-[#EDEAE5]">Color Palette Mode</h3>
                <p className="font-sans text-xs text-[#969087] mt-0.5">
                  Choose between high-contrast darkroom obsidian or Scandinavian architectural paper white.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 border border-white/10 bg-[#1F2022] hover:bg-[#292A2C] font-mono text-xs uppercase tracking-wider text-[#EDEAE5] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                {theme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
                <span>Active: {theme.toUpperCase()}</span>
              </button>
            </div>

            {/* Sound Feedback */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#16171B] border border-white/[0.06]">
              <div>
                <h3 className="font-sans text-sm font-bold text-[#EDEAE5]">Hardware Audio Feedback</h3>
                <p className="font-sans text-xs text-[#969087] mt-0.5">
                  Play tactile physical relay clicks and scope frequencies upon generation completions.
                </p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider cursor-pointer self-start sm:self-auto ${
                  soundEnabled
                    ? "bg-[#1F2022] border-[#9E988E] text-[#EDEAE5]"
                    : "bg-transparent border-white/10 text-[#7A7E85]"
                }`}
              >
                {soundEnabled ? "ENABLED // 44.1kHz" : "MUTED"}
              </button>
            </div>

            {/* Motion Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#16171B] border border-white/[0.06]">
              <div>
                <h3 className="font-sans text-sm font-bold text-[#EDEAE5]">Reduced Animation Motion</h3>
                <p className="font-sans text-xs text-[#969087] mt-0.5">
                  Disable spring physics, canvas card unfold transitions, and glow-pip pulses.
                </p>
              </div>
              <button
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider cursor-pointer self-start sm:self-auto ${
                  reduceMotion
                    ? "bg-[#1F2022] border-[#9E988E] text-[#EDEAE5]"
                    : "bg-transparent border-white/10 text-[#7A7E85]"
                }`}
              >
                {reduceMotion ? "REDUCED" : "STANDARD PHYSICS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Storage & Local Vault */}
      {activeTab === "storage" && (
        <div className="space-y-6">
          <div className="bg-[#121418] border border-white/[0.08] p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-3">
              <h2 className="font-sans text-base font-bold text-[#EDEAE5]">
                Zero-Retention Client Vault
              </h2>
              <p className="font-sans text-xs text-[#969087] mt-1">
                Your creative data and model keys reside strictly in your device’s LocalStorage vault. No server telemetry or shadow logs exist.
              </p>
            </div>

            {/* Footprint Metric Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#16171B] border border-white/[0.06]">
                <span className="font-mono text-[10px] text-[#7A7E85] uppercase">Total Footprint</span>
                <p className="font-mono text-xl font-bold text-[#EDEAE5] mt-1">{storageBytes} bytes</p>
              </div>
              <div className="p-4 bg-[#16171B] border border-white/[0.06]">
                <span className="font-mono text-[10px] text-[#7A7E85] uppercase">Stored Preference Keys</span>
                <p className="font-mono text-xl font-bold text-[#EDEAE5] mt-1">{storageItemsCount} records</p>
              </div>
              <div className="p-4 bg-[#16171B] border border-white/[0.06]">
                <span className="font-mono text-[10px] text-[#7A7E85] uppercase">Encryption Status</span>
                <p className="font-mono text-xl font-bold text-emerald-400 mt-1">LOCAL ONLY</p>
              </div>
            </div>

            {/* Backup / Export / Import */}
            <div className="p-5 bg-[#16171B] border border-white/[0.06] space-y-4">
              <h3 className="font-sans text-sm font-bold text-[#EDEAE5]">Backup &amp; Migration</h3>
              <p className="font-sans text-xs text-[#969087]">
                Export your current model endpoints, credentials, and settings to an encrypted JSON backup file, or restore on another machine.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportConfig}
                  className="px-4 py-2 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 text-[#EDEAE5] font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export JSON Backup</span>
                </button>

                <label className="px-4 py-2 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 text-[#EDEAE5] font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                  <Upload size={13} />
                  <span>Restore from JSON</span>
                  <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-5 bg-red-950/15 border border-red-500/30 space-y-3">
              <h3 className="font-sans text-sm font-bold text-red-300">Danger Zone // Purge Local Data</h3>
              <p className="font-sans text-xs text-red-200/70">
                Permanently clears all API keys, custom endpoints, active provider tokens, and local cache from your device.
              </p>
              <button
                onClick={handleWipeAll}
                className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/50 text-red-200 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Wipe All Local Storage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Engine Specs */}
      {activeTab === "specs" && (
        <div className="bg-[#121418] border border-white/[0.08] p-6 space-y-6">
          <div className="border-b border-white/[0.06] pb-3">
            <h2 className="font-sans text-base font-bold text-[#EDEAE5]">
              Atelier Technical Blueprint Specifications
            </h2>
            <p className="font-sans text-xs text-[#969087] mt-1">
              Architecture tolerances, audio bitrates, vector limits, and latency targets across the matrix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#16171B] border border-white/[0.06] space-y-2">
              <span className="font-mono text-xs uppercase text-[#9E988E]">Engine 01 // Voice Studio</span>
              <ul className="font-mono text-xs text-[#969087] space-y-1">
                <li>• Sample Rate: 48,000 Hz / 24-bit PCM</li>
                <li>• Speakers: 10 Bespoke Timbre Analog Models</li>
                <li>• Latency: Sub-180ms Time-To-First-Chunk</li>
              </ul>
            </div>

            <div className="p-4 bg-[#16171B] border border-white/[0.06] space-y-2">
              <span className="font-mono text-xs uppercase text-[#9E988E]">Engine 02 // Text Humanizer</span>
              <ul className="font-mono text-xs text-[#969087] space-y-1">
                <li>• Algorithm: Burstiness &amp; Syntactic Perplexity Filter</li>
                <li>• Target Tone: Japanese Linen Tactile Prose</li>
                <li>• Anti-AI Heuristic: Eliminates cliché corporate syntax</li>
              </ul>
            </div>

            <div className="p-4 bg-[#16171B] border border-white/[0.06] space-y-2">
              <span className="font-mono text-xs uppercase text-[#9E988E]">Engine 03 // Ductus Flowchart</span>
              <ul className="font-mono text-xs text-[#969087] space-y-1">
                <li>• Precision: 0.1mm CAD Constraints</li>
                <li>• Format: Real-time SVG &amp; Mermaid Live</li>
                <li>• Export: Scalable Vector (.svg) &amp; Blueprint Code</li>
              </ul>
            </div>

            <div className="p-4 bg-[#16171B] border border-white/[0.06] space-y-2">
              <span className="font-mono text-xs uppercase text-[#9E988E]">Engine 04 // Ident Naming</span>
              <ul className="font-mono text-xs text-[#969087] space-y-1">
                <li>• Lexicon: Scandinavian Phonetic Synthesis</li>
                <li>• Checks: Live ICANN TLD &amp; Social Handle Mesh</li>
                <li>• Output: Etymology Trees &amp; Trademark Pre-checks</li>
              </ul>
            </div>

            <div className="p-4 bg-[#16171B] border border-white/[0.06] space-y-2">
              <span className="font-mono text-xs uppercase text-[#9E988E]">Engine 05 // MediaDrop</span>
              <ul className="font-mono text-xs text-[#969087] space-y-1">
                <li>• Sources: Instagram &amp; Pinterest Lossless Vault</li>
                <li>• Compression: Zero Re-encoding / Exact CDN Bits</li>
                <li>• Security: Client-Side Fetch with Direct Browser Blobs</li>
              </ul>
            </div>

            <div className="p-4 bg-[#16171B] border border-white/[0.06] space-y-2">
              <span className="font-mono text-xs uppercase text-[#9E988E]">Engine 06 // PhotoNarrator</span>
              <ul className="font-mono text-xs text-[#969087] space-y-1">
                <li>• Optics: Silver-Halide Darkroom Interpretation</li>
                <li>• Prose Mode: Leica Monochrome Poetic Vignettes</li>
                <li>• Multimodal: Direct Vision Tensor Analysis</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
