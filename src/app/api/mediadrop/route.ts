import { NextResponse } from "next/server";
import path from "path";
import { spawn } from "child_process";

// Helper to run Python extraction CLI
function runPythonExtractor(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "src", "services", "mediadrop", "cli_extract.py");
    // Try python then python3
    const pyCmd = process.platform === "win32" ? "python" : "python3";
    const pyProcess = spawn(pyCmd, [pythonScript, url]);

    let stdoutData = "";
    let stderrData = "";

    pyProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pyProcess.on("error", (err) => {
      reject(err);
    });

    pyProcess.on("close", (code) => {
      try {
        if (!stdoutData.trim()) {
          return reject(new Error(stderrData.trim() || `Python process exited with code ${code}`));
        }
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (e: any) {
        reject(new Error(`Failed to parse extraction response: ${stdoutData || stderrData}`));
      }
    });
  });
}

// Pure Node.js fallback for Pinterest
async function extractPinterestNode(url: string): Promise<any> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`Unable to fetch Pinterest page (HTTP ${res.status})`);
  }

  const html = await res.text();
  const finalUrl = res.url;
  const pinMatch = finalUrl.match(/\/pin\/(\d+)/) || url.match(/\/pin\/(\d+)/);
  const pinId = pinMatch ? pinMatch[1] : "pin";

  // Check for video
  const videoMatch = html.match(/"contentUrl":\s*"([^"]+\.mp4[^"]*)"/i) || html.match(/(https:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)/i);
  let videoUrl = videoMatch ? videoMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/") : null;

  // Check for high-res images
  const origMatches = html.match(/https:\/\/i\.pinimg\.com\/(?:originals|\d+x)\/[^"'\s\\]+/g);
  let imageUrl = null;
  if (origMatches && origMatches.length > 0) {
    imageUrl = origMatches[0].replace(/\/(?:236x|474x|564x|736x)\//, "/originals/");
  }

  // Fallback to og:image
  if (!imageUrl && !videoUrl) {
    const ogImg = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImg) imageUrl = ogImg[1];
  }

  if (!imageUrl && !videoUrl) {
    throw new Error("Could not extract image or video from Pinterest pin.");
  }

  const isVideo = Boolean(videoUrl);
  const mediaUrl = videoUrl || imageUrl || "";
  const filename = `mediadrop_pinterest_${pinId}.${isVideo ? "mp4" : "jpg"}`;
  const streamUrl = `/api/stream?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}&type=${isVideo ? "video" : "image"}`;

  return {
    success: true,
    platform: "pinterest",
    media_type: isVideo ? "video" : "image",
    media_url: mediaUrl,
    thumbnail_url: imageUrl || mediaUrl,
    title: `Pinterest Pin (${pinId})`,
    filename,
    stream_url: streamUrl,
    source_url: url,
  };
}

async function handleExtraction(url: string | null) {
  try {
    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "Please provide a valid media URL." }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const isInstagram = trimmedUrl.includes("instagram.com") || trimmedUrl.includes("instagr.am");
    const isPinterest = trimmedUrl.includes("pinterest.com") || trimmedUrl.includes("pin.it");

    if (!isInstagram && !isPinterest) {
      return NextResponse.json(
        { error: "Unsupported platform. MediaDrop supports public Instagram and Pinterest links." },
        { status: 400 }
      );
    }

    let extraction: any = null;

    // 1. Primary: Run mature Python extractor engine
    try {
      extraction = await runPythonExtractor(trimmedUrl);
    } catch (pyErr) {
      console.warn("Python extractor failed or unavailable, running Node fallback:", pyErr);
      // 2. Node Fallback
      if (isPinterest) {
        try {
          extraction = await extractPinterestNode(trimmedUrl);
        } catch (nodeErr: any) {
          return NextResponse.json({ error: nodeErr.message || "Failed to extract Pinterest pin." }, { status: 400 });
        }
      } else {
        return NextResponse.json(
          { error: "Could not extract media from this Instagram link. Ensure the post is public, not age-restricted or deleted." },
          { status: 400 }
        );
      }
    }

    if (!extraction || !extraction.success) {
      return NextResponse.json(
        { error: extraction?.error || "Failed to extract media from provided URL." },
        { status: 400 }
      );
    }

    const platform = extraction.platform || (isPinterest ? "pinterest" : "instagram");
    const mediaType = extraction.media_type || "image";
    const mediaUrl = extraction.media_url;
    const thumbUrl = extraction.thumbnail_url || mediaUrl;
    const title = extraction.title || `${platform.toUpperCase()} Asset`;
    const filename = extraction.filename || `mediadrop_${platform}_${Date.now()}.${mediaType === "video" ? "mp4" : "jpg"}`;
    const streamUrl = extraction.stream_url || `/api/stream?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}&type=${mediaType}`;

    // Normalize for both Next.js UI contract and MediaDrop client
    return NextResponse.json({
      success: true,
      platform,
      type: mediaType,
      media_type: mediaType,
      title,
      filename,
      media_url: mediaUrl,
      thumbnail_url: thumbUrl,
      thumbnail: thumbUrl,
      stream_url: streamUrl,
      source_url: trimmedUrl,
      carousel_items: extraction.carousel_items || [],
      media: [
        {
          url: mediaUrl,
          type: mediaType === "video" ? "video" : "image",
          quality: mediaType === "video" ? "Original HD Video" : "Original High-Res Image",
        },
      ],
      meta: {
        status: "VERIFIED_EXTRACTED",
        codec: mediaType === "video" ? "H.264 / AVC MP4" : "Original JPEG/PNG",
        aspectRatio: "9:16",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error during extraction" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return handleExtraction(body?.url);
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  return handleExtraction(url);
}
