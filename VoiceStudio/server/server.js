/**
 * Gemini Voice Studio - Express Backend Server
 * 
 * Secure backend that handles Gemini TTS API communication,
 * three-key failover system, and static frontend hosting.
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { generateSpeechWithFailover, getDiagnostics, TTS_MODEL } from "./gemini.js";
import { getAvailableVoices } from "./voices.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_TEXT_LENGTH = parseInt(process.env.MAX_TEXT_LENGTH || "10000", 10);

// Basic CORS headers with BYOK header support
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Gemini-Api-Key");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// JSON body parsing with request size limit protection
app.use(express.json({ limit: "1mb" }));

// Serve frontend static assets from public/
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// Serve shared OVI Hub assets (navbar, modal, api key manager)
const sharedDir = path.join(__dirname, "../../shared");
app.use("/shared", express.static(sharedDir));

/**
 * GET /api/voices
 * Returns available prebuilt Gemini TTS voices with safe metadata.
 */
app.get("/api/voices", (req, res) => {
  try {
    const voices = getAvailableVoices();
    res.json({
      success: true,
      voices
    });
  } catch (error) {
    console.error("[Voices API Error]", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve voices."
    });
  }
});

/**
 * POST /api/tts
 * Generates natural speech using Google Gemini TTS with 3-key failover.
 */
app.post("/api/tts", async (req, res) => {
  try {
    const {
      text,
      voice,
      module,
      style,
      speed,
      pitch,
      customInstruction,
      dialogueMode,
      speaker1,
      speaker2
    } = req.body;

    // Input Validation
    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Please enter text to generate speech."
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Text cannot be empty."
      });
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Text exceeds the maximum length of ${MAX_TEXT_LENGTH} characters.`
      });
    }

    const clientApiKey = req.headers["x-gemini-api-key"] || "";

    // Call Gemini with BYOK & 3-key failover
    const result = await generateSpeechWithFailover({
      text: trimmedText,
      voice: voice || "Kore",
      module: module || "general",
      style: style || "neutral",
      speed: Number(speed) || 1,
      pitch: Number(pitch) || 0,
      customInstruction: customInstruction || "",
      dialogueMode: Boolean(dialogueMode),
      speaker1: speaker1 || { name: "Alex", voice: "Puck" },
      speaker2: speaker2 || { name: "Sarah", voice: "Kore" }
    }, clientApiKey);

    // Return the generated audio (both MP3 and WAV supported)
    res.json({
      success: true,
      audio: result.audioBase64,
      mp3Audio: result.mp3AudioBase64,
      wavAudio: result.wavAudioBase64,
      mimeType: result.mimeType || "audio/mp3",
      format: result.format || "mp3"
    });
  } catch (error) {
    // Log safe error server-side
    console.error("[TTS Generation Error]", error.message || error);

    // Differentiate missing keys from service downtime
    const diagnostics = getDiagnostics();
    const clientHasKey = Boolean(req.headers["x-gemini-api-key"]);
    if (diagnostics.configuredKeysCount === 0 && !clientHasKey) {
      return res.status(401).json({
        success: false,
        error: "No Gemini API key detected. Please click 'Set API Key' in the top navbar to configure your key."
      });
    }

    // Return clean, user-friendly message without leaking internals
    return res.status(503).json({
      success: false,
      error: error.message || "Voice generation failed. Please try again in a few moments."
    });
  }
});

/**
 * GET /api/health
 * Safe health check endpoint for monitoring.
 */
app.get("/api/health", (req, res) => {
  const diag = getDiagnostics();
  res.json({
    status: "ok",
    service: "Gemini Voice Studio",
    keysConfigured: diag.configuredKeysCount,
    primaryModel: diag.primaryModel
  });
});

// Single-page application fallback: serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Start Express server if run directly (e.g. node server/server.js)
const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Gemini Voice Studio] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Gemini Voice Studio] Active TTS Model: ${TTS_MODEL}`);
    const diag = getDiagnostics();
    console.log(`[Gemini Voice Studio] Configured API keys count: ${diag.configuredKeysCount}`);
  });
}

export default app;

