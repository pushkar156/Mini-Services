"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  HistoryItem,
  ServiceType,
  subscribeToUserHistory,
  removeHistoryItem,
} from "@/lib/historyService";
import {
  X,
  Clock,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Mic,
  FileEdit,
  Network,
  Fingerprint,
  CloudDownload,
  Camera,
} from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_META: Record<
  ServiceType,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  voice: { label: "Voice Studio", icon: Mic },
  humanizer: { label: "Humanizer", icon: FileEdit },
  ductus: { label: "Ductus CAD", icon: Network },
  ident: { label: "Ident Lexicon", icon: Fingerprint },
  mediadrop: { label: "MediaDrop", icon: CloudDownload },
  photonarrator: { label: "PhotoNarrator", icon: Camera },
};

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose }) => {
  const { user, setAuthModalOpen } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<ServiceType | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const unsubscribe = subscribeToUserHistory(user.uid, (updatedItems) => {
      setItems(updatedItems);
    }, filter);

    return () => unsubscribe();
  }, [isOpen, user, filter]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (itemId?: string) => {
    if (!user || !itemId) return;
    try {
      await removeHistoryItem(user.uid, itemId);
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const FILTERS: { id?: ServiceType; label: string }[] = [
    { label: "All Records" },
    { id: "voice", label: "Voice" },
    { id: "humanizer", label: "Humanizer" },
    { id: "ductus", label: "Ductus" },
    { id: "ident", label: "Ident" },
    { id: "mediadrop", label: "MediaDrop" },
    { id: "photonarrator", label: "Photo" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#121418] border-l border-white/10 flex flex-col text-[#E3E2E5] shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#9E988E]" />
                <span className="font-mono text-[10px] text-[#969087] uppercase tracking-widest">
                  ATELIER TIMELINE // FIRESTORE CLOUD
                </span>
              </div>
              <h2 className="font-serif text-2xl text-[#EDEAE5]">Creative History Archive</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-white/10 hover:border-white/20 flex items-center justify-center text-[#969087] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-6 py-3 border-b border-white/[0.06] bg-[#0D0E10]/40 flex items-center gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? "bg-[#292A2C] border border-[#CDC6BB]/60 text-[#CDC6BB]"
                    : "bg-[#1B1C1E] border border-white/[0.06] text-[#969087] hover:text-[#EDEAE5]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!user ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded bg-[#1F2022] border border-white/10 flex items-center justify-center text-[#CDC6BB]">
                  <Clock size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#EDEAE5]">Sign In to View History</h3>
                  <p className="text-xs text-[#969087] max-w-sm">
                    Authenticate to save and access generations from Voice Studio, Ductus, Ident, and
                    other engines across sessions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setAuthModalOpen(true);
                  }}
                  className="px-5 py-2 bg-[#9E988E] hover:bg-[#CDC6BB] text-[#0D0E10] font-mono text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                >
                  Sign In with Firebase
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#7A7E85]">
                <span className="font-mono text-xs uppercase tracking-wider">
                  No records stored yet
                </span>
                <p className="text-[11px] font-sans max-w-xs">
                  Generate scripts in Voice Studio, syntheses in Ident, or drafts in Ductus to build
                  your cloud dossier.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const Meta = SERVICE_META[item.service];
                const Icon = Meta?.icon || Clock;
                const dateStr = item.createdAt?.toDate
                  ? item.createdAt.toDate().toLocaleString()
                  : "Just now";

                return (
                  <article
                    key={item.id}
                    className="p-4 bg-[#1B1C1E] border border-white/[0.08] hover:border-white/20 transition-all rounded space-y-3 group"
                  >
                    {/* Item Topbar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-[#292A2C] border border-white/10 rounded text-[#CDC6BB]">
                          <Icon size={12} />
                        </span>
                        <span className="font-mono text-[10px] uppercase text-[#CDC6BB] font-semibold tracking-wider">
                          {Meta?.label || item.service}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#7A7E85]">{dateStr}</span>
                    </div>

                    {/* Title & Summary */}
                    <div>
                      <h4 className="font-sans text-sm font-semibold text-[#EDEAE5] mb-1">
                        {item.title}
                      </h4>
                      <p className="font-sans text-xs text-[#969087] leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#7A7E85] uppercase">
                        ATELIER ITEM // {item.id?.slice(0, 8)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleCopy(
                              item.id || "",
                              item.payload?.text ||
                                item.payload?.code ||
                                item.summary ||
                                JSON.stringify(item.payload, null, 2)
                            )
                          }
                          className="p-1.5 rounded hover:bg-[#292A2C] text-[#969087] hover:text-[#EDEAE5] transition-colors"
                          title="Copy Output"
                        >
                          {copiedId === item.id ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-[#969087] hover:text-red-400 transition-colors"
                          title="Delete from Firestore"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#0D0E10] flex items-center justify-between text-[#7A7E85] font-mono text-[10px]">
            <span>Cloud Firestore // Realtime Sync</span>
            <span>{items.length} Records</span>
          </div>

        </div>
      </div>
    </div>
  );
};
