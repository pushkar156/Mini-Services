"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import { useAuth } from "@/context/AuthContext";
import { saveHistoryItem } from "@/lib/historyService";
import {
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Copy,
  Check,
  Upload,
  Layers,
  Sparkles,
  FileCode,
  Crosshair,
  Sliders,
  Move,
  Activity,
} from "lucide-react";

const INITIAL_MERMAID = `graph TD
  Client[Edge Ingress Node] --> GW[API Reverse Mesh Router]
  GW -->|ZK Token Auth| AuthNode[Identity Verifier]
  GW -->|Stream Payload| InfKernel[Inference Engine Core]
  AuthNode -->|Session Key| InfKernel
  InfKernel --> SynNode[Synthesis Output Stream]
  InfKernel -.->|Async Telemetry| LogBuf[Observability Buffer]
  
  classDef primary fill:#1f2022,stroke:#cdc6bb,stroke-width:1.5px,color:#e3e2e5
  classDef secondary fill:#1b1c1e,stroke:#4a463f,stroke-width:1px,color:#9e988e
  class Client,InfKernel,SynNode primary
  class GW,AuthNode,LogBuf secondary`;

export default function DuctusPage() {
  const { apiKey } = useApiKey();
  const { user } = useAuth();

  // State
  const [diagramTitle, setDiagramTitle] = useState("SYS_KERNEL_ORCHESTRATION.V2");
  const [promptTopic, setPromptTopic] = useState("Microservice Event-Driven Pipeline");
  const [details, setDetails] = useState("");
  const [mermaidCode, setMermaidCode] = useState(INITIAL_MERMAID);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Uploaded image for multimodal analysis
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mermaid SVG render ref
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>("");

  // Dynamically import and render Mermaid
  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!mermaidCode.trim()) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#121315",
            primaryColor: "#1f2022",
            primaryBorderColor: "#cdc6bb",
            primaryTextColor: "#e3e2e5",
            lineColor: "#cdc6bb",
            secondaryColor: "#1b1c1e",
            tertiaryColor: "#141312",
          },
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: "basis",
          },
        });

        const id = `ductus-graph-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (isMounted) {
          setRenderedSvg(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Mermaid syntax error");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [mermaidCode]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Flowchart via AI
  const handleGenerate = async () => {
    if (!promptTopic.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      let imageBase64: string | undefined;
      let imageMime: string | undefined;

      if (imageFile) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageBase64 = base64Data;
        imageMime = imageFile.type;
      }

      const res = await fetch("/api/ductus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: promptTopic,
          details,
          imageBase64,
          imageMime,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate flowchart");
      }

      setMermaidCode(data.mermaidCode);
      setDiagramTitle(data.title.toUpperCase().replace(/\s+/g, "_") + ".V1");

      if (user && data.mermaidCode) {
        saveHistoryItem(
          user.uid,
          "ductus",
          `Diagram: ${data.title || promptTopic}`,
          `Architectural Blueprint (${data.mermaidCode.split("\n").length} nodes/edges)`,
          {
            title: data.title || promptTopic,
            mermaidCode: data.mermaidCode,
            promptTopic,
            details,
          }
        ).catch((err) => console.error("Ductus history save failed:", err));
      }
      setScale(1);
      setPan({ x: 0, y: 0 });
    } catch (err: any) {
      setError(err.message || "Generation error");
    } finally {
      setIsLoading(false);
    }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!renderedSvg) return;
    const blob = new Blob([renderedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${diagramTitle.toLowerCase()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121315] text-[#E3E2E5] overflow-hidden select-none h-[calc(100vh-48px)]">
      {/* Precision Drafting Sub-Toolbar (40px) */}
      <div className="h-10 w-full bg-[#0D0E10] border-b border-[#4A463F]/30 px-4 flex items-center justify-between text-[#969087] font-mono text-xs z-30">
        {/* Left: Diagram Title & Formats */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-[#4A463F]"></span>
            <input
              value={diagramTitle}
              onChange={(e) => setDiagramTitle(e.target.value)}
              className="bg-transparent text-[#E3E2E5] font-mono text-xs tracking-tight border-b border-transparent focus:border-[#CDC6BB] outline-none"
            />
            <span className="text-[#4A463F]">/</span>
            <span className="text-[#969087] text-[10px]">CAD ARCHITECTURE</span>
          </div>

          <div className="hidden sm:flex items-center bg-[#1B1C1E] border border-[#4A463F]/30 p-0.5 ml-2 rounded">
            <button
              onClick={handleCopy}
              className="px-2 py-0.5 text-[10px] text-[#CDC6BB] hover:bg-[#292A2C] rounded transition-colors"
            >
              {copied ? "COPIED" : "MERMAID"}
            </button>
            <button
              onClick={handleDownloadSvg}
              className="px-2 py-0.5 text-[10px] text-[#969087] hover:text-[#EDEAE5] hover:bg-[#292A2C] rounded transition-colors"
            >
              SVG EXPORT
            </button>
          </div>
        </div>

        {/* Center: Interactive Pan/Zoom HUD */}
        <div className="flex items-center space-x-1 bg-[#1B1C1E] border border-[#4A463F]/30 p-0.5 rounded">
          <button
            onClick={() => setScale((s) => Math.max(0.4, s - 0.15))}
            className="p-1 hover:bg-[#292A2C] rounded text-[#969087] hover:text-[#EDEAE5]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono w-10 text-center text-[#E3E2E5]">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
            className="p-1 hover:bg-[#292A2C] rounded text-[#969087] hover:text-[#EDEAE5]"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1 hover:bg-[#292A2C] rounded text-[#969087] hover:text-[#EDEAE5]"
            title="Reset Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Synthesis Action Button */}
        <div className="flex items-center space-x-3">
          <span className="hidden md:inline text-[10px] text-[#969087]">GRID: 16PX CAD</span>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !promptTopic.trim()}
            className="h-7 px-3 bg-[#9E988E] text-[#121315] hover:bg-[#CDC6BB] font-mono text-[11px] font-semibold tracking-wider flex items-center space-x-1.5 transition-colors rounded disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>SYNTHESIZING...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>COMPILE FLOWCHART</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Three-Panel Studio Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: Specification Prompt & Code Input (300px) */}
        <aside className="w-[300px] flex-shrink-0 bg-[#1B1C1E] border-r border-[#4A463F]/30 flex flex-col justify-between z-20">
          <div className="flex flex-col h-full overflow-hidden">
            {/* Logic Input Header */}
            <div className="h-8 border-b border-[#4A463F]/30 px-3 flex items-center justify-between bg-[#0D0E10]">
              <span className="font-mono text-[10px] text-[#E3E2E5] uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-[#CDC6BB]"></span>
                <span>SYSTEM SPECIFICATION</span>
              </span>
              <span className="font-mono text-[9px] text-[#969087]">MERMAID V10</span>
            </div>

            {/* Spec Prompt Inputs */}
            <div className="p-3 space-y-3 border-b border-[#4A463F]/20">
              <div>
                <label className="font-mono text-[10px] text-[#969087] block mb-1 uppercase">
                  Topic / Architecture Title
                </label>
                <input
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine"
                  className="w-full bg-[#121315] border border-[#4A463F]/40 p-2 font-mono text-xs text-[#E3E2E5] focus:border-[#CDC6BB] outline-none rounded"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-[#969087] block mb-1 uppercase">
                  Details / Steps (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. Ingress -> ZK Auth -> Cache Check -> LLM Kernel -> Response"
                  rows={2}
                  className="w-full bg-[#121315] border border-[#4A463F]/40 p-2 font-mono text-xs text-[#E3E2E5] focus:border-[#CDC6BB] outline-none rounded resize-none"
                />
              </div>
            </div>

            {/* Monospace DSL Editor */}
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[10px] text-[#969087] uppercase">
                  Declarative Pipeline Graph
                </label>
                <button
                  onClick={handleCopy}
                  className="text-[10px] font-mono text-[#969087] hover:text-[#EDEAE5] flex items-center space-x-1"
                >
                  <Copy className="w-2.5 h-2.5" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                className="flex-1 w-full bg-[#0D0E10] border border-[#4A463F]/40 p-2.5 font-mono text-[11px] leading-relaxed text-[#CDC6BB] focus:border-[#CDC6BB] outline-none rounded resize-none overflow-y-auto"
                spellCheck={false}
              />
            </div>

            {/* Multimodal Reverse Spec Dropzone */}
            <div className="p-3 border-t border-[#4A463F]/30 bg-[#0D0E10]/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] text-[#969087] uppercase tracking-wider">
                  Multimodal Reverse Spec
                </span>
                <span className="font-mono text-[9px] text-[#CDC6BB]">VISION PARSER</span>
              </div>
              <label className="border border-dashed border-[#4A463F]/60 hover:border-[#CDC6BB]/50 transition-colors p-2.5 bg-[#1B1C1E] text-center cursor-pointer block rounded group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Upload className="w-4 h-4 mx-auto mb-1 text-[#969087] group-hover:text-[#CDC6BB]" />
                <p className="text-[11px] text-[#E3E2E5] font-sans">
                  {imageFile ? imageFile.name : "Drop whiteboard napkin sketch"}
                </p>
                <p className="text-[9px] text-[#969087] font-mono mt-0.5">
                  JPG, PNG Architecture Capture
                </p>
              </label>
            </div>
          </div>
        </aside>

        {/* CENTER DRAFTING VIEWPORT: Infinite CAD Grid + Dynamic Mermaid Diagram */}
        <section
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing bg-[#121315]"
          style={{
            backgroundImage: "radial-gradient(rgba(205, 198, 187, 0.12) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          {/* Coordinates HUD */}
          <div className="absolute top-3 left-4 text-[#4A463F] font-mono text-[10px] pointer-events-none tracking-widest flex items-center space-x-4 z-10">
            <span>X: {pan.x.toFixed(1)} Y: {pan.y.toFixed(1)}</span>
            <span>SCALE: {scale.toFixed(2)}x</span>
            <span>ENGINE: MERMAID.JS</span>
          </div>

          {/* Rendered Flowchart Container */}
          <div
            ref={mermaidContainerRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: isPanning ? "none" : "transform 0.15s ease-out",
            }}
            className="flex items-center justify-center p-8 select-none"
          >
            {error ? (
              <div className="p-4 bg-[#1B1C1E] border border-red-500/40 rounded text-red-300 font-mono text-xs max-w-md">
                <span className="font-bold block mb-1">Compilation Warning:</span>
                {error}
              </div>
            ) : renderedSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: renderedSvg }}
                className="[&_svg]:max-w-none [&_svg]:h-auto [&_.node]:cursor-pointer"
              />
            ) : (
              <div className="text-center font-mono text-xs text-[#969087]">
                <Activity className="w-6 h-6 mx-auto mb-2 animate-pulse text-[#CDC6BB]" />
                <span>Compiling Blueprint Canvas...</span>
              </div>
            )}
          </div>

          {/* Dimension scale bar (CAD Style) */}
          <div className="absolute bottom-4 left-4 flex flex-col space-y-1 pointer-events-none z-10">
            <div className="w-20 h-1 border-b-2 border-l-2 border-r-2 border-[#4A463F]"></div>
            <span className="font-mono text-[9px] text-[#969087]">100PX CAD METRIC</span>
          </div>

          {/* Telemetry Readout */}
          <div className="absolute bottom-4 right-4 bg-[#0D0E10]/80 border border-[#4A463F]/30 px-3 py-1.5 flex items-center space-x-3 font-mono text-[10px] text-[#969087] z-10 rounded">
            <span>NODES: AUTO</span>
            <span className="text-[#4A463F]">|</span>
            <span className="text-[#CDC6BB]">ORTHOGONAL ACTIVE</span>
          </div>
        </section>

        {/* RIGHT INSPECTOR PANEL: Architecture Parameters & Export (240px) */}
        <aside className="w-[240px] flex-shrink-0 bg-[#1B1C1E] border-l border-[#4A463F]/30 flex flex-col justify-between z-20">
          <div>
            <div className="h-8 border-b border-[#4A463F]/30 px-3 flex items-center justify-between bg-[#0D0E10]">
              <span className="font-mono text-[10px] text-[#E3E2E5] uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-[#4A463F]"></span>
                <span>BLUEPRINT PARAMETERS</span>
              </span>
            </div>

            <div className="p-3 space-y-3 font-mono text-[11px]">
              <div className="bg-[#0D0E10] p-2 border border-[#4A463F]/30 rounded">
                <span className="text-[10px] text-[#CDC6BB] block">ACTIVE GRAPH</span>
                <span className="text-xs text-[#E3E2E5] font-semibold block mt-0.5 truncate">
                  {diagramTitle}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-[#969087] block mb-1 uppercase">Layout Mode</label>
                <div className="bg-[#0D0E10] border border-[#4A463F]/40 p-1.5 text-xs text-[#E3E2E5] rounded">
                  Top-Down Orthogonal (TD)
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#969087] block mb-1 uppercase">Render Engine</label>
                <div className="bg-[#0D0E10] border border-[#4A463F]/40 p-1.5 text-xs text-[#E3E2E5] rounded">
                  Mermaid 10.9 (Client SVG)
                </div>
              </div>

              <div className="pt-2 border-t border-[#4A463F]/20">
                <label className="text-[10px] text-[#969087] block mb-1 uppercase">Tags & Specs</label>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-[#292A2C] px-1.5 py-0.5 text-[9px] text-[#CDC6BB] rounded">#architecture</span>
                  <span className="bg-[#292A2C] px-1.5 py-0.5 text-[9px] text-[#CDC6BB] rounded">#low-latency</span>
                  <span className="bg-[#292A2C] px-1.5 py-0.5 text-[9px] text-[#CDC6BB] rounded">#mermaid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Action */}
          <div className="p-3 border-t border-[#4A463F]/30 bg-[#0D0E10] space-y-2">
            <button
              onClick={handleDownloadSvg}
              className="w-full py-2 bg-[#9E988E] text-[#121315] hover:bg-[#CDC6BB] font-mono text-[10px] uppercase font-semibold transition-colors rounded flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>EXPORT VECTOR SVG</span>
            </button>
            <button
              onClick={handleCopy}
              className="w-full py-1.5 border border-[#4A463F] text-[#CDC6BB] hover:bg-[#1F2022] font-mono text-[10px] uppercase transition-colors rounded flex items-center justify-center space-x-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? "COPIED MERMAID" : "COPY MERMAID CODE"}</span>
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
