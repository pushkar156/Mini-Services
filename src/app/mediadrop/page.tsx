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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { saveHistoryItem } from "@/lib/historyService";

interface MediaItem {
  url: string;
  type: "video" | "image";
  quality: string;
}

interface CarouselItem {
  media_type: "video" | "image";
  media_url: string;
  thumbnail_url: string;
  filename: string;
  stream_url: string;
}

interface ExtractionResult {
  platform: "instagram" | "pinterest";
  type: "video" | "image" | "carousel";
  media_type?: "video" | "image" | "carousel";
  title: string;
  media_url?: string;
  thumbnail_url?: string;
  thumbnail?: string;
  stream_url?: string;
  filename?: string;
  source_url?: string;
  carousel_items?: CarouselItem[];
  media: MediaItem[];
  meta?: {
    codec?: string;
    aspectRatio?: string;
    status?: string;
  };
}

const SAMPLE_LINKS = [
  { label: "IG Reel (Carlos Alcaraz)", url: "https://www.instagram.com/reel/DctPchKOVcw/" },
  { label: "Pinterest Short (pin.it)", url: "https://pin.it/4k07M3k" },
  { label: "Pinterest Web Pin", url: "https://www.pinterest.com/pin/687497184282361/" },
];

export default function MediaDropPage() {
  const { user } = useAuth();
  const [inputUrl, setInputUrl] = useState("https://www.instagram.com/reel/DctPchKOVcw/");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>({
    platform: "instagram",
    type: "video",
    media_type: "video",
    title: "If you’re going to play, play with fire // Carlos Alcaraz",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    thumbnail_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    media_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    media: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        type: "video",
        quality: "1080p MP4 (H.264)",
      },
    ],
    meta: {
      codec: "H.264 / AVC MP4",
      aspectRatio: "9:16 Vertical",
      status: "READY_VERIFIED",
    },
  });

  // Source platform detection
  const detectedPlatform =
    inputUrl.includes("pinterest") || inputUrl.includes("pin.it")
      ? "PIN / VISUAL"
      : inputUrl.includes("instagram") || inputUrl.includes("instagr.am")
      ? "IG / REEL"
      : "RAW / URL";

  const handleExtract = async (targetUrl?: string) => {
    const urlToExtract = (targetUrl || inputUrl).trim();
    if (!urlToExtract || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/mediadrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToExtract }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract media.");
      }

      setResult(data);

      if (user && data.title) {
        saveHistoryItem(
          user.uid,
          "mediadrop",
          `Extracted ${data.platform?.toUpperCase()} ${data.type?.toUpperCase()}`,
          data.title.slice(0, 80),
          {
            url: urlToExtract,
            platform: data.platform,
            type: data.type,
            media_url: data.media_url,
          }
        ).catch((err) => console.error("MediaDrop history save failed:", err));
      }
    } catch (err: any) {
      alert(err.message || "Extraction error. Please verify the link is public and active.");
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
    const url = result?.media_url || result?.media?.[0]?.url;
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mediaUrl = result?.media_url || result?.media?.[0]?.url;
    if (!mediaUrl) return;

    if (result?.stream_url) {
      window.open(result.stream_url, "_blank");
      return;
    }

    const filename = result?.filename || `mediadrop_${result.platform}_${Date.now()}.${result.type === "video" ? "mp4" : "jpg"}`;
    const streamUrl = `/api/stream?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}&type=${result.type === "video" ? "video" : "image"}`;
    window.open(streamUrl, "_blank");
  };

  const handleDownloadItem = (itemUrl: string, filename: string, type: "video" | "image") => {
    const streamUrl = `/api/stream?url=${encodeURIComponent(itemUrl)}&filename=${encodeURIComponent(filename)}&type=${type}`;
    window.open(streamUrl, "_blank");
  };

  const primaryMediaUrl = result?.media_url || result?.media?.[0]?.url || "";
  const isVideo = result?.type === "video" || result?.media_type === "video";
  const hasCarousel = Boolean(result?.carousel_items && result.carousel_items.length > 0);

  return (
    <div className="flex-1 flex flex-col bg-[#121315] text-[#E3E2E5] selection:bg-[#CDC6BB] selection:text-[#121315] min-h-[calc(100vh-48px)]">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 flex flex-col space-y-8">
        {/* 1. Centered Ingestion Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center space-x-2 bg-[#1B1C1E] px-3 py-1 border border-[#4A463F]/30 rounded mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#688B9A] animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase text-[#969087] tracking-wider">
              MediaDrop Vault // High-Speed Extractor
            </span>
          </div>

          <h1 className="font-sans text-3xl md:text-5xl font-bold text-[#EDEAE5] tracking-tight mb-2">
            MediaDrop Vault
          </h1>
          <p className="text-xs md:text-sm text-[#969087] max-w-xl font-sans">
            Direct high-fidelity extraction for Instagram reels, carousels, and Pinterest visual pins.
          </p>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[11px] font-mono text-[#7A7E85]">Try Sample:</span>
            {SAMPLE_LINKS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  handleExtract(sample.url);
                }}
                className="text-[11px] font-mono px-2.5 py-1 bg-[#1F2022] hover:bg-[#292A2C] border border-white/5 hover:border-white/20 text-[#CDC6BB] rounded-full transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* URL Extraction Capsule */}
          <div className="w-full max-w-3xl mt-5">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center min-h-[56px] sm:h-16 w-full bg-[#0D0E10] border border-[#4A463F]/40 rounded-xl p-2 sm:px-3 gap-2 transition-all duration-200 focus-within:border-[#CDC6BB] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              {/* Source Auto-Detect Badge & Input Group */}
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
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExtract();
                  }}
                  placeholder="Paste Instagram or Pinterest URL..."
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
                  onClick={() => handleExtract()}
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
                <span>ENGINE: HYBRID_PYTHON_NODE</span>
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
                    {result.meta?.codec || (isVideo ? "1080P MP4" : "HD IMAGE")}
                  </span>
                  <span className="uppercase">{result.platform}</span>
                </div>
              </div>

              {/* Viewport Container */}
              <div className="relative bg-[#0D0E10] flex items-center justify-center p-4 md:p-6 min-h-[420px]">
                <div className="relative w-full max-w-[420px] aspect-[9/16] max-h-[580px] bg-[#121315] rounded-lg overflow-hidden border border-[#4A463F]/40 shadow-2xl flex flex-col justify-center items-center">
                  {/* Real Video Player or High-Res Image */}
                  {isVideo && primaryMediaUrl ? (
                    <video
                      key={primaryMediaUrl}
                      src={primaryMediaUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : result.thumbnail || primaryMediaUrl ? (
                    <img
                      src={result.thumbnail || primaryMediaUrl}
                      alt={result.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-[#969087] font-mono text-xs">
                      Media Stream Standby
                    </div>
                  )}
                </div>
              </div>

              {/* Integrated Action Bar */}
              <div className="p-3 border-t border-[#4A463F]/30 bg-[#1F2022] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <div className="flex items-center space-x-2">
                  <a
                    href={result.source_url || inputUrl}
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

              {/* Carousel grid if multi-item */}
              {hasCarousel && (
                <div className="p-4 border-t border-[#4A463F]/30 bg-[#151618] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#CDC6BB] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Carousel Album ({result.carousel_items?.length} items)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {result.carousel_items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1F2022] border border-white/5 rounded p-2 flex flex-col space-y-2 group"
                      >
                        <div className="aspect-square bg-black/40 rounded overflow-hidden relative">
                          <img
                            src={item.thumbnail_url || item.media_url}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 bg-black/70 text-white rounded uppercase">
                            {item.media_type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadItem(item.media_url, item.filename, item.media_type)}
                          className="w-full py-1 text-[10px] font-mono uppercase bg-[#292A2C] hover:bg-[#9E988E] hover:text-[#121315] text-[#EDEAE5] rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Slide #{idx + 1}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">EXTRACTED // OK</span>
                </div>

                {/* Parameter List */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Platform</span>
                    <span className="text-[#EDEAE5] uppercase">{result.platform}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Media Type</span>
                    <span className="text-[#EDEAE5] uppercase">{result.type || result.media_type}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Aspect Ratio</span>
                    <span className="text-[#CDC6BB]">{result.meta?.aspectRatio || "9:16"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#4A463F]/20">
                    <span className="text-[#969087]">Stream Protocol</span>
                    <span className="text-[#EDEAE5]">{result.meta?.codec || "Direct CDN Stream"}</span>
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

              {/* Information Note */}
              <div className="bg-[#121315] border border-[#4A463F]/20 p-4 rounded text-xs text-[#969087] font-mono space-y-1.5">
                <span className="text-[#CDC6BB] font-semibold block uppercase">
                  MediaDrop Extraction Engine
                </span>
                <p>
                  Powered by Python hybrid stream extraction. Directly parses public metadata,
                  resolves original-quality Pinterest assets, and bypasses thumbnail degradation.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
