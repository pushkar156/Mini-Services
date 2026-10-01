/**
 * Gemini Text-to-Speech Integration
 * 
 * Handles communication with the Google Gemini TTS API,
 * multi-key failover system, and multi-speaker dialogue configuration.
 */

import { GoogleGenAI } from "@google/genai";
import { Mp3Encoder } from "@breezystack/lamejs";
import dotenv from "dotenv";

dotenv.config();

/**
 * Converts a 16-bit PCM WAV buffer to MP3 format (128 kbps).
 * Gemini TTS returns 24kHz mono 16-bit WAV audio by default.
 */
export function convertWavToMp3(wavBuffer, bitrate = 128) {
  try {
    if (!wavBuffer || wavBuffer.length < 44) return null;

    // Locate the 'data' subchunk
    const dataIdx = wavBuffer.indexOf(Buffer.from("data"));
    let dataOffset = 44;
    let pcmLength = wavBuffer.length - 44;

    if (dataIdx !== -1 && dataIdx + 8 <= wavBuffer.length) {
      dataOffset = dataIdx + 8;
      const declaredLen = wavBuffer.readUInt32LE(dataIdx + 4);
      if (declaredLen > 0 && dataOffset + declaredLen <= wavBuffer.length) {
        pcmLength = declaredLen;
      } else {
        pcmLength = wavBuffer.length - dataOffset;
      }
    }

    // Locate format info (WAV fmt chunk: +8 is audioFormat, +10 is channels, +12 is sampleRate)
    let channels = 1;
    let sampleRate = 24000;
    const fmtIdx = wavBuffer.indexOf(Buffer.from("fmt "));
    if (fmtIdx !== -1 && fmtIdx + 16 <= wavBuffer.length) {
      channels = wavBuffer.readUInt16LE(fmtIdx + 10) || 1;
      sampleRate = wavBuffer.readUInt32LE(fmtIdx + 12) || 24000;
    }

    const pcm = wavBuffer.subarray(dataOffset, dataOffset + pcmLength);
    const sampleCount = Math.floor(pcm.length / 2);
    if (sampleCount === 0) return null;

    // Copy to Int16Array safely to prevent Node buffer pool offset issues
    const samples = new Int16Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      samples[i] = pcm.readInt16LE(i * 2);
    }

    const encoder = new Mp3Encoder(channels, sampleRate, bitrate);
    const mp3Chunks = [];
    const blockSize = 1152;

    if (channels === 1) {
      for (let i = 0; i < samples.length; i += blockSize) {
        const chunk = samples.subarray(i, i + blockSize);
        const encoded = encoder.encodeBuffer(chunk);
        if (encoded.length > 0) mp3Chunks.push(Buffer.from(encoded));
      }
    } else {
      const left = new Int16Array(sampleCount / 2);
      const right = new Int16Array(sampleCount / 2);
      for (let i = 0, j = 0; i < samples.length; i += 2, j++) {
        left[j] = samples[i];
        right[j] = samples[i + 1];
      }
      for (let i = 0; i < left.length; i += blockSize) {
        const leftChunk = left.subarray(i, i + blockSize);
        const rightChunk = right.subarray(i, i + blockSize);
        const encoded = encoder.encodeBuffer(leftChunk, rightChunk);
        if (encoded.length > 0) mp3Chunks.push(Buffer.from(encoded));
      }
    }

    const flushed = encoder.flush();
    if (flushed.length > 0) mp3Chunks.push(Buffer.from(flushed));

    const totalMp3 = Buffer.concat(mp3Chunks);
    return totalMp3.length > 0 ? totalMp3 : null;
  } catch (err) {
    console.error("[MP3 Conversion Error]", err.message || err);
    return null;
  }
}

/**
 * Gemini TTS Model Configuration
 * Primary model: gemini-3.8-flash-tts (specialized for expressive voice design & dual-speaker dialogue)
 * Fallback model: gemini-3.8-flash-lite-tts (high-efficiency, general TTS)
 */
export const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts";
export const FALLBACK_TTS_MODEL = "gemini-3.8-flash-lite-tts";

/**
 * Module delivery styles.
 * These instructions guide Gemini on tone, pacing, and delivery without altering the user's transcript.
 */
const MODULE_STYLE_GUIDES = {
  general: "Speak naturally and clearly with a balanced, pleasant conversational tone.",
  narration: "Speak clearly and naturally with a steady, professional narration style.",
  storytelling: "Use expressive storytelling, natural dramatic pauses, emotional variation, and engaging narrative delivery.",
  podcast: "Use a natural conversational podcast delivery with expressive but relaxed pacing and authentic warmth.",
  educational: "Speak clearly and patiently, emphasizing important concepts and maintaining an easy-to-follow rhythm.",
  news: "Speak clearly, confidently, neutrally, and professionally like a television news presenter.",
  advertisement: "Speak with high energy, charismatic enthusiasm, and persuasive warmth.",
  conversational: "Speak casually, naturally, and warmly as if talking directly to a friend.",
  audiobook: "Deliver rich, nuanced storytelling with clear character pacing and immersive acoustic presence.",
  character: "Use dramatic, character-driven expressive delivery with heightened emotional emphasis."
};

/**
 * Retrieve configured Gemini API keys in priority order.
 * If clientApiKey (BYOK) is provided, it takes highest precedence.
 * Failover sequence: Client BYOK -> Key 1 -> Key 2 -> Key 3 -> fallback GEMINI_API_KEY.
 */
function getConfiguredKeys(clientApiKey = null) {
  const candidates = [
    clientApiKey,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY // Backup fallback for standard environments
  ];

  // Filter out empty strings or default placeholders
  const validKeys = candidates.filter(key => {
    if (!key || typeof key !== "string") return false;
    const trimmed = key.trim();
    return trimmed.length > 5 && !trimmed.includes("your_first_key_here") && !trimmed.includes("MY_GEMINI_API_KEY");
  });

  return validKeys;
}

/**
 * Determines whether an error from Gemini is recoverable by trying the next API key.
 * Quotas (429), auth issues (401, 403), server errors (500, 503), timeouts, and rate limits
 * are recoverable via key rotation.
 */
function isRecoverableGeminiError(error) {
  if (!error) return false;
  const status = error.status || error.statusCode || (error.response && error.response.status);
  const msg = (error.message || "").toLowerCase();

  // Rate limits or quota exhaustion
  if (status === 429 || msg.includes("quota") || msg.includes("resource_exhausted")) return true;
  // Auth or permission failures (bad key, expired key)
  if (status === 401 || status === 403 || msg.includes("permission_denied") || msg.includes("api_key_invalid") || msg.includes("unauthenticated")) return true;
  // Transient server errors
  if (status === 500 || status === 502 || status === 503 || status === 504 || msg.includes("unavailable") || msg.includes("deadline")) return true;

  return true; // Default to failover for any network/API failure
}

/**
 * Parses a dialogue text into structured speaker lines.
 * Supported format:
 * SpeakerName: Said text here
 * AnotherSpeaker: Response text here
 */
export function parseDialogue(text, speaker1Name = "Alex", speaker2Name = "Sarah") {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const parsed = [];

  const s1Lower = speaker1Name.toLowerCase();
  const s2Lower = speaker2Name.toLowerCase();

  let currentSpeaker = speaker1Name;

  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const prefix = match[1].trim();
      const content = match[2].trim();
      if (prefix.toLowerCase() === s1Lower) {
        currentSpeaker = speaker1Name;
      } else if (prefix.toLowerCase() === s2Lower) {
        currentSpeaker = speaker2Name;
      } else {
        currentSpeaker = prefix;
      }
      parsed.push({ speaker: currentSpeaker, text: content });
    } else {
      // Continuation of previous speaker
      parsed.push({ speaker: currentSpeaker, text: line });
    }
  }

  // Fallback if no speaker prefixes were found
  if (parsed.length === 0) {
    parsed.push({ speaker: speaker1Name, text: text });
  }

  return parsed;
}

/**
 * Builds the composite speech metadata style string.
 */
function constructStyleInstruction(options = {}) {
  const { module = "general", style = "neutral", speed = 1, pitch = 0, customInstruction = "" } = options;

  const parts = [];

  // 1. Module base style
  if (MODULE_STYLE_GUIDES[module]) {
    parts.push(MODULE_STYLE_GUIDES[module]);
  }

  // 2. Emotional / Delivery style
  if (style && style !== "neutral") {
    parts.push(`Tone: ${style}.`);
  }

  // 3. Speaking rate hint
  if (speed) {
    const numSpeed = parseFloat(speed);
    if (numSpeed < 0.9) {
      parts.push("Pacing: deliberate, slow, and measured.");
    } else if (numSpeed > 1.1) {
      parts.push("Pacing: brisk, fast, and energetic.");
    }
  }

  // 4. Pitch hint
  if (pitch) {
    const numPitch = parseFloat(pitch);
    if (numPitch < -0.2) {
      parts.push("Vocal register: deeper, grounded pitch.");
    } else if (numPitch > 0.2) {
      parts.push("Vocal register: lighter, higher pitch.");
    }
  }

  // 5. Custom user direction
  if (customInstruction && customInstruction.trim()) {
    parts.push(`Direction: ${customInstruction.trim()}`);
  }

  return parts.join(" ");
}

/**
 * Performs a single TTS request with a given API key and model.
 */
async function callGeminiTTS(apiKey, modelName, payload) {
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });

  const {
    text,
    voice = "Kore",
    module = "general",
    style = "neutral",
    speed = 1,
    pitch = 0,
    customInstruction = "",
    dialogueMode = false,
    speaker1 = { name: "Alex", voice: "Puck" },
    speaker2 = { name: "Sarah", voice: "Kore" }
  } = payload;

  const styleInstruction = constructStyleInstruction({ module, style, speed, pitch, customInstruction });

  let contents;
  let speechConfig;

  if (dialogueMode) {
    // Multi-speaker dialogue mode
    const parsedDialogue = parseDialogue(text, speaker1.name, speaker2.name);
    
    // Ensure speakers are mapped correctly
    const sp1 = speaker1.name || "Alex";
    const sp2 = speaker2.name || "Sarah";

    contents = [
      {
        role: "user",
        parts: parsedDialogue.map(turn => ({
          text: `${turn.speaker}: ${turn.text}`,
          speechMetadata: {
            speaker: turn.speaker,
            style: styleInstruction
          }
        }))
      }
    ];

    speechConfig = {
      multiSpeakerVoiceConfig: {
        speakerVoiceConfigs: [
          {
            speaker: sp1,
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: speaker1.voice || "Puck" }
            }
          },
          {
            speaker: sp2,
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: speaker2.voice || "Kore" }
            }
          }
        ]
      }
    };
  } else {
    // Single-speaker TTS mode
    contents = [
      {
        role: "user",
        parts: [
          {
            text: text,
            speechMetadata: {
              style: styleInstruction
            }
          }
        ]
      }
    ];

    speechConfig = {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: voice || "Kore" }
      }
    };
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: speechConfig
    }
  });

  // Extract base64 audio data (Gemini returns 24kHz mono 16-bit WAV)
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio content returned by the Gemini TTS model.");
  }

  // Convert WAV to MP3
  const wavBuffer = Buffer.from(base64Audio, "base64");
  const mp3Buffer = convertWavToMp3(wavBuffer, 128);
  const mp3Base64 = mp3Buffer ? mp3Buffer.toString("base64") : null;

  return {
    wavAudioBase64: base64Audio,
    mp3AudioBase64: mp3Base64,
    // Return primary audio (MP3 if available, otherwise WAV)
    audioBase64: mp3Base64 || base64Audio,
    mimeType: mp3Base64 ? "audio/mp3" : "audio/wav",
    format: mp3Base64 ? "mp3" : "wav",
    modelUsed: modelName
  };
}

/**
 * Three API Key Failover Orchestrator
 * Sequentially tests Key 1 -> Key 2 -> Key 3.
 * Logs progress safely to the server console without leaking keys.
 */
export async function generateSpeechWithFailover(payload, clientApiKey = null) {
  const keys = getConfiguredKeys(clientApiKey);

  if (keys.length === 0) {
    throw new Error("No Gemini API keys are configured. Please set your Gemini API key in Settings or check server configuration.");
  }

  let lastError = null;

  for (let index = 0; index < keys.length; index++) {
    const keyNumber = index + 1;
    const currentKey = keys[index];

    console.log(`[Gemini] Attempting key ${keyNumber}`);

    try {
      // First attempt with primary TTS model
      try {
        const result = await callGeminiTTS(currentKey, TTS_MODEL, payload);
        console.log(`[Gemini] Key ${keyNumber} succeeded`);
        return result;
      } catch (modelError) {
        // If the primary model failed (quota 429, 404, unavailable, etc.), try fallback model on this key
        if (TTS_MODEL !== FALLBACK_TTS_MODEL) {
          const errReason = modelError.status ? `HTTP ${modelError.status}` : (modelError.message || "error").slice(0, 80);
          console.log(`[Gemini] Primary model ${TTS_MODEL} issue (${errReason}), attempting fallback model ${FALLBACK_TTS_MODEL}...`);
          try {
            const fallbackResult = await callGeminiTTS(currentKey, FALLBACK_TTS_MODEL, payload);
            console.log(`[Gemini] Key ${keyNumber} succeeded with fallback model ${FALLBACK_TTS_MODEL}`);
            return fallbackResult;
          } catch (fallbackErr) {
            console.log(`[Gemini] Fallback model ${FALLBACK_TTS_MODEL} also failed on key ${keyNumber}`);
          }
        }
        throw modelError;
      }
    } catch (error) {
      lastError = error;
      const safeReason = error.status ? `HTTP ${error.status}` : (error.message || "Unknown error").slice(0, 100);
      
      if (index < keys.length - 1) {
        console.log(`[Gemini] Key ${keyNumber} failed (${safeReason}), trying key ${keyNumber + 1}`);
      } else {
        console.log(`[Gemini] Key ${keyNumber} failed (${safeReason}). All configured keys exhausted.`);
      }

      if (!isRecoverableGeminiError(error) && index < keys.length - 1) {
        // Continue failover even if unexpected error type
        continue;
      }
    }
  }

  // All keys failed
  throw lastError;
}

/**
 * Returns safe server diagnostic info (no keys exposed).
 */
export function getDiagnostics() {
  const keys = getConfiguredKeys();
  return {
    configuredKeysCount: keys.length,
    primaryModel: TTS_MODEL,
    fallbackModel: FALLBACK_TTS_MODEL
  };
}
