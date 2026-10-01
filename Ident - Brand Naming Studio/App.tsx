
import React, { useState, useEffect } from 'react';
import BrandForm from './components/BrandForm';
import BrandResults from './components/BrandResults';
import HistorySection from './components/HistorySection';
import { BrandInput, BrandResult, HistoryItem } from './types';
import { generateBrandNames } from './services/geminiService';
import { Zap, ShieldCheck, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'ident_ai_history_v1';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BrandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (input: BrandInput, brandResult: BrandResult) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      input,
      result: brandResult,
      timestamp: Date.now()
    };
    const updatedHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local history?")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async (input: BrandInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const brandResult = await generateBrandNames(input);
      setResult(brandResult);
      saveToHistory(input, brandResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 md:py-24">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <header className="max-w-4xl mx-auto w-full text-center mb-16 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={14} />
          <span>Pushkar Gangurde</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Id<span className="gradient-text">ent</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Transform your vision into a global identity. Upload your concept and let AI sculpt the perfect name for your next big thing.
        </p>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-grow">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center animate-in fade-in zoom-in-95">
            {error}
          </div>
        )}

        {!result ? (
          <BrandForm onSubmit={handleGenerate} isLoading={isLoading} />
        ) : (
          <BrandResults 
            names={result.names} 
            sources={result.sources} 
            onReset={() => setResult(null)} 
          />
        )}

        <HistorySection 
          history={history} 
          onSelect={handleSelectHistoryItem}
          onClear={handleClearHistory}
          onRemoveItem={handleRemoveHistoryItem}
        />
      </main>

      <footer className="mt-auto pt-24 text-center border-t border-slate-800/50 max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm gap-8 pb-12">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Zap size={16} className="text-amber-500" />
              <span>Instant Generation</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Verified Uniqueness</span>
            </div>
          </div>
          <p>&copy; {new Date().getFullYear()} Ident AI. All results stored locally.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
