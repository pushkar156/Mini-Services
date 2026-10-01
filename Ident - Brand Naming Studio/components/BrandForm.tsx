
import React, { useState } from 'react';
import { BrandInput, Tone } from '../types';
import { Sparkles, Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface BrandFormProps {
  onSubmit: (data: BrandInput) => void;
  isLoading: boolean;
}

const BrandForm: React.FC<BrandFormProps> = ({ onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState<string>(Tone.MODERN);
  const [image, setImage] = useState<string | null>(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  
  // Validation state
  const [touched, setTouched] = useState({
    description: false,
    industry: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImageProcessing(true);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setTimeout(() => {
          setImage(reader.result as string);
          setIsImageProcessing(false);
        }, 400);
      };

      reader.onerror = () => {
        setIsImageProcessing(false);
        console.error("Error reading file");
      };

      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ description: true, industry: true });
    
    if (!description || !industry || isImageProcessing) return;
    
    onSubmit({
      description,
      industry,
      tone,
      visualContext: image || undefined
    });
  };

  const isDescriptionError = touched.description && !description;
  const isIndustryError = touched.industry && !industry;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-400">Project Description</label>
            {isDescriptionError && (
              <span className="text-xs text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                <AlertCircle size={12} /> Description is required
              </span>
            )}
          </div>
          <textarea
            value={description}
            onBlur={() => handleBlur('description')}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full h-32 bg-slate-800/50 border rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 transition-all resize-none ${
              isDescriptionError 
                ? 'border-red-500/50 focus:ring-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                : 'border-slate-700 focus:ring-sky-500/50'
            }`}
            placeholder="Describe your product, website, or brand. What problems does it solve? Who is it for?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-400">Industry</label>
              {isIndustryError && (
                <span className="text-xs text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                  <AlertCircle size={12} /> Required
                </span>
              )}
            </div>
            <input
              type="text"
              value={industry}
              onBlur={() => handleBlur('industry')}
              onChange={(e) => setIndustry(e.target.value)}
              className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 transition-all ${
                isIndustryError 
                  ? 'border-red-500/50 focus:ring-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                  : 'border-slate-700 focus:ring-sky-500/50'
              }`}
              placeholder="e.g. Fintech, SaaS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Brand Persona</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all cursor-pointer"
            >
              {Object.values(Tone).map((t) => (
                <option key={t} value={t} className="bg-slate-900">{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Visual Inspiration (Optional)</label>
          <div className="flex items-center space-x-4 h-40">
            {isImageProcessing ? (
              <div className="flex-1 border-2 border-dashed border-sky-500/30 rounded-xl h-full flex flex-col items-center justify-center bg-sky-500/5 animate-pulse">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-2" />
                <span className="text-sm text-sky-400 font-medium">Processing visual context...</span>
              </div>
            ) : !image ? (
              <label className="flex-1 border-2 border-dashed border-slate-700 rounded-xl h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/30 transition-all group">
                <Upload className="w-8 h-8 text-slate-500 mb-2 group-hover:text-sky-400 transition-colors" />
                <span className="text-sm text-slate-500 group-hover:text-slate-400 px-4 text-center">Upload a prototype, logo sketch, or mood board</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="relative w-full h-full rounded-xl overflow-hidden group border border-slate-700">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="p-2.5 bg-red-500 hover:bg-red-600 rounded-full text-white transform hover:scale-110 transition-all shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        disabled={isLoading || isImageProcessing}
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl text-white font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all active:scale-[0.98]"
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            <span>Forging Names...</span>
          </div>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Brand Names</span>
          </>
        )}
      </button>
    </form>
  );
};

export default BrandForm;
