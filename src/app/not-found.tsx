import React from "react";
import Link from "next/link";
import {
  Home,
  ArrowRight,
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  CloudDownload,
  Camera,
  Compass,
} from "lucide-react";
import OviLogo from "@/components/OviLogo";
import Footer from "@/components/Footer";

export const metadata = {
  title: "404 — Route Not Found",
  description: "The requested architectural route could not be resolved in the OVI Atelier directory.",
};

export default function NotFound() {
  const ENGINES = [
    { title: "Voice Studio", href: "/voice", icon: Mic, code: "01" },
    { title: "Text Humanizer", href: "/humanizer", icon: FileEdit, code: "02" },
    { title: "Ductus CAD", href: "/ductus", icon: Network, code: "03" },
    { title: "Ident Naming", href: "/ident", icon: Fingerprint, code: "04" },
    { title: "MediaDrop", href: "/mediadrop", icon: CloudDownload, code: "05" },
    { title: "PhotoNarrator", href: "/photonarrator", icon: Camera, code: "06" },
  ];

  return (
    <>
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col justify-center items-center text-center">
      
      {/* Visual Monogram Pip */}
      <div className="mb-6 p-4 bg-[#121418] border border-white/10 rounded-full shadow-2xl relative">
        <OviLogo size={42} />
        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-[#0B0C0E]"></span>
      </div>

      {/* Code & Category Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F2022] border border-white/10 rounded-full mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="font-mono text-[11px] text-[#CDC6BB] uppercase tracking-widest font-semibold">
          ERROR 404 // ROUTE DEREFERENCED
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#EDEAE5] tracking-tight font-normal max-w-2xl leading-tight">
        The coordinate you sought does not exist in this canvas.
      </h1>

      <p className="font-sans text-sm sm:text-base text-[#969087] mt-4 max-w-lg leading-relaxed">
        The path might have been migrated, renamed, or severed from the directory matrix. Teleport back to the atelier hub or jump into an active engine below.
      </p>

      {/* Primary Action Button */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="h-10 px-6 bg-[#CDC6BB] hover:bg-white text-[#0B0C0E] font-mono text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 transition-all shadow-lg hover:shadow-white/10"
        >
          <Home size={14} />
          <span>Return to Hub Directory</span>
        </Link>
      </div>

      {/* Quick Route Selector */}
      <section className="w-full max-w-2xl mt-12 pt-10 border-t border-white/[0.08]">
        <div className="flex items-center justify-center gap-2 mb-6 text-[#7A7E85] font-mono text-xs uppercase tracking-wider">
          <Compass size={13} className="text-[#9E988E]" />
          <span>Active Workshop Engines</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ENGINES.map((eng) => {
            const Icon = eng.icon;
            return (
              <Link
                key={eng.href}
                href={eng.href}
                className="p-3 bg-[#121418] hover:bg-[#1B1C1E] border border-white/[0.06] hover:border-white/20 rounded flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className="text-[#7A7E85] group-hover:text-[#CDC6BB] transition-colors" />
                  <span className="font-sans text-xs text-[#E3E2E5] group-hover:text-white font-medium">
                    {eng.title}
                  </span>
                </div>
                <ArrowRight size={11} className="text-[#7A7E85] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      </main>
      <Footer />
    </>
  );
}
