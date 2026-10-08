import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get("url");

    if (!mediaUrl) {
      return NextResponse.json({ error: "Missing media url parameter." }, { status: 400 });
    }

    const referer = mediaUrl.includes("pinimg")
      ? "https://www.pinterest.com/"
      : "https://www.instagram.com/";

    const res = await fetch(mediaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: referer,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch thumbnail from source CDN." }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch thumbnail" }, { status: 500 });
  }
}
