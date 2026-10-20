"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useApiKey } from "@/context/ApiKeyContext";
import { updateProfile } from "firebase/auth";
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Clock,
  Calendar,
  LogOut,
  Check,
  AlertCircle,
  Edit2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import OviLogo from "@/components/OviLogo";

export default function ProfilePage() {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
  } = useAuth();

  const { isConfigured, provider, geminiKey, ollamaEndpoint } = useApiKey();

  // Profile Edit State
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<string | null>(null);

  // Guest Auth Form State
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleUpdateName = async () => {
    if (!user || !nameInput.trim()) return;
    setNameSaving(true);
    setNameMsg(null);
    try {
      await updateProfile(user, { displayName: nameInput.trim() });
      setNameSaving(false);
      setEditingName(false);
      setNameMsg("Operator moniker updated successfully.");
      setTimeout(() => setNameMsg(null), 3000);
    } catch (err: any) {
      setNameSaving(false);
      setNameMsg(err?.message || "Failed to update profile name.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passInput) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === "signin") {
        await signInWithEmail(emailInput, passInput);
      } else {
        await signUpWithEmail(emailInput, passInput);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed. Check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || "Google authorization cancelled or failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-16 flex flex-col justify-between">
      {/* Top Architectural Header */}
      <section className="mb-8 pb-6 hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#969087]">ATELIER IDENTITY // IDENTITY.V4</span>
            <span className="w-1 h-1 bg-[#4a463f] inline-block"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#9E988E]">SESSION STATUS</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl text-[#EDEAE5] font-bold tracking-tight">
            Operator Profile &amp; Authentication
          </h1>
          <p className="font-sans text-sm text-[#969087] mt-2 max-w-2xl leading-relaxed">
            Manage your authenticated studio identity, cloud timeline synchronization, and active workstation credentials.
          </p>
        </div>

        {/* Telemetry Capsule */}
        <div className="bg-[#121418] border border-white/[0.08] p-4 flex flex-col space-y-2 min-w-[280px]">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#969087] border-b border-white/[0.06] pb-2">
            <span>OPERATOR STATE</span>
            <span className={`font-semibold uppercase text-xs ${user ? "text-emerald-400" : "text-[#9E988E]"}`}>
              {user ? "AUTHENTICATED" : "GUEST (AIR-GAPPED)"}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Cloud Sync</span>
            <span className="text-[#EDEAE5]">{user ? "Active (Firestore)" : "Local-Only"}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Active Neural Core</span>
            <span className="text-[#EDEAE5] uppercase">{provider}</span>
          </div>
        </div>
      </section>

      {/* Main Content: Authenticated vs Guest */}
      {user ? (
        /* Authenticated State */
        <div className="space-y-8">
          {/* Identity Card */}
          <div className="bg-[#121418] border border-white/[0.08] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Operator"}
                    className="w-16 h-16 border border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-[#1F2022] border border-white/20 flex items-center justify-center text-xl font-bold font-mono text-[#EDEAE5]">
                    {(user.displayName || user.email || "O").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans text-xl font-bold text-[#EDEAE5]">
                      {user.displayName || "Anonymous Atelier Operator"}
                    </h2>
                    <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] uppercase">
                      VERIFIED
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#969087] mt-0.5">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => signOutUser()}
                className="px-4 py-2 border border-red-500/30 hover:border-red-500/60 bg-red-950/20 hover:bg-red-950/40 text-red-300 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={13} />
                <span>Disconnect Session</span>
              </button>
            </div>

            {/* Moniker Edit Form */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#969087]">
                  Operator Moniker (Display Name)
                </span>
                {!editingName && (
                  <button
                    onClick={() => {
                      setNameInput(user.displayName || "");
                      setEditingName(true);
                    }}
                    className="font-mono text-[11px] text-[#9E988E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 size={11} />
                    <span>Change Moniker</span>
                  </button>
                )}
              </div>

              {editingName ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter display moniker..."
                    className="w-full sm:max-w-md bg-[#1B1C1E] border border-white/20 px-3 py-2 font-mono text-xs text-[#EDEAE5] focus:outline-none focus:border-[#9E988E]"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleUpdateName}
                      disabled={nameSaving}
                      className="px-4 py-2 bg-[#EDEAE5] text-[#0D0E10] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white cursor-pointer disabled:opacity-50"
                    >
                      {nameSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-4 py-2 border border-white/10 text-[#969087] font-mono text-xs uppercase hover:text-[#EDEAE5] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-xs text-[#CDC6BB]">
                  {user.displayName || "No moniker registered yet."}
                </p>
              )}

              {nameMsg && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                  <Check size={13} />
                  <span>{nameMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Metadata & Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121418] border border-white/[0.08] p-5 space-y-2">
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">Unique Operator ID (UID)</span>
              <p className="font-mono text-xs text-[#EDEAE5] truncate">{user.uid}</p>
              <div className="hairline-t pt-2 text-[10px] font-mono text-[#7A7E85]">
                Cryptographic Firestore Key
              </div>
            </div>

            <div className="bg-[#121418] border border-white/[0.08] p-5 space-y-2">
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">Account Creation</span>
              <p className="font-mono text-xs text-[#EDEAE5]">
                {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Active Session"}
              </p>
              <div className="hairline-t pt-2 text-[10px] font-mono text-[#7A7E85]">
                Cloud Provisioning Timestamp
              </div>
            </div>

            <div className="bg-[#121418] border border-white/[0.08] p-5 space-y-2">
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase tracking-wider">Last Handshake</span>
              <p className="font-mono text-xs text-[#EDEAE5]">
                {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleTimeString() : "Current Instant"}
              </p>
              <div className="hairline-t pt-2 text-[10px] font-mono text-[#7A7E85]">
                Active Client Heartbeat
              </div>
            </div>
          </div>

          {/* Quick Jump Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/history"
              className="group bg-[#121418] border border-white/[0.08] hover:border-white/20 p-5 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B1C1E] border border-white/10 flex items-center justify-center text-[#9E988E]">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-[#EDEAE5] group-hover:text-white">
                    Cloud Timeline History
                  </h3>
                  <span className="font-mono text-[11px] text-[#969087]">View and export all creative outputs</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#7A7E85] group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>

            <Link
              href="/settings"
              className="group bg-[#121418] border border-white/[0.08] hover:border-white/20 p-5 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B1C1E] border border-white/10 flex items-center justify-center text-[#9E988E]">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-[#EDEAE5] group-hover:text-white">
                    API &amp; Model Settings
                  </h3>
                  <span className="font-mono text-[11px] text-[#969087]">Configure Gemini BYOK &amp; local Ollama</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#7A7E85] group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>
          </div>
        </div>
      ) : (
        /* Guest (Unauthenticated) State */
        <div className="space-y-8">
          {/* Guest Identity Overview */}
          <div className="bg-[#121418] border border-white/[0.08] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1F2022] border border-white/20 flex items-center justify-center text-xl font-bold font-mono text-[#9E988E]">
                  G
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans text-xl font-bold text-[#EDEAE5]">Guest Operator</h2>
                    <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-500/40 text-amber-400 font-mono text-[10px] uppercase">
                      LOCAL-FIRST MODE
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#969087] mt-0.5">Air-gapped anonymous browser session</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase">Zero Data Transmitted</span>
            </div>

            <div className="pt-6 space-y-4">
              <p className="font-sans text-sm text-[#969087] leading-relaxed max-w-2xl">
                You are currently exploring OVI Atelier in sovereign local mode. All 6 studio engines (Voice Converter, Text Humanizer, Ductus CAD, Brand Naming, MediaDrop, and PhotoNarrator) work without an account using your browser’s local storage.
              </p>
              <p className="font-sans text-xs text-[#7A7E85] leading-relaxed max-w-2xl">
                Signing in allows you to unlock real-time Firestore timeline synchronization, cross-device persistence, and automatic backups.
              </p>
            </div>
          </div>

          {/* Sign In / Sign Up Module */}
          <div className="bg-[#121418] border border-white/[0.08] p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#9E988E]"></span>
                <h3 className="font-sans text-base font-bold text-[#EDEAE5]">
                  {authMode === "signin" ? "Operator Sign In" : "Register Atelier Moniker"}
                </h3>
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <button
                  onClick={() => setAuthMode("signin")}
                  className={`px-2.5 py-1 uppercase transition-colors cursor-pointer ${
                    authMode === "signin" ? "bg-[#1F2022] text-[#EDEAE5] border border-white/20" : "text-[#7A7E85]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`px-2.5 py-1 uppercase transition-colors cursor-pointer ${
                    authMode === "signup" ? "bg-[#1F2022] text-[#EDEAE5] border border-white/20" : "text-[#7A7E85]"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Google One-Click Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full py-2.5 bg-white hover:bg-[#EDEAE5] text-[#0D0E10] font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-center">
              <span className="flex-1 h-[1px] bg-white/[0.08]"></span>
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase">OR EMAIL CREDENTIALS</span>
              <span className="flex-1 h-[1px] bg-white/[0.08]"></span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-xs uppercase tracking-wider text-[#969087]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="operator@studio.dev"
                  required
                  className="w-full bg-[#1B1C1E] border border-white/10 px-4 py-2.5 font-mono text-xs text-[#EDEAE5] focus:outline-none focus:border-[#9E988E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs uppercase tracking-wider text-[#969087]">
                  Master Password
                </label>
                <input
                  type="password"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#1B1C1E] border border-white/10 px-4 py-2.5 font-mono text-xs text-[#EDEAE5] focus:outline-none focus:border-[#9E988E]"
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-[#1F2022] hover:bg-[#292A2C] border border-white/20 text-[#EDEAE5] font-mono text-xs uppercase font-bold tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                {authLoading ? "Authenticating..." : authMode === "signin" ? "Sign In to Atelier" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
