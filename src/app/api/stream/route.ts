import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get("url");
    const filename = searchParams.get("filename") || "mediadrop_asset.mp4";

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
      return NextResponse.json({ error: "Failed to fetch media stream from source CDN." }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to stream media" }, { status: 500 });
  }
}
