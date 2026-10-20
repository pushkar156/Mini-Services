"use client";

import React, { useState } from "react";
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
import { HistoryDrawer } from "./HistoryDrawer";
import OviLogo from "./OviLogo";

export default function Navbar() {
  const pathname = usePathname();
  const { isConfigured, provider, openModal } = useApiKey();
  const { user, setAuthModalOpen, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
      label: "Platform & Setup",
      description: "Workspace orientation, display settings, and system telemetry.",
      flex: 1,
      links: [
        {
          label: "Home",
          href: "/",
          ariaLabel: "Return to Atelier Home",
          isActive: pathname === "/",
        },
        {
          label: theme === "dark" ? "Light Mode" : "Dark Mode",
          onClick: () => toggleTheme(),
          ariaLabel: "Toggle Interface Theme",
        },
        {
          label: "System Telemetry",
          href: "/#telemetry",
          ariaLabel: "View System Telemetry Node",
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
          {/* Header Utilities Trailing Slot */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-none border border-white/[0.08] hover:border-white/20 bg-[#1B1C1E] hover:bg-[#252629] flex items-center justify-center text-[#969087] hover:text-[#E3E2E5] transition-all cursor-pointer"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <Sun size={13} className="text-[#CDC6BB] hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={13} className="text-[#1A1A1C] hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* History Archive Trigger */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 bg-[#1B1C1E] hover:bg-[#252629] px-2.5 py-1 rounded-none border border-white/[0.08] hover:border-white/20 transition-all text-[#969087] hover:text-[#E3E2E5] cursor-pointer"
              title="Open Creative History Archive"
            >
              <Clock size={12} className="text-[#CDC6BB]" />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                Archive
              </span>
            </button>

            {/* BYOK / Provider Connection Indicator */}
            <button
              onClick={openModal}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-[#1f2022] hover:bg-[#292a2c] px-2 sm:px-2.5 py-1 rounded-none border border-white/[0.08] transition-colors cursor-pointer"
              title="Configure API Keys & Local Ollama"
            >
              <span
                className={`w-1.5 h-1.5 rounded-none ${
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
            <button
              onClick={openModal}
              className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-none items-center justify-center text-[#969087] hover:text-white bg-[#1B1C1E] hover:bg-[#252629] border border-white/[0.08] transition-colors cursor-pointer"
              title="Preferences & Key Settings"
            >
              <Settings size={13} />
            </button>

            {/* Authentication Control */}
            <div className="relative pl-1 border-l border-white/[0.08]">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 px-2 py-1 rounded-none transition-colors text-xs font-mono text-[#E3E2E5] cursor-pointer"
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
                    <span className="max-w-[60px] truncate text-[10px] hidden md:inline">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown size={10} className="text-[#969087]" />
                  </button>

                  {/* User Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-[#121418] border border-white/10 shadow-2xl py-1 text-xs font-mono z-50 animate-in fade-in duration-150 rounded-none"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06] text-[#7A7E85] text-[10px]">
                        <p className="text-[#EDEAE5] font-semibold truncate">
                          {user.displayName || "Atelier User"}
                        </p>
                        <p className="truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="w-full px-3 py-2 text-left hover:bg-[#1F2022] text-[#CDC6BB] flex items-center gap-2"
                      >
                        <UserIcon size={12} />
                        <span>Operator Profile</span>
                      </Link>

                      <Link
                        href="/history"
                        className="w-full px-3 py-2 text-left hover:bg-[#1F2022] text-[#CDC6BB] flex items-center gap-2"
                      >
                        <Clock size={12} />
                        <span>Timeline History</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="w-full px-3 py-2 text-left hover:bg-[#1F2022] text-[#CDC6BB] flex items-center gap-2"
                      >
                        <Settings size={12} />
                        <span>Studio Settings</span>
                      </Link>

                      <button
                        onClick={() => signOutUser()}
                        className="w-full px-3 py-2 text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2 border-t border-white/[0.06] cursor-pointer"
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
                  className="px-2 sm:px-2.5 py-1 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 text-[#CDC6BB] hover:text-white rounded font-mono text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserIcon size={11} />
                  <span className="hidden xs:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </CardNav>
        </div>
      </header>

      {/* History Slide-over Drawer */}
      <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
