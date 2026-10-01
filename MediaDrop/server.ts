import express from "express";
import path from "path";
import { spawn } from "child_process";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT: number = Number(process.env.PORT) || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (CSS, JS, images)
app.use("/static", express.static(path.join(__dirname, "static")));

// Serve shared OVI Hub modules (navbar, modal, api key manager)
app.use("/shared", express.static(path.join(__dirname, "..", "shared")));

// Root route serves the frontend UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.get("/sw.js", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "js", "sw.js"));
});

app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "manifest.json"));
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    app: "MediaDrop",
    supported_platforms: ["instagram", "pinterest"],
    version: "1.0.0"
  });
});

// POST /api/extract - Calls Python extraction service
app.post("/api/extract", (req, res) => {
  const rawUrl = req.body?.url?.trim();
  if (!rawUrl) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid Instagram or Pinterest URL."
    });
  }

  const pythonScript = path.join(__dirname, "services", "cli_extract.py");
  const pyProcess = spawn("python3", [pythonScript, rawUrl]);

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
});

// GET /api/stream - Streams media file directly to user's browser with download headers
app.get("/api/stream", (req, res) => {
  const mediaUrl = req.query.url as string;
  const filename = (req.query.filename as string) || "mediadrop_media.mp4";
  const mediaType = (req.query.type as string) || "image";

  if (!mediaUrl) {
    return res.status(400).json({ success: false, error: "Missing media URL parameter." });
  }

  const client = mediaUrl.startsWith("https") ? https : http;
  const referer = mediaUrl.includes("pinimg") ? "https://www.pinterest.com/" : "https://www.instagram.com/";

  const options = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Referer": referer,
    }
  };

  client.get(mediaUrl, options, (remoteRes) => {
    // Follow redirect if 301/302
    if (remoteRes.statusCode && remoteRes.statusCode >= 300 && remoteRes.statusCode < 400 && remoteRes.headers.location) {
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
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MediaDrop server running on http://0.0.0.0:${PORT}`);
});
