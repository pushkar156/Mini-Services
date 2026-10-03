"use client";

import React, { useState } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import { X, Check, AlertCircle, RefreshCw, Key, Server } from "lucide-react";

export default function SettingsModal() {
  const {
    geminiKey,
    provider,
    ollamaEndpoint,
    ollamaModel,
    ollamaModels,
    isModalOpen,
    closeModal,
    saveGeminiKey,
    clearGeminiKey,
    setProvider,
    setOllamaConfig,
    validateGeminiKey,
    fetchOllamaModels,
  } = useApiKey();

  const [activeTab, setActiveTab] = useState<"gemini" | "ollama">(provider);
  const [inputKey, setInputKey] = useState<string>(geminiKey);
  const [endpointInput, setEndpointInput] = useState<string>(ollamaEndpoint);
  const [modelInput, setModelInput] = useState<string>(ollamaModel);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });

  if (!isModalOpen) return null;

  const handleSaveGemini = () => {
    saveGeminiKey(inputKey);
    setProvider("gemini");
    setTestStatus({ loading: false, success: true, message: "Gemini key saved successfully." });
    setTimeout(() => closeModal(), 700);
  };

  const handleTestGemini = async () => {
    setTestStatus({ loading: true, message: "Verifying with Google AI Studio..." });
    const res = await validateGeminiKey(inputKey);
    if (res.valid) {
      setTestStatus({ loading: false, success: true, message: "Key verified & active!" });
    } else {
      setTestStatus({ loading: false, success: false, message: res.error || "Key validation failed." });
    }
  };

  const handleSaveOllama = () => {
    setOllamaConfig(endpointInput, modelInput);
    setProvider("ollama");
    setTestStatus({ loading: false, success: true, message: "Ollama config saved." });
    setTimeout(() => closeModal(), 700);
  };

  const handleFetchModels = async () => {
    setTestStatus({ loading: true, message: "Querying local Ollama..." });
    const models = await fetchOllamaModels(endpointInput);
    if (models.length > 0) {
      setTestStatus({ loading: false, success: true, message: `Found ${models.length} installed model(s).` });
      if (!modelInput && models[0]) setModelInput(models[0]);
    } else {
      setTestStatus({ loading: false, success: false, message: "Could not reach Ollama. Check that it is running." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#121418] border border-white/10 rounded-sm shadow-2xl p-5 sm:p-8 text-[#e3e2e5] max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#9E988E]">Atelier Configuration</span>
            <h2 className="text-xl font-bold font-sans tracking-tight text-white mt-0.5">Model & Provider Settings</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 text-[#7A7E85] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 p-1 bg-[#0d0e10] border border-white/5 rounded-sm">
          <button
            onClick={() => setActiveTab("gemini")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === "gemini"
                ? "bg-[#1f2022] text-[#e3e2e5] border-b-2 border-[#9E988E]"
                : "text-[#7A7E85] hover:text-white"
            }`}
          >
            <Key size={14} />
            <span>Google Gemini (BYOK)</span>
          </button>
          <button
            onClick={() => setActiveTab("ollama")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === "ollama"
                ? "bg-[#1f2022] text-[#e3e2e5] border-b-2 border-[#9E988E]"
                : "text-[#7A7E85] hover:text-white"
            }`}
          >
            <Server size={14} />
            <span>Ollama (Local LLM)</span>
          </button>
        </div>

        {/* Tab 1: Gemini BYOK */}
        {activeTab === "gemini" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9E988E] mb-1.5">
                Gemini API Key
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2.5 bg-[#0d0e10] border border-white/10 rounded-sm font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#9E988E] transition-colors"
              />
              <p className="text-[11px] text-[#7A7E85] mt-1.5 leading-relaxed">
                Keys remain encrypted inside your browser (<code className="text-[#9E988E]">localStorage</code>). Zero server storage. Get a free key at{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#9E988E] underline hover:text-white"
                >
                  aistudio.google.com
                </a>
              </p>
              <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono text-[#9E988E] bg-white/[0.03] border border-white/5 px-2.5 py-1.5 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Model Stack: <strong>Gemini 3.8 Flash</strong> (with 3.5 &amp; 3.8 TTS failover)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleTestGemini}
                disabled={testStatus.loading || !inputKey}
                className="flex-1 py-2 px-3 border border-white/15 bg-transparent hover:bg-white/5 text-xs font-mono uppercase tracking-wider text-white transition-colors disabled:opacity-50"
              >
                {testStatus.loading ? "Testing..." : "Test Connection"}
              </button>
              <button
                onClick={handleSaveGemini}
                disabled={!inputKey}
                className="flex-1 py-2 px-3 bg-[#9E988E] hover:bg-[#b5afa6] text-xs font-mono uppercase tracking-wider text-[#0B0C0E] font-bold transition-colors disabled:opacity-50"
              >
                Save & Set Active
              </button>
            </div>

            {geminiKey && (
              <div className="text-right">
                <button
                  onClick={() => {
                    clearGeminiKey();
                    setInputKey("");
                  }}
                  className="text-xs text-rose-400/80 hover:text-rose-400 font-mono tracking-tight underline"
                >
                  Clear Stored Key
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Ollama Local LLM */}
        {activeTab === "ollama" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9E988E] mb-1.5">
                Local Endpoint
              </label>
              <input
                type="text"
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 bg-[#0d0e10] border border-white/10 rounded-sm font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#9E988E]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#9E988E]">
                  Active Model
                </label>
                <button
                  type="button"
                  onClick={handleFetchModels}
                  className="text-[11px] text-[#9E988E] hover:text-white flex items-center gap-1 font-mono"
                >
                  <RefreshCw size={10} />
                  <span>Fetch Installed</span>
                </button>
              </div>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="llama3:latest"
                className="w-full px-3 py-2 bg-[#0d0e10] border border-white/10 rounded-sm font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#9E988E]"
              />
              {ollamaModels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ollamaModels.map((m) => (
                    <button
                      key={m}
                      onClick={() => setModelInput(m)}
                      className={`text-[10px] font-mono px-2 py-0.5 border ${
                        modelInput === m
                          ? "border-[#9E988E] text-white bg-white/10"
                          : "border-white/10 text-[#7A7E85] hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#7A7E85] leading-relaxed">
              Ensure Ollama is started with <code className="text-[#9E988E]">OLLAMA_ORIGINS=&quot;*&quot;</code> to permit browser calls. Note: Voice Studio TTS requires Gemini TTS.
            </p>

            <button
              onClick={handleSaveOllama}
              className="w-full py-2.5 bg-[#9E988E] hover:bg-[#b5afa6] text-xs font-mono uppercase tracking-wider text-[#0B0C0E] font-bold transition-colors"
            >
              Save Ollama & Set Active
            </button>
          </div>
        )}

        {/* Status Feedback */}
        {testStatus.message && (
          <div
            className={`mt-4 p-2.5 border text-xs font-mono flex items-center gap-2 ${
              testStatus.success
                ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                : testStatus.success === false
                ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
                : "bg-white/5 border-white/10 text-[#9E988E]"
            }`}
          >
            {testStatus.success ? <Check size={14} /> : testStatus.success === false ? <AlertCircle size={14} /> : <RefreshCw size={14} className="animate-spin" />}
            <span>{testStatus.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}
