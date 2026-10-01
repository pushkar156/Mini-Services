/**
 * Text Humanizer Service
 * 
 * Transforms robotic, formulaic AI-generated text into authentic,
 * natural-sounding human writing with varied burstiness, natural idioms,
 * and zero AI clichés. Supports BYOK API key failover.
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const CANDIDATE_MODELS = [
  process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

// Common AI clichés and overused tropes to eliminate
const AI_CLICHES = [
  "delve", "testament", "tapestry", "in conclusion", "furthermore",
  "it is important to remember", "a testament to", "beacon of",
  "rich tapestry", "navigating the", "unlocking the", "pivotal role",
  "paramount", "multifaceted", "ever-evolving", "fostering"
];

/**
 * Humanization mode instructions
 */
const MODE_INSTRUCTIONS = {
  conversational: `
Tone: Casual, warm, and natural conversational voice.
Style: Use direct speech, natural contractions (it's, you'll, don't), authentic transitions, varied rhythm, and relatable expressions as if written by an insightful friend. Avoid corporate jargon or stiff academic phrasing.`,

  academic: `
Tone: Scholarly, thoughtful, and analytical.
Style: Maintain intellectual rigor while breaking formulaic five-paragraph structures. Use nuanced vocabulary, varied transitional rhythms, genuine analytical curiosity, and natural thesis evolution. Avoid cliché transition starters like 'In conclusion', 'Furthermore', or 'Moreover'.`,

  professional: `
Tone: Executive, crisp, and persuasive.
Style: Get straight to the point with confident, concise phrasing. Eliminate fluff, passive voice, and repetitive corporate buzzwords. Make the communication punchy, actionable, and boardroom-ready.`,

  creative: `
Tone: Vivid, immersive, and characterful.
Style: Inject sensory details, varied cadence, occasional sentence fragments for punchiness, and evocative phrasing that feels written by a skilled human author.`,

  ultra: `
Tone: Maximum human authenticity with high burstiness and perplexity.
Style: Intentionally vary sentence lengths dramatically—mix short, punchy 3-word sentences with longer, flowing thoughts. Introduce subtle human idiosyncrasies, natural digressions, active voice, and conversational pauses. Completely eliminate AI-like predictable statistical patterns.`
};

/**
 * Retrieve configured Gemini API keys in priority order.
 * If clientApiKey is passed, it is placed first in priority.
 */
function getConfiguredKeys(clientApiKey) {
  const candidates = [
    clientApiKey,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY
  ];

  return candidates.filter(key => {
    if (!key || typeof key !== "string") return false;
    const trimmed = key.trim();
    return trimmed.length > 5 && !trimmed.includes("your_first_key_here") && !trimmed.includes("MY_GEMINI_API_KEY");
  });
}

/**
 * Build system prompt for humanizing text
 */
function buildHumanizerPrompt(text, options = {}) {
  const {
    mode = "ultra",
    strength = "balanced",
    targetAudience = "general"
  } = options;

  const modeGuide = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.ultra;

  let strengthGuide = "Balanced rewriting: rewrite awkward or robotic sentences while preserving the core meaning and key facts.";
  if (strength === "light") {
    strengthGuide = "Light polish: keep original structure mostly intact, only polishing robotic phrasing and transitions.";
  } else if (strength === "deep") {
    strengthGuide = "Deep reconstruction: completely rephrase paragraphs, rethink sentence ordering, and rebuild the piece from the ground up in a genuine human voice.";
  }

  return `You are an elite prose editor and ghostwriter who transforms robotic, formulaic AI text into authentic, natural-sounding human writing.

Target Audience / Context: ${targetAudience}
Humanization Mode: ${mode.toUpperCase()}
${modeGuide}

Humanization Level: ${strengthGuide}

CRITICAL RULES:
1. PRESERVE FACTUAL ACCURACY: Do not invent false facts, alter numbers, or change the user's intended core meaning.
2. ELIMINATE AI CLICHES: Never use any of these words or variations: ${AI_CLICHES.join(", ")}.
3. HUMAN CADENCE (BURSTINESS): Dramatically vary your sentence lengths. Follow a long, descriptive sentence with a 3-to-4-word sentence. Break standard robotic rhythms.
4. NATURAL IDIOMS & TRANSITIONS: Use human-like conversational connectors instead of mechanical transition markers.
5. NO META-COMMENTARY: Output ONLY the rewritten text. Do NOT include phrases like 'Here is the humanized version', markdown backticks, or any introductory / closing commentary.

ORIGINAL TEXT TO HUMANIZE:
"""
${text}
"""`;
}

/**
 * Clean up output from any unwanted wrapper or meta commentary
 */
function cleanOutput(raw) {
  if (!raw) return "";
  let cleaned = raw.trim();

  // Strip leading code fence blocks if returned
  if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();
  }

  // Strip common AI conversational headers
  cleaned = cleaned.replace(/^(Here is the (humanized|rewritten) (version|text):?\s*)/i, "");
  cleaned = cleaned.replace(/^(Certainly! Here is your text:?\s*)/i, "");

  return cleaned;
}

/**
 * Calculate authenticity metrics for the rewritten text
 */
function calculateMetrics(original, humanized) {
  const origWords = (original || "").trim().split(/\s+/).filter(Boolean).length;
  const humanWords = (humanized || "").trim().split(/\s+/).filter(Boolean).length;

  // Calculate burstiness: variance in sentence lengths
  const sentences = humanized.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLen = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 12;
  const variance = lengths.length > 0 ? lengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / lengths.length : 0;

  // Authenticity score heuristic (94% - 99%) based on sentence variability
  const burstinessScore = Math.min(15, Math.sqrt(variance));
  const humanScore = Math.min(99, Math.round(92 + (burstinessScore / 3)));

  return {
    originalWords: origWords,
    humanizedWords: humanWords,
    wordDelta: humanWords - origWords,
    humanScorePercent: humanScore,
    sentenceCount: sentences.length,
    averageSentenceLength: Math.round(avgLen * 10) / 10
  };
}

/**
 * Call Gemini API for text humanization with specified key and model
 */
async function callGeminiHumanize(apiKey, modelName, text, options) {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildHumanizerPrompt(text, options);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: 0.85,
      topP: 0.95
    }
  });

  const rawText = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text);
  if (!rawText) {
    throw new Error("Empty response received from Gemini.");
  }

  const cleanedText = cleanOutput(rawText);
  const metrics = calculateMetrics(text, cleanedText);

  return {
    success: true,
    humanizedText: cleanedText,
    originalText: text,
    mode: options.mode || "ultra",
    metrics,
    modelUsed: modelName
  };
}

/**
 * Humanize text with multi-key and multi-model failover system
 */
export async function humanizeTextWithFailover(text, options = {}, clientApiKey = null) {
  const keys = getConfiguredKeys(clientApiKey);

  if (keys.length === 0) {
    throw new Error("No Gemini API keys configured. Please add your key in the OVI Hub settings modal or set GEMINI_API_KEY in the environment.");
  }

  let lastError = null;

  for (let index = 0; index < keys.length; index++) {
    const keyNumber = index + 1;
    const currentKey = keys[index];

    console.log(`[Text Humanizer] Attempting key candidate ${keyNumber}`);

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[Text Humanizer] Trying model ${modelName}...`);
        const result = await callGeminiHumanize(currentKey, modelName, text, options);
        console.log(`[Text Humanizer] Key ${keyNumber} succeeded with ${modelName}`);
        return result;
      } catch (err) {
        lastError = err;
        const status = err.status || (err.message || "").slice(0, 60);
        console.log(`[Text Humanizer] Model ${modelName} on key ${keyNumber} failed (${status})`);
      }
    }
  }

  throw lastError;
}
