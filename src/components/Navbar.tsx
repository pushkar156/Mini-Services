"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";
import { useAuth } from "@/context/AuthContext";
import { Settings, Clock, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { HistoryDrawer } from "./HistoryDrawer";

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
  const { user, setAuthModalOpen, signOutUser } = useAuth();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-12 z-40 rounded-none bg-[#121418]/85 backdrop-blur-md border-b border-white/[0.07]">
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* History Archive Trigger */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center space-x-1.5 bg-[#1B1C1E] hover:bg-[#252629] px-2 sm:px-2.5 py-1 border border-white/[0.08] hover:border-white/20 transition-all text-[#969087] hover:text-[#E3E2E5]"
              title="Open Creative History Archive"
            >
              <Clock size={13} className="text-[#CDC6BB]" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider hidden sm:inline">
                Archive
              </span>
            </button>

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
              <span className="font-mono text-[10px] sm:text-[11px] text-[#cdc6bb] tracking-wider uppercase font-semibold">
                {provider === "ollama"
                  ? "OLLAMA"
                  : isConfigured
                  ? "KEY: OK"
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
                <Settings size={14} />
              </button>
            </div>

            {/* Authentication Control */}
            <div className="relative pl-1 sm:pl-2 border-l border-white/[0.08]">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 px-2 py-1 rounded transition-colors text-xs font-mono text-[#E3E2E5]"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-[#9E988E] text-[#0D0E10] font-bold text-[9px] flex items-center justify-center">
                        {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[70px] sm:max-w-[100px] truncate text-[10px] hidden xs:inline">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown size={10} className="text-[#969087]" />
                  </button>

                  {/* User Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-[#121418] border border-white/10 shadow-2xl py-1 text-xs font-mono z-50 animate-in fade-in duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06] text-[#7A7E85] text-[10px]">
                        <p className="text-[#EDEAE5] font-semibold truncate">
                          {user.displayName || "Atelier User"}
                        </p>
                        <p className="truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => setHistoryOpen(true)}
                        className="w-full px-3 py-2 text-left hover:bg-[#1F2022] text-[#CDC6BB] flex items-center gap-2"
                      >
                        <Clock size={12} />
                        <span>Timeline Archive</span>
                      </button>

                      <button
                        onClick={() => signOutUser()}
                        className="w-full px-3 py-2 text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2 border-t border-white/[0.06]"
                      >
                        <LogOut size={12} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-2.5 py-1 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 text-[#CDC6BB] hover:text-white rounded font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <UserIcon size={11} />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Monogram Badge */}
            <div className="pl-1 sm:pl-2 border-l border-white/[0.08] hidden sm:block">
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

      {/* History Slide-over Drawer */}
      <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
