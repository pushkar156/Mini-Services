"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";
import { SlidersHorizontal, Settings } from "lucide-react";

interface NavbarProps {
  current?: string;
}

const SERVICES = [
  { id: "hub", name: "Hub", href: "/" },
  { id: "voice", name: "Voice", href: "/voice" },
  { id: "humanizer", name: "Humanizer", href: "/humanizer" },
  { id: "ductus", name: "Ductus", href: "/ductus" },
  { id: "ident", name: "Ident", href: "/ident" },
  { id: "mediadrop", name: "MediaDrop", href: "/mediadrop" },
  { id: "photonarrator", name: "PhotoNarrator", href: "/photonarrator" },
];

export default function Navbar({ current }: NavbarProps) {
  const pathname = usePathname();
  const { isConfigured, provider, openModal } = useApiKey();

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 w-full h-12 z-50 rounded-none bg-[#121418]/85 backdrop-blur-md border-b border-white/[0.07]">
      <div className="flex justify-between items-center h-12 px-4 sm:px-6 w-full max-w-full mx-auto">
        
        {/* Brand & Inline Navigation Rack */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <Link
            href="/"
            className="font-sans text-sm font-bold tracking-tight text-[#e3e2e5] uppercase flex items-center gap-2 group"
          >
            <span>OVI ATELIER</span>
            <span className="w-1.5 h-1.5 bg-[#9E988E] inline-block"></span>
          </Link>

          {/* Segmented Inline Navigation Rack */}
          <nav className="hidden md:flex items-center space-x-6">
            {SERVICES.map((s) => {
              const active = getIsActive(s.href);
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className={`font-mono text-xs uppercase tracking-wider transition-colors duration-150 ${
                    active
                      ? "text-white border-b border-[#9E988E] pb-0.5"
                      : "text-[#7A7E85] hover:text-[#e3e2e5]"
                  }`}
                >
                  {s.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Trailing Controls & Telemetry Capsule */}
        <div className="flex items-center space-x-3">
          
          {/* BYOK / Provider Connection Indicator */}
          <button
            onClick={openModal}
            className="flex items-center space-x-2 bg-[#1f2022] hover:bg-[#292a2c] px-2.5 py-1 border border-white/[0.08] transition-colors"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConfigured ? "bg-[#9E988E] glow-pip" : "bg-[#7A7E85]"
              }`}
            ></span>
            <span className="font-mono text-[11px] text-[#cdc6bb] tracking-wider uppercase font-semibold">
              {provider === "ollama"
                ? "OLLAMA: ACTIVE"
                : isConfigured
                ? "KEY: CONNECTED"
                : "KEY: SETUP"}
            </span>
          </button>

          {/* Settings Trigger Icon */}
          <div className="flex items-center space-x-1">
            <button
              onClick={openModal}
              className="w-8 h-8 flex items-center justify-center text-[#969087] hover:text-white hover:bg-[#1f2022] transition-colors"
              title="Preferences & Key Settings"
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Monogram Badge */}
          <div className="pl-2 border-l border-white/[0.08]">
            <div
              className="w-6 h-6 bg-[#292a2c] border border-white/[0.1] flex items-center justify-center text-[#cdc6bb] font-mono text-[10px] font-bold"
              title="OVI Atelier Monogram"
            >
              OA
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
