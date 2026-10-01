"use client";

import React, { useState } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import {
  Upload,
  Sparkles,
  Camera,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Download,
  Share2,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface NarrativeData {
  title: string;
  plateNumber: string;
  dateLocation: string;
  hook: string;
  prose: string;
  metrology?: {
    camera?: string;
    dynamicRange?: string;
    emulsion?: string;
    focalPlane?: string;
  };
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_NARRATIVE: NarrativeData = {
  title: "Monument in Residual Daylight",
  plateNumber: "PLATE N° 04 // THE SILENT ARCHITECT",
  dateLocation: "London Southbank, 1976 / Reconstructed 2026",
  hook: "“A quiet convergence of brutalist shadow and raw silver emulsion, where the geometry of mass refuses to apologize for its silence.”",
  prose: `The framing isolates the sheer verticality of fluted board-formed concrete. Sunlight falls at an acute rake, transforming structural load into pure tonal cadence. Deep carbon crevices hold absolute silence, while the apex catches the fragile luminescence of late-winter atmosphere.

In the far threshold, the miniscule geometry of human posture provides not mere measurement, but psychological counterbalance—a sovereign individual absorbed into the permanence of architectural will. The emulsion grain acts not as noise, but as physical matter, anchoring the visual narrative in the tactile legacy of mid-century optical craft.`,
  metrology: {
    camera: "Leica M11 • 35mm f/1.4 Summilux • ISO 200 • 1/500s",
    dynamicRange: "14.6 EV [Zone III-VIII]",
    emulsion: "Silver Bromide / Fine Grain",
    focalPlane: "Hyperfocal @ 12.8m",
  },
};

export default function PhotoNarratorPage() {
  const { apiKey } = useApiKey();

  const [depth, setDepth] = useState<"haiku" | "editorial" | "cinematic">("editorial");
  const [currentImage, setCurrentImage] = useState<string>(DEFAULT_IMAGE);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<NarrativeData>(DEFAULT_NARRATIVE);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setCurrentImage(result);
        setImageBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageBase64) {
      // If using default image, fetch as blob and encode to base64
      setIsLoading(true);
      try {
        const response = await fetch(currentImage);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setImageBase64(base64);
          triggerApi(base64);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        setIsLoading(false);
      }
      return;
    }

    triggerApi(imageBase64);
  };

  const triggerApi = async (base64: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          depth,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze photograph.");
      }

      setNarrative(data);
    } catch (err: any) {
      alert(err.message || "Narrative error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `${narrative.title}\n${narrative.hook}\n\n${narrative.prose}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121315] text-[#E3E2E5] selection:bg-[#CDC6BB] selection:text-[#121315] min-h-[calc(100vh-48px)]">
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-6 py-6 flex flex-col space-y-6">
        {/* Gallery Sub-Header & Narrative Depth Selector */}
        <section className="py-4 border-b border-[#4A463F]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3">
            <h1 className="font-serif text-2xl md:text-3xl text-[#EDEAE5] tracking-wide uppercase font-normal">
              PhotoNarrator
            </h1>
            <span className="font-mono text-[10px] text-[#969087] tracking-widest uppercase">
              // EXHIBITION &amp; PROSE GENERATION
            </span>
          </div>

          {/* Depth Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] text-[#969087] uppercase hidden sm:inline">
              Narrative Depth:
            </span>
            <div className="inline-flex p-0.5 bg-[#0D0E10] border border-[#4A463F]/40 rounded font-mono text-[11px]">
              {(["haiku", "editorial", "cinematic"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-3 py-1 transition-colors uppercase rounded ${
                    depth === d
                      ? "bg-[#292A2C] text-[#CDC6BB] font-medium"
                      : "text-[#969087] hover:text-[#EDEAE5]"
                  }`}
                  type="button"
                >
                  [{d}]
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1B1C1E] border border-[#4A463F]/40 hover:border-[#CDC6BB] text-[#CDC6BB] hover:text-[#EDEAE5] transition-all font-mono text-[11px] uppercase rounded disabled:opacity-50"
              type="button"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Developing..." : "Regenerate"}</span>
            </button>
          </div>
        </section>

        {/* Dual Artboard Layout: The Photograph vs The Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================================================================== */}
          {/* Left Artboard: "The Photograph" (Cols 1-7)                            */}
          {/* ===================================================================== */}
          <section className="lg:col-span-7 bg-[#0D0E10] border border-[#4A463F]/30 rounded flex flex-col p-4 md:p-6 shadow-xl relative group">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#4A463F]/20">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#CDC6BB] rounded-full"></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#969087]">
                  Artboard 01 // Input Plate
                </span>
              </div>
              <div className="flex items-center space-x-3 font-mono text-[10px]">
                <span className="text-[#969087]">4096 x 2732 px</span>
                <span className="text-[#4A463F]">•</span>
                <span className="text-[#CDC6BB]">MONOCHROME DNG</span>
              </div>
            </div>

            {/* Matting Frame */}
            <div className="relative bg-[#1B1C1E] p-3 md:p-5 border border-[#4A463F]/20 shadow-inner flex flex-col items-center justify-center rounded">
              <div className="relative w-full aspect-[4/3] bg-[#121315] overflow-hidden border border-[#4A463F]/40 rounded flex items-center justify-center">
                <img
                  src={currentImage}
                  alt={narrative.title}
                  className="w-full h-full object-cover filter contrast-[1.08] grayscale brightness-[0.96] transition-transform duration-700 ease-out hover:scale-[1.01]"
                />

                {/* Technical Corner EXIF Overlay */}
                <div className="absolute bottom-3 left-3 bg-[#0D0E10]/80 backdrop-blur-sm border border-[#4A463F]/50 px-2.5 py-1 z-10 rounded">
                  <p className="font-mono text-[10px] text-[#CDC6BB] tracking-tight">
                    {narrative.metrology?.camera || "Leica M11 • 35mm f/1.4 Summilux • ISO 200"}
                  </p>
                </div>

                <div className="absolute top-3 right-3 bg-[#0D0E10]/80 backdrop-blur-sm border border-[#4A463F]/50 px-2 py-0.5 z-10 rounded">
                  <span className="font-mono text-[9px] text-[#969087] uppercase tracking-widest">
                    RAW EV -0.3
                  </span>
                </div>
              </div>

              {/* Sub-strip with Replace Button */}
              <div className="w-full mt-4 pt-3 border-t border-[#4A463F]/20 flex flex-wrap items-center justify-between font-mono text-[10px] text-[#969087] gap-2">
                <div className="flex items-center space-x-4">
                  <span>FILE: M11_08492_SILVER.DNG</span>
                  <span>CURVE: Tri-X 400 Response</span>
                </div>
                <label className="cursor-pointer font-mono text-[10px] text-[#CDC6BB] hover:text-[#EDEAE5] flex items-center gap-1 uppercase transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Replace Visual Plate</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Darkroom Analytical Histogram & Telemetry */}
            <div className="mt-4 grid grid-cols-3 gap-2 font-mono">
              <div className="p-2.5 bg-[#1B1C1E] border border-[#4A463F]/30 rounded flex flex-col">
                <span className="text-[9px] text-[#969087] uppercase tracking-wider">
                  Dynamic Range
                </span>
                <span className="text-[11px] text-[#EDEAE5] mt-1 font-semibold">
                  {narrative.metrology?.dynamicRange || "14.6 EV [Zone III-VIII]"}
                </span>
              </div>
              <div className="p-2.5 bg-[#1B1C1E] border border-[#4A463F]/30 rounded flex flex-col">
                <span className="text-[9px] text-[#969087] uppercase tracking-wider">
                  Emulsion Emulation
                </span>
                <span className="text-[11px] text-[#EDEAE5] mt-1 font-semibold">
                  {narrative.metrology?.emulsion || "Silver Bromide / Fine"}
                </span>
              </div>
              <div className="p-2.5 bg-[#1B1C1E] border border-[#4A463F]/30 rounded flex flex-col">
                <span className="text-[9px] text-[#969087] uppercase tracking-wider">
                  Spatial Focal Plane
                </span>
                <span className="text-[11px] text-[#EDEAE5] mt-1 font-semibold">
                  {narrative.metrology?.focalPlane || "Hyperfocal @ 12.8m"}
                </span>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* Right Artboard: "The Narrative" (Cols 8-12)                           */}
          {/* ===================================================================== */}
          <section className="lg:col-span-5 bg-[#1B1C1E] border border-[#4A463F]/30 rounded flex flex-col p-6 shadow-xl relative">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-5 border-b border-[#4A463F]/20">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#CDC6BB] rounded-full"></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#969087]">
                  Artboard 02 // Museum Prose Label
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-[#292A2C] border border-[#4A463F]/40 font-mono text-[9px] text-[#CDC6BB] rounded">
                  LATENCY: ~380ms
                </span>
              </div>
            </div>

            {/* Plaque Title */}
            <div className="space-y-1 mb-5">
              <p className="font-mono text-[10px] text-[#969087] uppercase tracking-widest">
                {narrative.plateNumber}
              </p>
              <h2 className="font-serif text-2xl md:text-3xl text-[#EDEAE5] tracking-normal font-normal">
                {narrative.title}
              </h2>
              <p className="font-mono text-[10px] text-[#CDC6BB] tracking-wide pt-0.5">
                {narrative.dateLocation}
              </p>
            </div>

            {/* Curated Museum Card Presentation */}
            <article className="flex-1 bg-[#0D0E10] p-6 border border-[#4A463F]/30 rounded flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Large Italic Opening Hook */}
                <p className="font-serif italic text-base md:text-lg text-[#EDEAE5] leading-relaxed border-l-2 border-[#CDC6BB]/60 pl-4 py-1">
                  {narrative.hook}
                </p>

                {/* Multimodal Generated Prose */}
                <div className="text-xs md:text-sm text-[#CDC6BC] leading-relaxed space-y-3 font-sans">
                  {narrative.prose.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#4A463F]/20 flex items-center justify-between gap-3 font-mono text-[10px]">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#1F2022] hover:bg-[#292A2C] border border-[#4A463F]/40 text-[#EDEAE5] rounded flex items-center space-x-1.5 transition-colors uppercase"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy Label"}</span>
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-[#9E988E] hover:bg-[#CDC6BB] text-[#121315] font-semibold rounded uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <span>{isLoading ? "Synthesizing..." : "Curate Variant"}</span>
                </button>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
