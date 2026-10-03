"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      setEmail("");
      setPassword("");
    } catch (err: any) {
      let msg = err.message || "Authentication failed.";
      if (err.code === "auth/invalid-credential") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#121418] border border-white/10 rounded-sm shadow-2xl p-5 sm:p-8 flex flex-col space-y-6 relative text-[#E3E2E5] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 text-[#969087] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Atelier Header */}
        <div className="space-y-1.5 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#969087] tracking-widest uppercase">
              OVI ATELIER // IDENTITY
            </span>
            <span className="w-1 h-1 rounded-full bg-[#CDC6BB]"></span>
            <span className="font-mono text-[10px] text-[#CDC6BB]">FIREBASE SECURE</span>
          </div>
          <h2 className="font-serif text-2xl text-[#EDEAE5]">
            {authMode === "signin" ? "Sign In to Atelier" : "Create Atelier Account"}
          </h2>
          <p className="text-xs text-[#969087] font-sans">
            Sync creative workflows, phonetic archives, and synthesis history across devices.
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 bg-[#1B1C1E] border border-white/[0.06] p-1 rounded font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setError(null);
            }}
            className={`py-1.5 uppercase tracking-wider transition-colors ${
              authMode === "signin"
                ? "bg-[#292A2C] text-[#EDEAE5] font-semibold"
                : "text-[#969087] hover:text-[#E3E2E5]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setError(null);
            }}
            className={`py-1.5 uppercase tracking-wider transition-colors ${
              authMode === "signup"
                ? "bg-[#292A2C] text-[#EDEAE5] font-semibold"
                : "text-[#969087] hover:text-[#E3E2E5]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3.5 py-2.5 rounded text-xs flex items-center gap-2.5 font-mono">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-10 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 hover:border-white/20 transition-all rounded flex items-center justify-center gap-3 font-mono text-xs tracking-wider uppercase text-[#E3E2E5] disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]"></div>
          </div>
          <span className="relative bg-[#121418] px-3 font-mono text-[10px] text-[#7A7E85] uppercase">
            Or with email credentials
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase text-[#969087] flex items-center gap-1.5">
              <Mail size={12} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artisan@atelier.studio"
              className="w-full h-9 bg-[#0D0E10] border border-white/10 rounded px-3 font-mono text-xs text-[#E3E2E5] placeholder-[#7A7E85] focus:border-[#CDC6BB] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase text-[#969087] flex items-center gap-1.5">
              <Lock size={12} />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-9 bg-[#0D0E10] border border-white/10 rounded px-3 font-mono text-xs text-[#E3E2E5] placeholder-[#7A7E85] focus:border-[#CDC6BB] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-[#9E988E] hover:bg-[#CDC6BB] text-[#0D0E10] font-mono text-xs font-semibold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>
              {loading
                ? "AUTHENTICATING..."
                : authMode === "signin"
                ? "SIGN IN TO ATELIER"
                : "INITIALIZE ATELIER ACCOUNT"}
            </span>
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="pt-2 border-t border-white/[0.06] text-center">
          <span className="font-mono text-[10px] text-[#7A7E85]">
            Encrypted with Firebase Auth & Cloud Firestore
          </span>
        </div>
      </div>
    </div>
  );
};
