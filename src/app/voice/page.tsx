"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApiKey } from "@/context/ApiKeyContext";
import { useAuth } from "@/context/AuthContext";
import { saveHistoryItem } from "@/lib/historyService";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  FileText,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  Check,
  Plus,
} from "lucide-react";

interface VoiceProfile {
  id: string;
  name: string;
  badge: string;
  desc: string;
  latency: string;
}

const VOICES: VoiceProfile[] = [
  { id: "Fenrir", name: "Fenrir", badge: "Nordic / Resonant", desc: "Heavy low-mid presence, documentary baritone", latency: "115ms" },
  { id: "Aoede", name: "Aoede", badge: "Warm / Poetic", desc: "Velvet mid-range, gentle compression ratio", latency: "120ms" },
  { id: "Puck", name: "Puck", badge: "Fast / Dynamic", desc: "Crisp articulation, conversational cadence", latency: "98ms" },
  { id: "Kore", name: "Kore", badge: "Intimate / Dry", desc: "Near-field condenser voicing, minimal room reflection", latency: "104ms" },
  { id: "Charon", name: "Charon", badge: "Deep / Sub-harmonic", desc: "Heavy low-end saturation, authorial delivery", latency: "132ms" },
  { id: "Leda", name: "Leda", badge: "Balanced / Broadcast", desc: "High neutrality, optimal for analytical journals", latency: "110ms" },
];

const PRESETS = [
  {
    id: "documentary",
    name: "Documentary",
    voice: "Fenrir",
    rate: 100,
    pitch: 0,
    emotion: 50,
    text: "The architectural precision of early modular synthesizers was not merely an aesthetic gesture. It established an ergonomic paradigm: direct tactile control over transient voltage, where every rotary pot and detented toggle held measurable acoustic weight.",
  },
  {
    id: "podcast",
    name: "Podcast",
    voice: "Puck",
    rate: 110,
    pitch: 20,
    emotion: 70,
    text: "Welcome back to the audio architecture lab. Today we are breaking down the exact psychoacoustic cues that make speech sound authentically grounded rather than machine-manufactured.",
  },
  {
    id: "intimate",
    name: "Intimate",
    voice: "Kore",
    rate: 95,
    pitch: -10,
    emotion: 60,
    text: "Listen closely to the room acoustics. In silent passages, the subtle presence of near-field condenser microphones captures the organic friction of human breath.",
  },
  {
    id: "dialogue",
    name: "Multi-Speaker",
    voice: "Fenrir",
    rate: 100,
    pitch: 0,
    emotion: 65,
    text: "[Speaker A: Fenrir]\nDeterministic pipelines provide repeatability.\n\n[Speaker B: Aoede]\nYet stochastic warmth provides authenticity. We must balance both.",
  },
];

export default function VoiceStudioPage() {
  const { geminiKey, openModal } = useApiKey();
  const { user } = useAuth();

  const [activePreset, setActivePreset] = useState("documentary");
  const [selectedVoice, setSelectedVoice] = useState("Fenrir");
  const [scriptText, setScriptText] = useState(PRESETS[0].text);
  const [speechRate, setSpeechRate] = useState(100);
  const [pitchBias, setPitchBias] = useState(0);
  const [emotionIntensity, setEmotionIntensity] = useState(65);
  const [volume, setVolume] = useState(85);

  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if transferred from Text Humanizer
    const transferred = localStorage.getItem("OVI_HUB_TRANSFER_TEXT");
    if (transferred) {
      setScriptText(transferred);
      localStorage.removeItem("OVI_HUB_TRANSFER_TEXT");
    }
  }, []);

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setActivePreset(p.id);
    setSelectedVoice(p.voice);
    setSpeechRate(p.rate);
    setPitchBias(p.pitch);
    setEmotionIntensity(p.emotion);
    setScriptText(p.text);
  };

  const handleGenerate = async () => {
    if (!geminiKey) {
      openModal();
      return;
    }
    if (!scriptText.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gemini-Api-Key": geminiKey,
        },
        body: JSON.stringify({
          text: scriptText,
          voice: selectedVoice,
          format: "mp3",
          speed: speechRate / 100,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Generation failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (user && scriptText) {
        saveHistoryItem(
          user.uid,
          "voice",
          `Voice: ${selectedVoice} (${wordCount} words)`,
          `Synthesized audio at ${speechRate}% rate — "${scriptText.slice(0, 60)}..."`,
          {
            voice: selectedVoice,
            speechRate,
            pitchBias,
            script: scriptText,
            wordCount,
          }
        ).catch((err) => console.error("Voice history save failed:", err));
      }

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to synthesize audio.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / 140) * 60);

  return (
    <div className="w-full flex-1 flex flex-col bg-[#0b0c0e] text-[#e3e2e5]">
      
      {/* 2. Sub-Header Toolbar (Dieter Rams Hardware Control Strip) */}
      <section className="h-14 border-b border-white/[0.07] flex items-center justify-between px-6 bg-[#111215]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-2.5 py-1 bg-[#17191E] border border-white/[0.08]">
            <span className="w-1.5 h-1.5 bg-[#C89B6D]"></span>
            <span className="font-mono text-[11px] text-[#C89B6D] uppercase tracking-wider font-semibold">VOICE SYNTHESIS ENGINE</span>
          </div>
          <div className="h-4 w-[1px] bg-white/[0.08]"></div>
          {/* Dieter Rams Style Preset Toggles */}
          <div className="hidden sm:flex items-center bg-[#0d0e10] p-0.5 border border-white/[0.07]">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`px-3 py-1 font-mono text-xs uppercase transition-all ${
                  activePreset === p.id
                    ? "bg-[#292a2c] text-white border border-white/10"
                    : "text-[#7A7E85] hover:text-[#e3e2e5]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Master Volume Slider & Audio Specs */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-3">
            <Volume2 size={15} className="text-[#7A7E85]" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v / 100;
              }}
              className="w-20 accent-[#C89B6D]"
            />
            <span className="font-mono text-xs text-[#7A7E85] w-6 text-right">{volume}%</span>
          </div>
          <div className="h-4 w-[1px] bg-white/[0.08] hidden md:block"></div>
          <div className="px-2 py-0.5 bg-[#17191E] border border-white/[0.08] rounded-sm">
            <span className="font-mono text-xs text-[#C89B6D] tracking-wide">24kHz / 16-bit PCM</span>
          </div>
        </div>
      </section>

      {/* 3. Split Control Center (60/40 Desk Grid) */}
      <main className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 pb-28 flex-1 grid grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Script Console (7 cols) */}
        <div className="col-span-12 lg:col-span-7 bg-[#111215] border border-white/[0.08] flex flex-col justify-between relative group hover:border-white/15 transition-colors">
          
          {/* Script Control Header Strip */}
          <div className="h-10 px-4 border-b border-white/[0.07] flex items-center justify-between bg-[#17191E]/60">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-[11px] text-[#7A7E85] uppercase tracking-wider">CANVAS // SOURCE SCRIPT</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="font-mono text-xs text-[#cdc6bb]">Acoustic Orchestration</span>
            </div>
            {/* Quick Speaker Injectors */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setScriptText((prev) => prev + "\n\n[Speaker A: Fenrir]\n")}
                className="px-2 py-0.5 bg-[#1f2022] hover:bg-[#292a2c] border border-white/10 font-mono text-xs text-[#e3e2e5] flex items-center space-x-1"
              >
                <Plus size={12} className="text-[#C89B6D]" />
                <span>Speaker A</span>
              </button>
              <button
                type="button"
                onClick={() => setScriptText((prev) => prev + "\n\n[Speaker B: Aoede]\n")}
                className="px-2 py-0.5 bg-[#1f2022] hover:bg-[#292a2c] border border-white/10 font-mono text-xs text-[#e3e2e5] flex items-center space-x-1"
              >
                <Plus size={12} className="text-[#C89B6D]" />
                <span>Speaker B</span>
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="p-6 flex-1 flex flex-col">
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Type or paste acoustic orchestration script here..."
              spellCheck="false"
              className="w-full flex-1 min-h-[320px] bg-transparent text-[#e3e2e5] font-sans text-base sm:text-lg leading-relaxed resize-none border-none focus:outline-none placeholder-white/20"
            />
          </div>

          {/* Telemetry & Duration Footer */}
          <div className="h-9 px-4 border-t border-white/[0.07] flex items-center justify-between bg-[#17191E]/40 font-mono text-xs text-[#7A7E85]">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <FileText size={13} />
                <span>{wordCount} words</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock size={13} />
                <span className="text-[#C89B6D]">~{formatTime(estimatedSeconds)} est.</span>
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !scriptText.trim()}
              className="px-4 py-1.5 bg-[#C89B6D] hover:bg-[#d8ab7d] text-[#0B0C0E] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles size={13} />
              <span>{isGenerating ? "Synthesizing..." : "Synthesize Voice"}</span>
            </button>
          </div>

        </div>

        {/* Right Column: Acoustic Rack (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-4">
          
          {/* Voice Models Selection Node */}
          <div className="bg-[#111215] border border-white/[0.08] flex flex-col">
            <div className="h-10 px-4 border-b border-white/[0.07] flex items-center justify-between bg-[#17191E]/60 font-mono text-xs">
              <span className="text-[#7A7E85] uppercase tracking-wider">ACOUSTIC EMBEDDING MATRIX</span>
              <span className="text-[#C89B6D] font-semibold">{VOICES.length} PROFILES</span>
            </div>

            <div className="p-2 space-y-1.5 max-h-[290px] overflow-y-auto">
              {VOICES.map((v) => {
                const isSelected = selectedVoice === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-2.5 border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-[#17191E] border-[#C89B6D]/60"
                        : "bg-transparent border-transparent hover:border-white/[0.08] hover:bg-white/[0.02]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-sans text-sm text-white font-semibold">{v.name}</span>
                        <span className="px-1.5 py-0.5 bg-white/5 text-[#C89B6D] font-mono text-[10px] uppercase">
                          {v.badge}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[#7A7E85] mt-0.5">{v.desc}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-[#C89B6D]" : "bg-transparent"}`}></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Micro-Sliders: Parameter Modulation Bay */}
          <div className="bg-[#111215] border border-white/[0.08] p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2 font-mono text-xs">
              <span className="text-[#7A7E85] uppercase tracking-wider">PHYSICAL PARAMETERS</span>
              <button
                type="button"
                onClick={() => {
                  setSpeechRate(100);
                  setPitchBias(0);
                  setEmotionIntensity(65);
                }}
                className="text-[#C89B6D] hover:underline"
              >
                RESET
              </button>
            </div>

            {/* Speech Rate Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#e3e2e5]">Speech Rate</span>
                <span className="text-[#C89B6D]">{(speechRate / 100).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="w-full accent-[#C89B6D]"
              />
            </div>

            {/* Pitch Bias Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#e3e2e5]">Pitch Bias</span>
                <span className="text-[#C89B6D]">{pitchBias > 0 ? `+${pitchBias}` : pitchBias} st</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={pitchBias}
                onChange={(e) => setPitchBias(Number(e.target.value))}
                className="w-full accent-[#C89B6D]"
              />
            </div>

            {/* Emotion Intensity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#e3e2e5]">Emotion Intensity</span>
                <span className="text-[#C89B6D]">{emotionIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={emotionIntensity}
                onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                className="w-full accent-[#C89B6D]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

      </main>

      {/* 4. Master Audio Player Dock (Fixed Bottom Hardware Deck) */}
      <footer className="fixed bottom-0 left-0 w-full h-20 bg-[#111215]/95 backdrop-blur-md border-t border-white/[0.08] z-40 px-6 flex items-center justify-between">
        
        {/* Left: Primary Transport Controls & Timecode */}
        <div className="flex items-center space-x-5 min-w-[240px]">
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="w-11 h-11 bg-[#C89B6D] hover:bg-[#d8ab7d] text-[#0B0C0E] rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40"
            title="Play / Pause"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
          </button>

          <div className="flex items-center space-x-1 text-[#7A7E85]">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 5;
              }}
              className="p-1 hover:text-white transition-colors"
              title="Back 5s"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime += 5;
              }}
              className="p-1 hover:text-white transition-colors"
              title="Forward 5s"
            >
              <RotateCw size={16} />
            </button>
          </div>

          <div className="font-mono text-sm tracking-wider">
            <span className="text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="text-[#7A7E85]"> / </span>
            <span className="text-[#7A7E85]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Center: Waveform Status Bar */}
        <div className="hidden sm:flex flex-1 max-w-[560px] mx-6 flex-col justify-center">
          <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-[#7A7E85]">
            <span className="text-[#C89B6D] font-semibold">
              {audioUrl ? "AUDIO CACHE LOADED • READY" : "AUDIO BUFFER STANDBY"}
            </span>
            <span>{audioUrl ? `${formatTime(duration - currentTime)} REMAINING` : "STANDBY"}</span>
          </div>
          <div className="relative w-full h-2 bg-[#1f2022] rounded-sm overflow-hidden">
            <div
              className="h-full bg-[#C89B6D] transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Right: Export Button */}
        <div>
          {audioUrl ? (
            <a
              href={audioUrl}
              download={`synthesized_speech_${selectedVoice}.mp3`}
              className="px-4 py-2 bg-[#1f2022] hover:bg-[#292a2c] border border-white/10 font-mono text-xs uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
            >
              <Download size={14} className="text-[#C89B6D]" />
              <span>Export MP3</span>
            </a>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#C89B6D] hover:bg-[#d8ab7d] text-[#0B0C0E] font-mono text-xs uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
            >
              {isGenerating ? "Synthesizing..." : "Generate Voice"}
            </button>
          )}
        </div>

      </footer>

      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />

    </div>
  );
}
