import { NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIXES = [
  ".cdninstagram.com",
  ".fbcdn.net",
  ".pinimg.com",
  "instagram.com",
  "pinterest.com",
];

function isAllowedHost(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl || !isAllowedHost(targetUrl)) {
      return NextResponse.json({ error: "Invalid or unauthorized media URL." }, { status: 400 });
    }

    const referer = targetUrl.includes("pinimg.com")
      ? "https://www.pinterest.com/"
      : "https://www.instagram.com/";

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: referer,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch image from CDN." }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const data = await res.arrayBuffer();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Proxy error" }, { status: 500 });
  }
}
