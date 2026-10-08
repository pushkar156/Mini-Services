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
  AlertCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { saveHistoryItem } from "@/lib/historyService";

interface MediaItem {
  url: string;
  type: "video" | "image";
  quality?: string;
  thumbnail?: string;
  index?: number;
}

interface ExtractionResult {
  success: boolean;
  platform: "instagram" | "pinterest";
  type: "video" | "image" | "carousel";
  title: string;
  media: MediaItem[];
  thumbnail?: string;
  embedUrl?: string | null;
  shortcode?: string;
  pinId?: string;
  sourceUrl?: string;
  meta?: {
    codec?: string;
    aspectRatio?: string;
    status?: string;
    itemCount?: number;
    directPostUrl?: string;
  };
}

export default function MediaDropPage() {
  const { user } = useAuth();

  const [inputUrl, setInputUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  // Source platform detection
  const detectedPlatform =
    inputUrl.includes("pinterest") || inputUrl.includes("pin.it")
      ? "PINTEREST"
      : inputUrl.includes("instagram") || inputUrl.includes("instagr.am")
      ? "INSTAGRAM"
      : inputUrl.trim()
      ? "RAW URL"
      : "STANDBY";

  const handleExtract = async () => {
    if (!inputUrl.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/mediadrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract media.");
      }

      setResult(data);
      setSelectedMediaIndex(0);

      // Save to Firestore History if signed in
      if (user && data.success) {
        saveHistoryItem(
          user.uid,
          "mediadrop",
          data.title || `${data.platform.toUpperCase()} Media Asset`,
          `${data.platform.toUpperCase()} ${data.type} extracted from ${inputUrl.slice(0, 40)}...`,
          {
            url: inputUrl,
            platform: data.platform,
            type: data.type,
            mediaCount: data.media?.length || 1,
            topMediaUrl: data.media?.[0]?.url,
          }
        ).catch((err) => console.error("MediaDrop history save failed:", err));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Extraction failed. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text.trim());
        setErrorMsg(null);
      }
    } catch (e) {
      // Clipboard permissions fallback
    }
  };

  const activeMediaItem = result?.media?.[selectedMediaIndex] || result?.media?.[0];

  const handleCopyLink = () => {
    if (!activeMediaItem?.url) return;
    navigator.clipboard.writeText(activeMediaItem.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeMediaItem?.url || !result) return;
    const isVideo = activeMediaItem.type === "video";
    const ext = isVideo ? "mp4" : "jpg";
    const filename = `mediadrop_${result.platform}_${Date.now()}.${ext}`;

    // If media URL is an Instagram web link rather than CDN file, open direct
    if (activeMediaItem.url.includes("instagram.com/p/") || activeMediaItem.url.includes("instagram.com/reel/")) {
      window.open(activeMediaItem.url, "_blank");
      return;
    }

    const streamUrl = `/api/stream?url=${encodeURIComponent(activeMediaItem.url)}&filename=${encodeURIComponent(filename)}`;
    const anchor = document.createElement("a");
    anchor.href = streamUrl;
    anchor.download = filename;
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121315] text-[#E3E2E5] selection:bg-[#CDC6BB] selection:text-[#121315] min-h-[calc(100vh-48px)]">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 flex flex-col space-y-8">
        {/* 1. Ingestion Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center space-x-2 bg-[#1B1C1E] px-3 py-1 border border-[#4A463F]/30 rounded mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase text-[#969087] tracking-wider">
              High-Fidelity Extraction // Multi-Platform v4.5
            </span>
          </div>

          <h1 className="font-sans text-3xl md:text-5xl font-bold text-[#EDEAE5] tracking-tight mb-2">
            MediaDrop Vault
          </h1>
          <p className="text-xs md:text-sm text-[#969087] max-w-xl font-sans">
            Direct high-fidelity extraction for Instagram reels, carousels, and Pinterest original 4K plates.
          </p>

          {/* URL Extraction Capsule */}
          <div className="w-full max-w-3xl mt-6">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center min-h-[56px] sm:h-16 w-full bg-[#0D0E10] border border-[#4A463F]/40 rounded-xl p-2 sm:px-3 gap-2 transition-all duration-200 focus-within:border-[#CDC6BB] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              {/* Source Auto-Detect Badge */}
              <div className="flex items-center flex-1">
                <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1B1C1E] border border-[#4A463F]/30 rounded-lg mr-2 select-none shrink-0">
                  <Camera className="w-4 h-4 text-[#CDC6BB]" />
                  <span className="font-mono text-[11px] text-[#EDEAE5] font-medium uppercase">
                    {detectedPlatform}
                  </span>
                </div>

                {/* Input Element */}
                <input
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExtract();
                  }}
                  placeholder="Paste Instagram (reel/post) or Pinterest (pin/pin.it) URL..."
                  className="flex-1 bg-transparent border-0 text-[#EDEAE5] placeholder-[#969087] font-mono text-xs md:text-sm focus:outline-none px-1 min-w-0"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 justify-end pt-1 sm:pt-0 sm:pl-2 border-t sm:border-t-0 border-[#4A463F]/20">
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

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center space-x-2.5 text-xs text-rose-300 font-mono text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* Extraction Telemetry Status Bar */}
            <div className="flex flex-wrap items-center justify-between px-3 mt-2 font-mono text-[10px] text-[#969087]">
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${result ? "bg-emerald-400" : "bg-[#688B9A]"} animate-pulse`}></span>
                <span>STATUS: {result?.meta?.status || "READY_IDLE"}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>PIPE: DIRECT_CDN</span>
                <span>LATENCY: FAST</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Media Preview Result Stage (Bento Grid) */}
        {result && (
          <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Media Player / Viewer (7 cols) */}
            <div className="lg:col-span-7 bg-[#1B1C1E] border border-[#4A463F]/30 rounded-lg flex flex-col overflow-hidden shadow-xl">
              {/* Card Sub-Header */}
              <div className="h-9 px-4 flex items-center justify-between border-b border-[#4A463F]/30 bg-[#0D0E10]">
                <div className="flex items-center space-x-2">
                  <Film className="w-3.5 h-3.5 text-[#CDC6BB]" />
                  <span className="font-mono text-[10px] uppercase text-[#EDEAE5] tracking-wider">
                    {result.platform} Preview Stream
                  </span>
                </div>
                <div className="flex items-center space-x-3 font-mono text-[10px] text-[#969087]">
                  <span className="bg-[#1F2022] px-1.5 py-0.5 rounded text-[#CDC6BB]">
                    {activeMediaItem?.quality || (activeMediaItem?.type === "video" ? "1080P MP4" : "Original 4K Plate")}
                  </span>
                  <span>{activeMediaItem?.type.toUpperCase()}</span>
                </div>
              </div>

              {/* Viewport Container */}
              <div className="relative bg-[#0D0E10] flex items-center justify-center p-4 md:p-6 min-h-[380px]">
                <div className="relative w-full max-w-[420px] aspect-[9/16] max-h-[640px] bg-[#121315] rounded-lg overflow-hidden border border-[#4A463F]/40 shadow-2xl flex items-center justify-center">
                  {/* VIDEO PLAYER (When direct video stream is available) */}
                  {activeMediaItem?.type === "video" && !activeMediaItem.url.includes("instagram.com/p/") && !activeMediaItem.url.includes("instagram.com/reel/") ? (
                    <video
                      key={activeMediaItem.url}
                      src={activeMediaItem.url}
                      poster={result.thumbnail || activeMediaItem.thumbnail}
                      controls
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : result.embedUrl ? (
                    /* INSTAGRAM SECURE EMBED VIEWER */
                    <iframe
                      src={result.embedUrl}
                      className="w-full h-full border-0 bg-black"
                      allowTransparency
                      allowFullScreen
                      scrolling="no"
                    />
                  ) : activeMediaItem?.url ? (
                    /* IMAGE VIEWER */
                    <img
                      src={activeMediaItem.url}
                      alt={result.title}
                      className="w-full h-full object-contain bg-black"
                      onError={(e) => {
                        // Fallback to proxy route if direct CDN is hotlink-blocked
                        const target = e.currentTarget;
                        if (!target.src.includes("/api/thumb")) {
                          target.src = `/api/thumb?url=${encodeURIComponent(activeMediaItem.url)}`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-[#969087] font-mono text-xs">
                      Media Stream Standby
                    </div>
                  )}
                </div>
              </div>

              {/* Carousel Multi-Slide Bar (if carousel) */}
              {result.media && result.media.length > 1 && (
                <div className="px-4 py-3 bg-[#161719] border-t border-[#4A463F]/20 flex items-center space-x-2 overflow-x-auto">
                  <span className="text-[10px] font-mono uppercase text-[#969087] mr-2 shrink-0">
                    Slides ({result.media.length}):
                  </span>
                  {result.media.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedMediaIndex(idx)}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        selectedMediaIndex === idx
                          ? "bg-[#CDC6BB] text-[#121315] font-bold border-[#CDC6BB]"
                          : "bg-[#1F2022] text-[#969087] hover:text-[#EDEAE5] border-[#4A463F]/30"
                      }`}
                    >
                      {item.type === "video" ? "🎬 Video" : "🖼️ Plate"} {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Integrated Action Bar */}
              <div className="p-3 border-t border-[#4A463F]/30 bg-[#1F2022] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <div className="flex items-center space-x-2">
                  <a
                    href={result.sourceUrl || inputUrl}
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
                    <span>{copied ? "Copied" : "Copy Direct Link"}</span>
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

            {/* Right Column: Metadata & Telemetry Inspector (5 cols) */}
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
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">VERIFIED CDN</span>
                </div>

                {/* Parameter List */}
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-[#4A463F]/15">
                    <span className="text-[#969087]">TITLE</span>
                    <span className="text-[#EDEAE5] font-sans font-medium text-right max-w-[220px] truncate">
                      {result.title}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#4A463F]/15">
                    <span className="text-[#969087]">PLATFORM</span>
                    <span className="text-[#CDC6BB] uppercase">{result.platform}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#4A463F]/15">
                    <span className="text-[#969087]">MEDIA TYPE</span>
                    <span className="text-[#EDEAE5] capitalize">{activeMediaItem?.type || result.type}</span>
                  </div>

                  {result.media?.length > 1 && (
                    <div className="flex justify-between py-1 border-b border-[#4A463F]/15">
                      <span className="text-[#969087]">TOTAL SLIDES</span>
                      <span className="text-[#EDEAE5]">{result.media.length} Items</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-[#4A463F]/15">
                    <span className="text-[#969087]">RESOLUTION</span>
                    <span className="text-[#EDEAE5]">{activeMediaItem?.quality || "Original Master"}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#4A463F]/15">
                    <span className="text-[#969087]">SECURITY</span>
                    <span className="text-[#EDEAE5]">Direct Encrypted Pipe</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 bg-[#CDC6BB] hover:bg-[#b5afa6] text-[#121315] font-mono text-xs font-bold uppercase rounded flex items-center justify-center space-x-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Extracted Media</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
