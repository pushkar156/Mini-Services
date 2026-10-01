"use client";

import React, { useState } from "react";
import {
  Download,
  Link as LinkIcon,
  Play,
  RotateCcw,
  Sparkles,
  Clipboard,
  ExternalLink,
  Film,
  Camera,
  Layers,
  Check,
  Activity,
  FileCheck,
} from "lucide-react";

interface MediaItem {
  url: string;
  type: "video" | "image";
  quality: string;
}

interface ExtractionResult {
  platform: "instagram" | "pinterest";
  type: "video" | "image";
  title: string;
  media: MediaItem[];
  thumbnail?: string;
  embedUrl?: string | null;
  meta?: {
    codec?: string;
    aspectRatio?: string;
    status?: string;
  };
}

export default function MediaDropPage() {
  const [inputUrl, setInputUrl] = useState(
    "https://www.instagram.com/reel/C82vLaMpkO3/?igsh=MWx1Ymx0NDBpdG1yaw=="
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>({
    platform: "instagram",
    type: "video",
    title: "Cinematic Vertical Scandinavian Interior // Basalt & Raw Oak",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    media: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        type: "video",
        quality: "1080p MP4 (H.264)",
      },
    ],
    meta: {
      codec: "H.264 / AVC 60FPS",
      aspectRatio: "9:16 Vertical",
      status: "PAYLOAD_CACHED_EDGE",
    },
  });

  // Source platform detection
  const detectedPlatform = inputUrl.includes("pinterest") || inputUrl.includes("pin.it")
    ? "PIN / VISUAL"
    : inputUrl.includes("instagram")
    ? "IG / REEL"
    : "RAW / URL";

  const handleExtract = async () => {
    if (!inputUrl.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/mediadrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract media.");
      }

      setResult(data);
    } catch (err: any) {
      alert(err.message || "Extraction error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputUrl(text);
    } catch (e) {
      // Clipboard access fallback
    }
  };

  const handleCopyLink = () => {
    if (!result?.media[0]?.url) return;
    navigator.clipboard.writeText(result.media[0].url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.media[0]?.url) return;
    const mediaUrl = result.media[0].url;
    const filename = `mediadrop_${result.platform}_${Date.now()}.${result.type === "video" ? "mp4" : "jpg"}`;
    const streamUrl = `/api/stream?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}`;
    window.open(streamUrl, "_blank");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121315] text-[#E3E2E5] selection:bg-[#CDC6BB] selection:text-[#121315] min-h-[calc(100vh-48px)]">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 flex flex-col space-y-8">
        {/* 1. Centered Ingestion Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center space-x-2 bg-[#1B1C1E] px-3 py-1 border border-[#4A463F]/30 rounded mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#688B9A] animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase text-[#969087] tracking-wider">
              Ingestion Microservice // Direct Pipe v4.2
            </span>
          </div>

          <h1 className="font-sans text-3xl md:text-5xl font-bold text-[#EDEAE5] tracking-tight mb-2">
            MediaDrop Vault
          </h1>
          <p className="text-xs md:text-sm text-[#969087] max-w-xl font-sans">
            Direct high-fidelity extraction for Instagram reels, carousels, and Pinterest visual pins.
          </p>

          {/* URL Extraction Capsule (64px Tall Pill) */}
          <div className="w-full max-w-3xl mt-6">
            <div className="relative flex items-center h-16 w-full bg-[#0D0E10] border border-[#4A463F]/40 rounded-xl px-3 transition-all duration-200 focus-within:border-[#CDC6BB] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              {/* Source Auto-Detect Badge */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1B1C1E] border border-[#4A463F]/30 rounded-lg mr-3 select-none">
                <Camera className="w-4 h-4 text-[#CDC6BB]" />
                <span className="font-mono text-[11px] text-[#EDEAE5] font-medium uppercase">
                  {detectedPlatform}
                </span>
              </div>

              {/* Input Element */}
              <input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste raw Instagram post, reel, or Pinterest pin URL..."
                className="flex-1 bg-transparent border-0 text-[#EDEAE5] placeholder-[#969087] font-mono text-xs md:text-sm focus:outline-none px-1"
              />

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pl-2">
                <button
                  onClick={handlePaste}
                  className="px-3 h-10 border border-[#4A463F]/40 hover:border-[#969087] text-[#969087] hover:text-[#EDEAE5] font-mono text-[11px] uppercase rounded bg-[#1F2022] transition-all flex items-center space-x-1.5"
                  type="button"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>

                <button
                  onClick={handleExtract}
                  disabled={isLoading || !inputUrl.trim()}
                  className="px-5 h-10 bg-[#9E988E] hover:bg-[#CDC6BB] text-[#121315] font-mono font-semibold text-xs tracking-wider uppercase rounded transition-all flex items-center space-x-2 disabled:opacity-50"
                  type="button"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract Media</span>
                      <span className="text-xs">↵</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Extraction Telemetry Status Bar */}
            <div className="flex flex-wrap items-center justify-between px-3 mt-2 font-mono text-[10px] text-[#969087]">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#688B9A] animate-pulse"></span>
                <span>STATUS: {result?.meta?.status || "READY_IDLE"}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>BYPASS_RATE_LIMIT: ACTIVE</span>
                <span>CDN: RESIDENTIAL_DIRECT</span>
                <span>LATENCY: 38ms</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Media Preview Result Stage (Bento Grid) */}
        {result && (
          <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Media Showcase Player (7 cols) */}
            <div className="lg:col-span-7 bg-[#1B1C1E] border border-[#4A463F]/30 rounded-lg flex flex-col overflow-hidden shadow-xl">
              {/* Card Sub-Header */}
              <div className="h-9 px-4 flex items-center justify-between border-b border-[#4A463F]/30 bg-[#0D0E10]">
                <div className="flex items-center space-x-2">
                  <Film className="w-3.5 h-3.5 text-[#CDC6BB]" />
                  <span className="font-mono text-[10px] uppercase text-[#EDEAE5] tracking-wider">
                    Source Preview Stream
                  </span>
                </div>
                <div className="flex items-center space-x-3 font-mono text-[10px] text-[#969087]">
                  <span className="bg-[#1F2022] px-1.5 py-0.5 rounded text-[#CDC6BB]">
                    {result.meta?.codec || "1080P HD"}
                  </span>
                  <span>60 FPS</span>
                </div>
              </div>

              {/* Viewport Container */}
              <div className="relative bg-[#0D0E10] flex items-center justify-center p-6">
                <div className="relative w-full max-w-[360px] aspect-[9/16] bg-[#121315] rounded-lg overflow-hidden border border-[#4A463F]/40 shadow-2xl flex flex-col justify-end">
                  {/* Visual Render / Poster */}
                  {result.thumbnail ? (
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1B1C1E] text-[#969087] font-mono text-xs">
                      Media Stream Standby
                    </div>
                  )}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E10] via-transparent to-black/30 pointer-events-none"></div>

                  {/* Central Play Pip */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handleDownload}
                      className="w-14 h-14 rounded-full bg-[#121315]/80 backdrop-blur border border-[#CDC6BB]/40 text-[#EDEAE5] flex items-center justify-center hover:scale-105 transition-transform"
                      type="button"
                    >
                      <Play className="w-6 h-6 fill-current pl-1" />
                    </button>
                  </div>

                  {/* Timeline overlay bar */}
                  <div className="relative z-10 p-4 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#EDEAE5]">
                      <span className="bg-[#0D0E10]/80 px-1.5 py-0.5 rounded">00:15 / 00:45</span>
                      <span className="text-[#CDC6BB]">ORIGINAL HIGH-RES</span>
                    </div>
                    <div className="w-full h-1 bg-[#343537] rounded-full overflow-hidden relative">
                      <div className="h-full bg-[#9E988E] w-[42%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrated Action Bar */}
              <div className="p-3 border-t border-[#4A463F]/30 bg-[#1F2022] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <div className="flex items-center space-x-2">
                  <a
                    href={inputUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#292A2C] border border-[#4A463F]/40 hover:border-[#CDC6BB] text-[#EDEAE5] rounded flex items-center space-x-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Source Post</span>
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-[#292A2C] border border-[#4A463F]/40 hover:border-[#CDC6BB] text-[#EDEAE5] rounded flex items-center space-x-1.5 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy CDN Link"}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-4 py-1.5 bg-[#9E988E] hover:bg-[#CDC6BB] text-[#121315] font-semibold rounded uppercase tracking-wider flex items-center space-x-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Media</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Media Metadata & Extraction Inspector (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {/* Telemetry Tile */}
              <div className="bg-[#1B1C1E] border border-[#4A463F]/30 rounded-lg p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#4A463F]/30">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#CDC6BB]" />
                    <span className="font-mono text-xs uppercase text-[#EDEAE5] tracking-wider">
                      Payload Telemetry
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#CDC6BB]">INTEGRITY: 100% OK</span>
                </div>

                {/* Parameter List */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Platform</span>
                    <span className="text-[#EDEAE5] uppercase">{result.platform}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Media Type</span>
                    <span className="text-[#EDEAE5] uppercase">{result.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Aspect Ratio</span>
                    <span className="text-[#CDC6BB]">{result.meta?.aspectRatio || "9:16"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Codec / Stream</span>
                    <span className="text-[#EDEAE5]">{result.meta?.codec || "Direct Stream"}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-[10px] text-[#969087] block mb-1">Title / Caption</span>
                    <p className="text-xs text-[#CDC6BB] font-sans line-clamp-3 leading-relaxed">
                      {result.title}
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-3 border-t border-[#4A463F]/30 space-y-2">
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 bg-[#9E988E] hover:bg-[#CDC6BB] text-[#121315] font-mono text-xs font-semibold uppercase tracking-wider rounded flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Original Media</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2 bg-[#121315] hover:bg-[#292A2C] border border-[#4A463F]/40 text-[#CDC6BB] font-mono text-xs uppercase rounded flex items-center justify-center space-x-2 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Copy CDN Media Stream URL</span>
                  </button>
                </div>
              </div>

              {/* Nordic Glacier Vault Information Note */}
              <div className="bg-[#121315] border border-[#4A463F]/20 p-4 rounded text-xs text-[#969087] font-mono space-y-1.5">
                <span className="text-[#CDC6BB] font-semibold block uppercase">
                  Direct Ingestion Pipeline
                </span>
                <p>
                  Zero serverless IP bans. MediaDrop leverages direct residential client handshake
                  and CDN stream extraction so downloads stay ultra-fast without server rate limits.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
