
import React from 'react';
import { BrandName, GroundingSource } from '../types';
import { Copy, Check, RotateCcw, ExternalLink, ShieldCheck } from 'lucide-react';

interface BrandResultsProps {
  names: BrandName[];
  sources: GroundingSource[];
  onReset: () => void;
}

const BrandResults: React.FC<BrandResultsProps> = ({ names, sources, onReset }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {names.map((brand, index) => (
          <div
            key={index}
            className="glass p-6 rounded-2xl group relative overflow-hidden transition-all hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {brand.name}
                {/* Wrap icon in span to handle the title tooltip and avoid TS prop errors */}
                <span title="AI Verified uniqueness">
                  <ShieldCheck size={16} className="text-sky-400 opacity-60" />
                </span>
              </h3>
              <button
                onClick={() => copyToClipboard(brand.name, index)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                {copiedIndex === index ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {brand.rationale}
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/0 to-sky-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
          </div>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="glass p-6 rounded-2xl border-sky-500/20">
          <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ExternalLink size={16} />
            Verification Sources (Google Search)
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((source, idx) => (
              <li key={idx} className="text-xs">
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-300 transition-colors flex items-center gap-2 truncate"
                >
                  <span className="truncate">{source.title || source.uri}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw size={18} />
          <span>Try again with new info</span>
        </button>
      </div>
    </div>
  );
};

export default BrandResults;
