"use client";

import React from "react";
import Link from "next/link";
import OviLogo from "./OviLogo";
import { useApiKey } from "@/context/ApiKeyContext";
import {
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  CloudDownload,
  Camera,
  Phone,
  Mail,
  Shield,
  Sliders,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const { openModal } = useApiKey();
  const currentYear = new Date().getFullYear();

  const SERVICES = [
    { name: "Voice Studio", href: "/voice", icon: Mic, desc: "Braun Hi-Fi multi-speaker TTS" },
    { name: "Text Humanizer", href: "/humanizer", icon: FileEdit, desc: "Cadence & perplexity balancer" },
    { name: "Ductus CAD", href: "/ductus", icon: Network, desc: "Architectural flowchart blueprints" },
    { name: "Ident Naming", href: "/ident", icon: Fingerprint, desc: "Haute couture brand lexicon" },
    { name: "MediaDrop", href: "/mediadrop", icon: CloudDownload, desc: "Lossless Instagram & Pinterest vault" },
    { name: "PhotoNarrator", href: "/photonarrator", icon: Camera, desc: "Cine-silver photographic prose" },
  ];

  return (
    <footer className="w-full bg-[#0D0E10] border-t border-white/[0.08] text-[#969087] transition-colors mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        {/* Main Grid: 4 Columns on desktop, responsive stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-white/[0.06]">
          
          {/* Col 1: Brand & Atelier Mission (Cols 1-4) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label="OVI Atelier Homepage"
            >
              <OviLogo size={28} />
              <div className="flex items-center gap-1.5 text-white font-sans font-bold text-base tracking-tight uppercase">
                <span>OVI ATELIER</span>
                <span className="w-1.5 h-1.5 bg-[#9E988E] inline-block"></span>
              </div>
            </Link>
            
            <p className="font-sans text-xs sm:text-sm text-[#969087] leading-relaxed max-w-sm">
              Architectural micro-services engineered for synthesis pipelines, lexical cadence alignment, high-fidelity acoustics, and client-first media workflows.
            </p>

            {/* Direct Contact Links (Clickable Phone & Email) */}
            <div className="space-y-2 pt-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#7A7E85]">
                Direct Contact &amp; Concierge
              </div>
              <div className="flex flex-col gap-2 font-mono text-xs">
                <a
                  href="mailto:support@oviatelier.dev"
                  className="flex items-center gap-2 text-[#CDC6BB] hover:text-white transition-colors group"
                  aria-label="Send email to support@oviatelier.dev"
                >
                  <Mail size={13} className="text-[#9E988E] group-hover:scale-110 transition-transform" />
                  <span>support@oviatelier.dev</span>
                  <ArrowUpRight size={11} className="opacity-60" />
                </a>
                <a
                  href="tel:+18005550199"
                  className="flex items-center gap-2 text-[#CDC6BB] hover:text-white transition-colors group"
                  aria-label="Call concierge hotline at +1 (800) 555-0199"
                >
                  <Phone size={13} className="text-[#9E988E] group-hover:scale-110 transition-transform" />
                  <span>+1 (800) 555-0199 (Atelier Toll-Free)</span>
                  <ArrowUpRight size={11} className="opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Creative Micro-Services (Cols 5-8) */}
          <div className="sm:col-span-1 lg:col-span-5 space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-[#CDC6BB] pb-1 border-b border-white/[0.06]">
              Creative Suite Engines
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="group flex items-start gap-2 text-xs text-[#969087] hover:text-[#EDEAE5] transition-colors p-1 rounded hover:bg-white/[0.02]"
                    >
                      <Icon size={14} className="text-[#7A7E85] group-hover:text-[#CDC6BB] mt-0.5 shrink-0 transition-colors" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-[#CDC6BB] group-hover:text-white truncate">
                          {s.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#7A7E85] truncate">
                          {s.desc}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 3: Architecture & Security Controls (Cols 9-12) */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-[#CDC6BB] pb-1 border-b border-white/[0.06]">
              Platform &amp; Sovereignty
            </h3>
            <ul className="space-y-2 font-mono text-xs pt-1">
              <li>
                <button
                  onClick={openModal}
                  className="w-full text-left flex items-center justify-between text-[#969087] hover:text-[#EDEAE5] transition-colors py-1 group"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders size={12} className="text-[#9E988E]" />
                    <span>BYOK &amp; Ollama Models</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.04] rounded group-hover:bg-white/[0.08]">
                    Configure
                  </span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/pushkar156/Mini-Services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-[#969087] hover:text-[#EDEAE5] transition-colors py-1 group"
                >
                  <span className="flex items-center gap-1.5">
                    <ExternalLink size={12} className="text-[#9E988E]" />
                    <span>GitHub Monorepo</span>
                  </span>
                  <ArrowUpRight size={11} className="opacity-60" />
                </a>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-[#969087] py-1">
                  <Shield size={12} className="text-[#9E988E]" />
                  <span>Client-Side Local Vault</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-[#969087] py-1">
                  <Sparkles size={12} className="text-[#9E988E]" />
                  <span>Gemini 2.5/3.x Native</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-strip: Dynamic Copyright Year & Telemetry */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-[#7A7E85]">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} OVI Atelier. All rights reserved.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline text-[#969087]">Private &amp; Edge First</span>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <Link href="/" className="hover:text-[#CDC6BB] transition-colors">
              Directory
            </Link>
            <span>&bull;</span>
            <Link href="/voice" className="hover:text-[#CDC6BB] transition-colors">
              Voice
            </Link>
            <span>&bull;</span>
            <Link href="/mediadrop" className="hover:text-[#CDC6BB] transition-colors">
              MediaDrop
            </Link>
            <span>&bull;</span>
            <span className="text-[#9E988E]">STATUS: OPERATIONAL</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
