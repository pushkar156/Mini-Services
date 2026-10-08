import { NextResponse } from "next/server";

const ALLOWED_MEDIA_HOST_SUFFIXES = [
  ".cdninstagram.com",
  ".fbcdn.net",
  ".pinimg.com",
  "instagram.com",
  "pinterest.com",
];

function isProxyableMediaUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_MEDIA_HOST_SUFFIXES.some((s) => host.endsWith(s));
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get("url");
    const filename = searchParams.get("filename") || "mediadrop_asset.mp4";

    if (!mediaUrl || !isProxyableMediaUrl(mediaUrl)) {
      return NextResponse.json({ error: "Missing or unauthorized media URL parameter." }, { status: 400 });
    }

    const referer = mediaUrl.includes("pinimg.com")
      ? "https://www.pinterest.com/"
      : "https://www.instagram.com/";

    const res = await fetch(mediaUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: referer,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch media stream from source CDN." },
        { status: res.status }
      );
    }

    const contentType =
      res.headers.get("content-type") ||
      (filename.endsWith(".mp4") ? "video/mp4" : "image/jpeg");
    const data = await res.arrayBuffer();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to stream media" }, { status: 500 });
  }
}
