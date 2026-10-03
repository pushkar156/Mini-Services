"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApiKey } from "@/context/ApiKeyContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Settings,
  Clock,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  CloudDownload,
  Camera,
  Home,
  Sliders,
} from "lucide-react";
import { HistoryDrawer } from "./HistoryDrawer";
import OviLogo from "./OviLogo";

interface NavbarProps {
  current?: string;
}

const SERVICES = [
  { id: "hub", name: "Hub", title: "The Atelier Directory", href: "/", icon: Home, desc: "Overview of creative engines" },
  { id: "voice", name: "Voice", title: "Voice Studio", href: "/voice", icon: Mic, desc: "Braun Hi-Fi audio console" },
  { id: "humanizer", name: "Humanizer", title: "Text Humanizer", href: "/humanizer", icon: FileEdit, desc: "Japanese editorial press" },
  { id: "ductus", name: "Ductus", title: "Ductus CAD", href: "/ductus", icon: Network, desc: "Architectural blueprint diagrams" },
  { id: "ident", name: "Ident", title: "Ident Naming", href: "/ident", icon: Fingerprint, desc: "Haute couture brand atelier" },
  { id: "mediadrop", name: "MediaDrop", title: "MediaDrop", href: "/mediadrop", icon: CloudDownload, desc: "Nordic glacier vault client streamer" },
  { id: "photonarrator", name: "PhotoNarrator", title: "PhotoNarrator", href: "/photonarrator", icon: Camera, desc: "Cine-silver darkroom prose" },
];

export default function Navbar({ current }: NavbarProps) {
  const pathname = usePathname();
  const { isConfigured, provider, openModal } = useApiKey();
  const { user, setAuthModalOpen, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-12 z-40 rounded-none bg-[#121418]/85 backdrop-blur-md border-b border-white/[0.07] transition-colors">
        <div className="flex justify-between items-center h-12 px-3 sm:px-6 w-full max-w-full mx-auto">
          
          {/* Brand & Desktop Navigation */}
          <div className="flex items-center space-x-4 xl:space-x-8">
            <Link
              href="/"
              className="font-sans text-sm font-bold tracking-tight text-[#e3e2e5] uppercase flex items-center gap-2.5 group shrink-0"
            >
              <OviLogo size={25} />
              <div className="flex items-center gap-1.5">
                <span>OVI ATELIER</span>
                <span className="w-1.5 h-1.5 bg-[#9E988E] inline-block"></span>
              </div>
            </Link>

            {/* Desktop Navigation (visible on xl screens) */}
            <nav className="hidden xl:flex items-center space-x-5">
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

          {/* Trailing Controls & Hamburger */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded border border-white/[0.08] hover:border-white/20 bg-[#1B1C1E] hover:bg-[#252629] flex items-center justify-center text-[#969087] hover:text-[#E3E2E5] transition-all"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <Sun size={14} className="text-[#CDC6BB] hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={14} className="text-[#1A1A1C] hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* History Archive Trigger (Hidden on tiny screens, available in hamburger) */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 bg-[#1B1C1E] hover:bg-[#252629] px-2.5 py-1 border border-white/[0.08] hover:border-white/20 transition-all text-[#969087] hover:text-[#E3E2E5]"
              title="Open Creative History Archive"
            >
              <Clock size={13} className="text-[#CDC6BB]" />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                Archive
              </span>
            </button>

            {/* BYOK / Provider Connection Indicator (Compact on mobile) */}
            <button
              onClick={openModal}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-[#1f2022] hover:bg-[#292a2c] px-2 sm:px-2.5 py-1 border border-white/[0.08] transition-colors"
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
                  : "KEY"}
              </span>
            </button>

            {/* Settings Trigger Icon */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                onClick={openModal}
                className="w-8 h-8 flex items-center justify-center text-[#969087] hover:text-white hover:bg-[#1f2022] transition-colors"
                title="Preferences & Key Settings"
              >
                <Settings size={14} />
              </button>
            </div>

            {/* Authentication Control */}
            <div className="relative pl-1 border-l border-white/[0.08]">
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
                    <span className="max-w-[60px] truncate text-[10px] hidden md:inline">
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
                  className="px-2 sm:px-2.5 py-1 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 text-[#CDC6BB] hover:text-white rounded font-mono text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <UserIcon size={11} />
                  <span className="hidden xs:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile / Tablet Hamburger Toggle (visible below xl screens) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-8 h-8 flex items-center justify-center bg-[#1B1C1E] hover:bg-[#252629] border border-white/[0.08] hover:border-white/20 text-[#E3E2E5] rounded transition-colors"
              title="Toggle Service Menu"
            >
              {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>

            {/* Monogram Badge (Desktop only) */}
            <div className="pl-1 sm:pl-2 border-l border-white/[0.08] hidden xl:block">
              <div title="OVI Atelier Hallmark">
                <OviLogo size={22} />
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* =========================================================================
         Mobile & Tablet Responsive Slide-Over / Sheet Navigation
         ========================================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-12 z-30 bg-black/75 backdrop-blur-md xl:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full sm:max-w-md ml-auto h-[calc(100vh-48px)] bg-[#121418] border-l border-white/10 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navigation Heading */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <OviLogo size={20} />
                  <span className="font-mono text-[10px] text-[#969087] uppercase tracking-widest">
                    ATELIER RACK // SERVICES
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#1F2022] border border-white/10 rounded text-[#CDC6BB]">
                  7 ENGINES
                </span>
              </div>

              {/* Service Cards Grid for Mobile & Tablets */}
              <div className="grid grid-cols-1 gap-2.5">
                {SERVICES.map((s) => {
                  const Icon = s.icon;
                  const active = getIsActive(s.href);
                  return (
                    <Link
                      key={s.id}
                      href={s.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-3 rounded border transition-all flex items-center justify-between group ${
                        active
                          ? "bg-[#1F2022] border-[#CDC6BB]/50 text-white"
                          : "bg-[#16181D] border-white/[0.06] text-[#969087] hover:text-[#EDEAE5] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                            active
                              ? "bg-[#292A2C] border-[#CDC6BB]/40 text-[#CDC6BB]"
                              : "bg-[#1F2022] border-white/[0.08] text-[#7A7E85] group-hover:text-white"
                          }`}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-semibold text-[#EDEAE5] group-hover:text-white">
                            {s.title}
                          </span>
                          <span className="font-mono text-[10px] text-[#7A7E85] group-hover:text-[#CDC6BB] leading-tight">
                            {s.desc}
                          </span>
                        </div>
                      </div>

                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C89B6D] shrink-0"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Utilities Tray */}
            <div className="pt-6 border-t border-white/[0.08] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setHistoryOpen(true);
                  }}
                  className="p-2.5 bg-[#1B1C1E] border border-white/[0.08] rounded flex items-center justify-center gap-2 font-mono text-[11px] text-[#CDC6BB] uppercase"
                >
                  <Clock size={13} />
                  <span>Timeline Archive</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openModal();
                  }}
                  className="p-2.5 bg-[#1B1C1E] border border-white/[0.08] rounded flex items-center justify-center gap-2 font-mono text-[11px] text-[#CDC6BB] uppercase"
                >
                  <Sliders size={13} />
                  <span>BYOK & Models</span>
                </button>
              </div>

              <div className="flex items-center justify-between px-1 text-[#7A7E85] font-mono text-[10px]">
                <span>Theme: {theme.toUpperCase()}</span>
                <span>OVI ATELIER // V4.2</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* History Slide-over Drawer */}
      <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
