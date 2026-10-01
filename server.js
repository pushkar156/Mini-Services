/**
 * OVI Hub - Master Unified Server
 * 
 * Serves the Central Hub and ALL microservices under a single port.
 * Default port: 8080 (or process.env.PORT)
 * 
 * Unified Services:
 *   - /              -> Central Hub Homepage
 *   - /voice         -> Gemini Voice Studio
 *   - /humanizer     -> AI Text Humanizer
 *   - /ductus        -> Ductus Flowchart Studio
 *   - /ident         -> Ident Brand Studio
 *   - /mediadrop     -> MediaDrop Video/Photo Extractor
 *   - /photonarrator -> PhotoNarrator AI
 */

import express from "express";
import path from "path";
import fs from "fs";
import http from "http";
import https from "https";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

// Import core backend engines directly
import { getAvailableVoices } from "./VoiceStudio/server/voices.js";
import { generateSpeechWithFailover, getDiagnostics as getVoiceDiag, TTS_MODEL } from "./VoiceStudio/server/gemini.js";
import { humanizeTextWithFailover } from "./TextHumanizer/server/humanizer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Gemini-Api-Key, X-Provider");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// JSON and URL-encoded body parsing
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// -------------------------------------------------------------
// 1. Shared Assets (Navbar, Modal, API Key Manager, Ollama Client)
// -------------------------------------------------------------
const sharedDir = path.join(__dirname, "shared");
app.use("/shared", express.static(sharedDir));

// -------------------------------------------------------------
// 2. Ductus Flowchart Studio (Built React SPA)
// -------------------------------------------------------------
const ductusDist = path.join(__dirname, "Ductus (FLOWCHART)", "dist");
if (fs.existsSync(ductusDist)) {
  app.get("/ductus", (req, res) => res.sendFile(path.join(ductusDist, "index.html")));
  app.use("/ductus", express.static(ductusDist));
  app.use("/ductus", (req, res) => res.sendFile(path.join(ductusDist, "index.html")));
}

// -------------------------------------------------------------
// 3. Ident Brand Naming Studio (Built React SPA)
// -------------------------------------------------------------
const identDist = path.join(__dirname, "Ident - Brand Naming Studio", "dist");
if (fs.existsSync(identDist)) {
  app.get("/ident", (req, res) => res.sendFile(path.join(identDist, "index.html")));
  app.use("/ident", express.static(identDist));
  app.use("/ident", (req, res) => res.sendFile(path.join(identDist, "index.html")));
}

// -------------------------------------------------------------
// 4. Voice Studio & Text Humanizer Static UIs
// -------------------------------------------------------------
const voicePublicDir = path.join(__dirname, "VoiceStudio", "public");
app.get("/voice", (req, res) => res.sendFile(path.join(voicePublicDir, "index.html")));
app.use("/voice", express.static(voicePublicDir));
app.use("/voice", (req, res) => res.sendFile(path.join(voicePublicDir, "index.html")));

const humanizerPublicDir = path.join(__dirname, "TextHumanizer", "public");
app.get("/humanizer", (req, res) => res.sendFile(path.join(humanizerPublicDir, "index.html")));
app.use("/humanizer", express.static(humanizerPublicDir));
app.use("/humanizer", (req, res) => res.sendFile(path.join(humanizerPublicDir, "index.html")));

// -------------------------------------------------------------
// 5. MediaDrop (Instagram & Pinterest Downloader) Static & Files
// -------------------------------------------------------------
const mediaDropDir = path.join(__dirname, "MediaDrop");
const mediaDropStatic = path.join(mediaDropDir, "static");
const mediaDropTemplate = path.join(mediaDropDir, "templates", "index.html");

app.use("/mediadrop/static", express.static(mediaDropStatic));
app.use("/static", express.static(mediaDropStatic));

app.get("/sw.js", (req, res) => {
  res.sendFile(path.join(mediaDropStatic, "js", "sw.js"));
});
app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(mediaDropStatic, "manifest.json"));
});

app.get("/mediadrop", (req, res) => res.sendFile(mediaDropTemplate));
app.use("/mediadrop", (req, res) => res.sendFile(mediaDropTemplate));

// -------------------------------------------------------------
// 6. Unified APIs (Voice, Humanizer, MediaDrop)
// -------------------------------------------------------------

// --- Voice Studio APIs ---
const handleGetVoices = (req, res) => {
  try {
    const voices = getAvailableVoices();
    res.json({ success: true, voices });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to retrieve voices." });
  }
};
app.get("/api/voices", handleGetVoices);
app.get("/voice/api/voices", handleGetVoices);

const handlePostTts = async (req, res) => {
  try {
    const { text, voice, dialogue, format = "mp3", speed = 1.0 } = req.body;
    const clientApiKey = req.headers["x-gemini-api-key"] || "";

    if (!dialogue && (!text || typeof text !== "string" || text.trim().length === 0)) {
      return res.status(400).json({ success: false, error: "Please provide text or dialogue to synthesize." });
    }

    const { audioBuffer, format: outFormat } = await generateSpeechWithFailover(
      { text: text ? text.trim() : "", voice, dialogue, format, speed },
      clientApiKey
    );

    const contentType = outFormat === "mp3" ? "audio/mp3" : "audio/wav";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "no-cache");
    res.send(audioBuffer);
  } catch (error) {
    console.error("[TTS API Error]", error.message);
    res.status(503).json({
      success: false,
      error: error.message || "Voice generation failed."
    });
  }
};
app.post("/api/tts", handlePostTts);
app.post("/voice/api/tts", handlePostTts);

// --- Text Humanizer APIs ---
const handlePostHumanize = async (req, res) => {
  try {
    const { text, mode, strength, targetAudience } = req.body;
    const clientApiKey = req.headers["x-gemini-api-key"] || "";

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Please enter text to humanize." });
    }

    const result = await humanizeTextWithFailover(
      text.trim(),
      { mode: mode || "ultra", strength: strength || "aggressive", targetAudience: targetAudience || "general" },
      clientApiKey
    );

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[Humanizer API Error]", error.message);
    res.status(503).json({
      success: false,
      error: error.message || "Text humanization failed. Please check your API key in Settings."
    });
  }
};
app.post("/api/humanize", handlePostHumanize);
app.post("/humanizer/api/humanize", handlePostHumanize);

// --- MediaDrop APIs ---
const handleMediaExtract = (req, res) => {
  const rawUrl = req.body?.url?.trim();
  if (!rawUrl) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid Instagram or Pinterest URL."
    });
  }

  const pythonScript = path.join(mediaDropDir, "services", "cli_extract.py");
  const pyProcess = spawn("python", [pythonScript, rawUrl]);

  let stdoutData = "";
  let stderrData = "";

  pyProcess.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });

  pyProcess.stderr.on("data", (data) => {
    stderrData += data.toString();
  });

  pyProcess.on("close", (code) => {
    try {
      const parsed = JSON.parse(stdoutData.trim());
      if (parsed.success) {
        return res.json(parsed);
      } else {
        return res.status(400).json(parsed);
      }
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: "Failed to parse extraction response from Python service."
      });
    }
  });
};
app.post("/api/extract", handleMediaExtract);
app.post("/mediadrop/api/extract", handleMediaExtract);

const handleMediaStream = (req, res) => {
  const mediaUrl = req.query.url;
  const filename = req.query.filename || "mediadrop_media.mp4";
  const mediaType = req.query.type || "image";

  if (!mediaUrl) {
    return res.status(400).json({ success: false, error: "Missing media URL parameter." });
  }

  const client = mediaUrl.startsWith("https") ? https : http;
  const referer = mediaUrl.includes("pinimg") ? "https://www.pinterest.com/" : "https://www.instagram.com/";

  const options = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Referer": referer,
      "Accept": "*/*"
    }
  };

  client.get(mediaUrl, options, (remoteRes) => {
    if (remoteRes.statusCode >= 300 && remoteRes.statusCode < 400 && remoteRes.headers.location) {
      return res.redirect(remoteRes.headers.location);
    }

    const contentType = remoteRes.headers["content-type"] || (mediaType === "video" ? "video/mp4" : "image/jpeg");
    const contentLength = remoteRes.headers["content-length"];

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader("Content-Type", contentType);
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    remoteRes.pipe(res);
  }).on("error", (err) => {
    res.status(500).json({ success: false, error: `Failed to stream file: ${err.message}` });
  });
};
app.get("/api/stream", handleMediaStream);
app.get("/mediadrop/api/stream", handleMediaStream);

// Safe health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    suite: "OVI Micro-Services Hub",
    services: ["hub", "voice", "humanizer", "ductus", "ident", "mediadrop", "photonarrator"],
    port: PORT
  });
});

// -------------------------------------------------------------
// 7. PhotoNarrator Reverse Proxy (Next.js on internal port 9002)
// -------------------------------------------------------------
const photonarratorProxy = createProxyMiddleware({
  target: "http://127.0.0.1:9002",
  changeOrigin: true,
  ws: true,
  pathFilter: ["/photonarrator", "/_next"],
  on: {
    error: (err, req, res) => {
      if (res.headersSent) return;
      res.status(502).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>PhotoNarrator Initializing — OVI Hub</title>
          <link rel="stylesheet" href="/shared/navbar.css">
          <link rel="stylesheet" href="/style.css">
          <style>
            body { background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px; max-width: 520px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            h2 { color: #f43f5e; margin-bottom: 12px; font-size: 24px; font-weight: 700; }
            p { color: #94a3b8; line-height: 1.6; font-size: 14px; }
            code { background: #1e293b; padding: 6px 12px; border-radius: 6px; color: #38bdf8; font-family: monospace; font-size: 13px; display: inline-block; }
            .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #f43f5e; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>PhotoNarrator Worker Standby</h2>
            <p>The Next.js background worker for PhotoNarrator is not currently active on internal port 9002.</p>
            <p style="margin-top: 16px;">To launch the PhotoNarrator worker, run in terminal:<br><br><code>npm --prefix PhotoNarrator run dev</code></p>
            <a href="/photonarrator" class="btn">Refresh PhotoNarrator</a>
          </div>
        </body>
        </html>
      `);
    }
  }
});

app.use(photonarratorProxy);

// -------------------------------------------------------------
// 8. Central Hub Homepage (Root /)
// -------------------------------------------------------------
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Global Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -------------------------------------------------------------
// Start Unified Server
// -------------------------------------------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`  🌟 OVI Hub — Unified Multi-Service Master Server  `);
  console.log(`======================================================`);
  console.log(`  • Central Hub:     http://localhost:${PORT}/`);
  console.log(`  • Voice Studio:    http://localhost:${PORT}/voice`);
  console.log(`  • Text Humanizer:  http://localhost:${PORT}/humanizer`);
  console.log(`  • Ductus Studio:   http://localhost:${PORT}/ductus`);
  console.log(`  • Ident Studio:    http://localhost:${PORT}/ident`);
  console.log(`  • MediaDrop:       http://localhost:${PORT}/mediadrop`);
  console.log(`  • PhotoNarrator:   http://localhost:${PORT}/photonarrator`);
  console.log(`======================================================`);
  console.log(`  ✨ ALL services live on ONE single port (${PORT})!`);
  console.log(`======================================================\n`);
});

export default app;
