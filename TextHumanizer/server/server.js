/**
 * Text Humanizer - Express Backend Server
 * Runs independently on Port 3001
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { humanizeTextWithFailover } from "./humanizer.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_TEXT_LENGTH = parseInt(process.env.MAX_TEXT_LENGTH || "10000", 10);

// Basic CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Gemini-Api-Key, X-Provider");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// JSON body parsing
app.use(express.json({ limit: "2mb" }));

// Serve frontend static assets from public/
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// Serve shared OVI Hub modules
const sharedDir = path.join(__dirname, "../../shared");
app.use("/shared", express.static(sharedDir));

/**
 * POST /api/humanize
 * Humanizes text using Google Gemini with failover & BYOK header support
 */
app.post("/api/humanize", async (req, res) => {
  try {
    const { text, mode, strength, targetAudience } = req.body;
    const clientApiKey = req.headers["x-gemini-api-key"] || "";

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please enter text to humanize."
      });
    }

    const trimmed = text.trim();
    if (trimmed.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Text exceeds maximum allowed length of ${MAX_TEXT_LENGTH} characters.`
      });
    }

    const result = await humanizeTextWithFailover(
      trimmed,
      {
        mode: mode || "ultra",
        strength: strength || "balanced",
        targetAudience: targetAudience || "general"
      },
      clientApiKey
    );

    res.json(result);
  } catch (error) {
    console.error("[Text Humanizer Error]", error.message || error);
    res.status(503).json({
      success: false,
      error: error.message || "Text humanization failed. Please check your API key in Settings."
    });
  }
});

/**
 * GET /api/health
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Text Humanizer",
    port: PORT
  });
});

// SPA fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Start server if run directly
const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Text Humanizer] Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
