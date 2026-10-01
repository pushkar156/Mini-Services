
import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { History, ChevronDown, ChevronUp, Trash2, Clock, ExternalLink } from 'lucide-react';

interface HistorySectionProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onRemoveItem: (id: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({ history, onSelect, onClear, onRemoveItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) return null;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-24">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-slate-800/50 transition-all border border-slate-700/50 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
            <History size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-200">Recent Identifications</h3>
            <p className="text-xs text-slate-500">{history.length} items saved locally</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500 group-hover:translate-y-0.5 transition-transform" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-end">
            <button
              onClick={onClear}
              className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1"
            >
              <Trash2 size={12} /> Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="glass p-4 rounded-xl border-slate-700/30 hover:border-sky-500/30 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500/70 flex items-center gap-1 mb-1">
                      <Clock size={10} /> {formatDate(item.timestamp)}
                    </span>
                    <h4 className="font-bold text-slate-200 truncate pr-8">
                      {item.input.industry} • {item.input.tone}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="absolute top-4 right-4 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.result.names.slice(0, 3).map((n, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800/50 rounded text-xs text-slate-300 border border-slate-700/50">
                      {n.name}
                    </span>
                  ))}
                  {item.result.names.length > 3 && (
                    <span className="text-[10px] text-slate-500 flex items-center">+{item.result.names.length - 3} more</span>
                  )}
                </div>

                <button
                  onClick={() => onSelect(item)}
                  className="w-full py-2 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg text-sky-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink size={12} /> View Results
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySection;
