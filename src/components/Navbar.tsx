"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Sun,
  Moon,
} from "lucide-react";
import CardNav, { CardNavItem } from "./CardNav";
import OviLogo from "./OviLogo";

export default function Navbar() {
  const pathname = usePathname();
  const { isConfigured, provider, openModal } = useApiKey();
  const { user, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number } | null>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDropdownCoords = () => {
    if (profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
  };

  const toggleUserDropdown = () => {
    if (!userDropdownOpen) {
      updateDropdownCoords();
      setUserDropdownOpen(true);
    } else {
      setUserDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (!userDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
      }
    };

    const handleReposition = () => {
      updateDropdownCoords();
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [userDropdownOpen]);


  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // CardNav items with responsive flex weighting: Studio Engines has expanded flex for its 2-column layout
  const navItems: CardNavItem[] = [
    {
      label: "Studio Engines",
      description: "Consolidated creative AI toolbelt for audio, syntax, architecture, and brand.",
      columns: 2,
      flex: 1.8,
      links: [
        {
          label: "Voice Converter",
          href: "/voice",
          ariaLabel: "Open Voice Converter",
          isActive: getIsActive("/voice"),
        },
        {
          label: "Text Humanizer",
          href: "/humanizer",
          ariaLabel: "Open Text Humanizer",
          isActive: getIsActive("/humanizer"),
        },
        {
          label: "Flowchart Generator",
          href: "/ductus",
          ariaLabel: "Open Flowchart Generator",
          isActive: getIsActive("/ductus"),
        },
        {
          label: "PhotoNarrator",
          href: "/photonarrator",
          ariaLabel: "Open PhotoNarrator",
          isActive: getIsActive("/photonarrator"),
        },
        {
          label: "Brand Naming",
          href: "/ident",
          ariaLabel: "Open Brand Naming",
          isActive: getIsActive("/ident"),
        },
        {
          label: "Media Downloader",
          href: "/mediadrop",
          ariaLabel: "Open Media Downloader",
          isActive: getIsActive("/mediadrop"),
        },
      ],
    },
    {
      label: "Pipelines & Setup",
      description: "Workbench orientation, multi-engine pipelines, and model latency benchmarks.",
      flex: 1,
      links: [
        {
          label: "Studio Hub",
          href: "/",
          ariaLabel: "Return to Atelier Home",
          isActive: pathname === "/",
        },
        {
          label: "Workflows & Chains",
          href: "/workflows",
          ariaLabel: "Open Multi-Engine Pipelines",
          isActive: getIsActive("/workflows"),
        },
        {
          label: "Model Diagnostics",
          href: "/diagnostics",
          ariaLabel: "View Model Diagnostics and Latency Benchmarks",
          isActive: getIsActive("/diagnostics"),
        },
      ],
    },
    {
      label: "Trust & Atelier",
      description: "Studio pedigree, operator profile, neural settings, and history chronicles.",
      flex: 1,
      links: [
        {
          label: "About Atelier",
          href: "/about",
          ariaLabel: "About OVI Atelier Studio",
          isActive: getIsActive("/about"),
        },
        {
          label: "Profile",
          href: "/profile",
          ariaLabel: "Operator Profile & Session Canvas",
          isActive: getIsActive("/profile"),
        },
        {
          label: "Settings",
          href: "/settings",
          ariaLabel: "Atelier Preferences & Model Keys",
          isActive: getIsActive("/settings"),
        },
        {
          label: "History Archive",
          href: "/history",
          ariaLabel: "Open Creative History Chronicles",
          isActive: getIsActive("/history"),
        },
      ],
    },
  ];

  return (
    <>
      <header className="fixed top-3 sm:top-4 inset-x-0 z-40 px-4 sm:px-6 md:px-8 pointer-events-none">
        <div className="pointer-events-auto mx-auto w-full max-w-[1440px]">
          <CardNav
            logo={
              <div className="flex items-center gap-2 group cursor-pointer pr-1">
                <OviLogo size={24} />
                <div className="flex items-center gap-1.5 font-sans text-xs sm:text-sm font-bold tracking-tight text-[#EDEAE5] uppercase">
                  <span>OVI ATELIER</span>
                  <span className="w-1.5 h-1.5 bg-[#9E988E] inline-block"></span>
                </div>
              </div>
            }
            logoHref="/"
            logoAlt="OVI Atelier Hallmark"
            items={navItems}
            theme={theme === "light" ? "light" : "dark"}
            surface="glass"
            openOn="click"
            cardEffect="rise"
            stagger={0.12}
            bounce={0.2}
            menuLabel
            openLabel="Services"
            closeLabel="Close"
            speed={1}
            barHeight={54}
            cardHeight={184}
            maxWidth={1440}
            radius={0}
            inset={7}
            fullWidth={false}
            intro={true}
            linkComponent={Link}
            ariaLabel="OVI Atelier Navigation"
            className="w-full"
          >
          {/* Header Utilities Trailing Slot: Uniform Height & Styling */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 1. Theme Toggle Button (Light / Dark) - Exact matching height (40px square) */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] w-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] items-center justify-center rounded-none border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-[var(--cn-text)] transition-colors cursor-pointer shrink-0"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={14} className="hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={14} className="hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* 2. BYOK / Provider Connection Indicator - Exact matching height (40px) */}
            <button
              onClick={openModal}
              className="inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] items-center gap-2 px-2.5 sm:px-3 rounded-none border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--cn-text)] transition-colors cursor-pointer shrink-0"
              title="Configure API Keys & Local Ollama"
            >
              <span
                className={`w-1.5 h-1.5 rounded-none ${
                  isConfigured ? "bg-[#9E988E] glow-pip" : "bg-[#7A7E85]"
                }`}
              />
              <span>
                {provider === "ollama"
                  ? "OLLAMA"
                  : isConfigured
                  ? "KEY: OK"
                  : "KEY"}
              </span>
            </button>

            {/* 3. Authentication Control / Profile - Exact matching height (40px) */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  ref={profileBtnRef}
                  onClick={toggleUserDropdown}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  className="inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] items-center gap-2 px-2.5 sm:px-3 rounded-none border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--cn-text)] transition-colors cursor-pointer"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="w-4 h-4 rounded-none object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-none bg-[#9E988E] text-[#0D0E10] font-bold text-[9px] flex items-center justify-center">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[70px] truncate hidden md:inline">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown
                    size={11}
                    className={`text-[#969087] transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            ) : (
              <Link
                href="/profile"
                className="inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] items-center gap-2 px-2.5 sm:px-3 rounded-none border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--cn-text)] transition-colors shrink-0"
                title="Operator Profile &amp; Sign In"
              >
                <UserIcon size={12} />
                <span className="hidden xs:inline">Profile</span>
              </Link>
            )}
          </div>
        </CardNav>
        </div>
      </header>

      {/* Portal Profile Dropdown Menu - Escapes CardNav overflow-hidden clipping */}
      {mounted &&
        userDropdownOpen &&
        dropdownCoords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${dropdownCoords.top}px`,
              right: `${dropdownCoords.right}px`,
            }}
            className="w-52 bg-[#121418] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.6)] py-1 text-xs font-mono z-[99999] animate-in fade-in zoom-in-95 duration-150 rounded-none backdrop-blur-md"
          >
            <div className="px-3 py-2 border-b border-white/[0.06] text-[#7A7E85] text-[10px]">
              <p className="text-[#EDEAE5] font-semibold truncate">
                {user?.displayName || "Atelier User"}
              </p>
              <p className="truncate text-[#969087]">{user?.email}</p>
            </div>

            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setUserDropdownOpen(false)}
                className="w-full px-3 py-2 text-left hover:bg-[#1F2022] text-[#CDC6BB] hover:text-white flex items-center gap-2 transition-colors"
              >
                <UserIcon size={12} className="text-[#9E988E]" />
                <span>Operator Profile</span>
              </Link>

              <Link
                href="/history"
                onClick={() => setUserDropdownOpen(false)}
                className="w-full px-3 py-2 text-left hover:bg-[#1F2022] text-[#CDC6BB] hover:text-white flex items-center gap-2 transition-colors"
              >
                <Clock size={12} className="text-[#9E988E]" />
                <span>Timeline History</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="w-full px-3 py-2 text-left hover:bg-[#1F2022] text-[#CDC6BB] hover:text-white flex items-center gap-2 transition-colors"
              >
                <Settings size={12} className="text-[#9E988E]" />
                <span>Studio Settings</span>
              </Link>
            </div>

            <button
              onClick={() => {
                setUserDropdownOpen(false);
                signOutUser();
              }}
              className="w-full px-3 py-2 text-left hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2 border-t border-white/[0.06] cursor-pointer transition-colors"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
