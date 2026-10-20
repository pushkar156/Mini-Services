"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  HistoryItem,
  ServiceType,
  subscribeToUserHistory,
  removeHistoryItem,
  clearAllUserHistory,
} from "@/lib/historyService";
import {
  Clock,
  Trash2,
  Copy,
  Check,
  Search,
  Download,
  Filter,
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  CloudDownload,
  Camera,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Database,
  Layers,
  Eye,
  X,
  User as UserIcon,
  Sparkles,
} from "lucide-react";

const SERVICE_META: Record<
  ServiceType,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; route: string }
> = {
  voice: { label: "Voice Studio", icon: Mic, route: "/voice" },
  humanizer: { label: "Text Humanizer", icon: FileEdit, route: "/humanizer" },
  ductus: { label: "Ductus CAD", icon: Network, route: "/ductus" },
  ident: { label: "Ident Naming", icon: Fingerprint, route: "/ident" },
  mediadrop: { label: "MediaDrop", icon: CloudDownload, route: "/mediadrop" },
  photonarrator: { label: "PhotoNarrator", icon: Camera, route: "/photonarrator" },
};

export default function HistoryPage() {
  const { user, setAuthModalOpen } = useAuth();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ServiceType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Subscribe to real-time Firestore history
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const filterArg = activeFilter === "all" ? undefined : activeFilter;
    const unsubscribe = subscribeToUserHistory(
      user.uid,
      (updatedItems) => {
        setItems(updatedItems);
        setLoading(false);
      },
      filterArg,
      100
    );

    return () => unsubscribe();
  }, [user, activeFilter]);

  // Copy helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete single item
  const handleDelete = async (itemId?: string) => {
    if (!user || !itemId) return;
    try {
      await removeHistoryItem(user.uid, itemId);
      if (selectedItem?.id === itemId) setSelectedItem(null);
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  // Clear all history
  const handleClearAll = async () => {
    if (!user || items.length === 0) return;
    if (confirm("Are you sure you want to purge all records from your Firestore cloud history?")) {
      setIsClearing(true);
      try {
        await clearAllUserHistory(user.uid);
        setSelectedItem(null);
      } catch (err) {
        console.error("Failed to clear history:", err);
      } finally {
        setIsClearing(false);
      }
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    if (items.length === 0) return;
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atelier-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ["ID", "Service", "Title", "Summary", "Date"];
    const rows = items.map((it) => {
      const dateStr = it.createdAt?.toDate ? it.createdAt.toDate().toISOString() : "";
      return [
        it.id || "",
        it.service,
        `"${(it.title || "").replace(/"/g, '""')}"`,
        `"${(it.summary || "").replace(/"/g, '""')}"`,
        dateStr,
      ].join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atelier-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered & Searched items
  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.summary.toLowerCase().includes(q) ||
          it.service.toLowerCase().includes(q) ||
          JSON.stringify(it.payload).toLowerCase().includes(q)
      );
    }
    if (sortOrder === "asc") {
      result = [...result].reverse();
    }
    return result;
  }, [items, searchQuery, sortOrder]);

  const FILTERS: { id: ServiceType | "all"; label: string }[] = [
    { id: "all", label: "All Chronicles" },
    { id: "voice", label: "Voice Studio" },
    { id: "humanizer", label: "Text Humanizer" },
    { id: "ductus", label: "Ductus CAD" },
    { id: "ident", label: "Ident Naming" },
    { id: "mediadrop", label: "MediaDrop" },
    { id: "photonarrator", label: "PhotoNarrator" },
  ];

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-16 flex flex-col justify-between">
      {/* Top Architectural Header */}
      <section className="mb-8 pb-6 hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#969087]">TIMELINE CHRONICLES // ARCHIVE.V4</span>
            <span className="w-1 h-1 bg-[#4a463f] inline-block"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#9E988E]">OUTPUT LOG</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl text-[#EDEAE5] font-bold tracking-tight">
            Creative History Archive
          </h1>
          <p className="font-sans text-sm text-[#969087] mt-2 max-w-2xl leading-relaxed">
            Inspect, search, copy, and export historical syntheses from Voice Studio, Text Humanizer, Ductus CAD, Ident, MediaDrop, and PhotoNarrator.
          </p>
        </div>

        {/* Telemetry Capsule */}
        <div className="bg-[#121418] border border-white/[0.08] p-4 flex flex-col space-y-2 min-w-[280px]">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#969087] border-b border-white/[0.06] pb-2">
            <span>CHRONICLE STATUS</span>
            <span className={`font-semibold uppercase text-xs ${user ? "text-emerald-400" : "text-amber-400"}`}>
              {user ? "SYNCED TO FIRESTORE" : "GUEST (UNSYNCED)"}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Indexed Records</span>
            <span className="text-[#EDEAE5]">{items.length} items logged</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#969087]">Filtered Results</span>
            <span className="text-[#EDEAE5]">{filteredItems.length} matching</span>
          </div>
        </div>
      </section>

      {/* Guest Warning Banner if not authenticated */}
      {!user && (
        <div className="mb-8 bg-[#16171B] border border-amber-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
              <AlertCircle size={15} />
              <span>Guest Session // Local-Only Mode</span>
            </div>
            <p className="font-sans text-xs text-[#969087] max-w-xl">
              Cloud timeline synchronization requires an authenticated operator profile. Sign in or register to enable persistent cross-device chronicle archives.
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-5 py-2.5 bg-[#EDEAE5] hover:bg-white text-[#0D0E10] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            Sign In / Connect Profile
          </button>
        </div>
      )}

      {/* Toolbar: Search, Filters & Export */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-3 text-[#7A7E85]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chronicles by title, tone, prompt, or parameters..."
              className="w-full bg-[#121418] border border-white/10 pl-9 pr-4 py-2 font-mono text-xs text-[#EDEAE5] placeholder-[#555] focus:outline-none focus:border-[#9E988E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[#7A7E85] hover:text-[#EDEAE5] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="px-3 py-2 bg-[#121418] hover:bg-[#1B1C1E] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase tracking-wider transition-colors cursor-pointer"
              title="Toggle Chronological Sort Order"
            >
              Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>

            {items.length > 0 && (
              <>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-2 bg-[#121418] hover:bg-[#1B1C1E] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export records to JSON"
                >
                  <Download size={13} />
                  <span>JSON</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-[#121418] hover:bg-[#1B1C1E] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export summary to CSV"
                >
                  <Download size={13} />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="px-3 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 font-mono text-xs text-red-300 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Purge all user records"
                >
                  <Trash2 size={13} />
                  <span>Purge</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Engine Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[#1F2022] text-[#EDEAE5] border-[#9E988E]"
                    : "bg-[#121418] text-[#969087] border-white/[0.06] hover:border-white/20 hover:text-[#EDEAE5]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chronicle Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw size={24} className="animate-spin text-[#9E988E]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#969087]">
            Synchronizing Cloud Firestore Timeline...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#121418] border border-white/[0.08] p-8 space-y-4">
          <div className="w-12 h-12 mx-auto bg-[#1B1C1E] border border-white/10 flex items-center justify-center text-[#9E988E]">
            <Clock size={22} />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-[#EDEAE5]">No Chronicles Found</h3>
            <p className="font-sans text-xs text-[#969087] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "No past generations match your search filter."
                : user
                ? "You haven't generated any outputs yet with the active filter."
                : "Sign in to synchronize your past cloud generations, or run an engine below."}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/voice"
              className="px-3.5 py-1.5 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase"
            >
              Voice Studio
            </Link>
            <Link
              href="/humanizer"
              className="px-3.5 py-1.5 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase"
            >
              Text Humanizer
            </Link>
            <Link
              href="/ductus"
              className="px-3.5 py-1.5 bg-[#1F2022] hover:bg-[#292A2C] border border-white/10 font-mono text-xs text-[#EDEAE5] uppercase"
            >
              Ductus CAD
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const meta = SERVICE_META[item.service] || {
              label: item.service,
              icon: Sparkles,
              route: "/",
            };
            const Icon = meta.icon;
            const dateStr = item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recent";

            return (
              <div
                key={item.id}
                className="group bg-[#121418] border border-white/[0.08] hover:border-white/20 p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Card Header: Service Badge & Date */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[#9E988E]" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#969087]">
                        {meta.label}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#7A7E85]">{dateStr}</span>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="font-sans text-sm font-bold text-[#EDEAE5] group-hover:text-white line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs text-[#969087] line-clamp-2 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="hairline-t pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-2.5 py-1 bg-[#1B1C1E] hover:bg-[#252629] border border-white/10 font-mono text-[10px] uppercase text-[#EDEAE5] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={11} />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() =>
                        handleCopy(
                          item.id || "",
                          item.payload?.humanized ||
                            item.payload?.chart ||
                            item.payload?.name ||
                            JSON.stringify(item.payload, null, 2)
                        )
                      }
                      className="p-1 hover:bg-white/[0.06] text-[#969087] hover:text-[#EDEAE5] cursor-pointer"
                      title="Copy Output"
                    >
                      {copiedId === item.id ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={meta.route}
                      className="p-1 hover:bg-white/[0.06] text-[#7A7E85] hover:text-[#9E988E]"
                      title="Open Studio Engine"
                    >
                      <ExternalLink size={13} />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-red-500/10 text-[#7A7E85] hover:text-red-400 cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#121418] border border-white/20 max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-[#9E988E] tracking-widest">
                  CHRONICLE INSPECTOR // {selectedItem.service.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#969087] hover:text-[#EDEAE5] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h2 className="font-sans text-lg font-bold text-[#EDEAE5]">{selectedItem.title}</h2>
              <p className="font-sans text-xs text-[#969087] mt-1">{selectedItem.summary}</p>
            </div>

            {/* Payload View */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-[#7A7E85] uppercase">Output Payload</span>
              <pre className="bg-[#0B0C0E] border border-white/10 p-4 font-mono text-xs text-[#CDC6BB] overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(selectedItem.payload, null, 2)}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <button
                onClick={() =>
                  handleCopy(
                    selectedItem.id || "",
                    JSON.stringify(selectedItem.payload, null, 2)
                  )
                }
                className="px-4 py-2 bg-[#1B1C1E] hover:bg-[#252629] border border-white/10 font-mono text-xs uppercase text-[#EDEAE5] flex items-center gap-2 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy Raw JSON</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-[#EDEAE5] hover:bg-white text-[#0D0E10] font-mono text-xs uppercase font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
