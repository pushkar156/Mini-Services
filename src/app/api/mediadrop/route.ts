import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "Please provide a valid media URL." }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const isInstagram = trimmedUrl.includes("instagram.com");
    const isPinterest = trimmedUrl.includes("pinterest.com") || trimmedUrl.includes("pin.it");

    if (!isInstagram && !isPinterest) {
      return NextResponse.json(
        { error: "Unsupported platform. MediaDrop supports Instagram and Pinterest URLs." },
        { status: 400 }
      );
    }

    // 1. Pinterest Extraction
    if (isPinterest) {
      try {
        const oembedUrl = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(trimmedUrl)}`;
        const oembedRes = await fetch(oembedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          const imageUrl = oembedData.thumbnail_url || oembedData.url;
          return NextResponse.json({
            success: true,
            platform: "pinterest",
            type: "image",
            title: oembedData.title || "Pinterest Visual Asset",
            author: oembedData.author_name || "Pinterest Creator",
            media: [
              {
                url: imageUrl,
                type: "image",
                quality: "Original HD",
              },
            ],
            thumbnail: imageUrl,
            meta: {
              width: oembedData.width || 1080,
              height: oembedData.height || 1920,
              aspectRatio: "9:16",
              status: "VERIFIED_CDN",
            },
          });
        }
      } catch (e) {
        console.error("Pinterest oEmbed error:", e);
      }
    }

    // 2. Instagram Extraction
    if (isInstagram) {
      // Extract shortcode
      const match = trimmedUrl.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      const shortcode = match ? match[1] : null;

      // Try fetching open meta tags
      try {
        const res = await fetch(trimmedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        });

        if (res.ok) {
          const html = await res.text();
          const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
          const ogVideoMatch = html.match(/<meta\s+property=["']og:video["']\s+content=["']([^"']+)["']/i);
          const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);

          const imageUrl = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, "&") : null;
          const videoUrl = ogVideoMatch ? ogVideoMatch[1].replace(/&amp;/g, "&") : null;
          const title = ogTitleMatch ? ogTitleMatch[1] : `Instagram Reel (${shortcode || "Media"})`;

          if (videoUrl || imageUrl) {
            return NextResponse.json({
              success: true,
              platform: "instagram",
              type: videoUrl ? "video" : "image",
              title,
              media: [
                {
                  url: videoUrl || imageUrl,
                  type: videoUrl ? "video" : "image",
                  quality: videoUrl ? "1080p MP4" : "High-Res JPEG",
                },
              ],
              thumbnail: imageUrl || videoUrl,
              shortcode,
              meta: {
                codec: videoUrl ? "H.264 / AVC" : "JPEG",
                aspectRatio: "9:16",
                status: "EXTRACTED_VIA_OG",
              },
            });
          }
        }
      } catch (err) {
        console.error("IG scrape error:", err);
      }

      // Fallback: Return structured shortcode info so client can embed or stream
      return NextResponse.json({
        success: true,
        platform: "instagram",
        type: trimmedUrl.includes("/reel/") ? "video" : "image",
        title: `Instagram Media (${shortcode || "Asset"})`,
        shortcode,
        embedUrl: shortcode ? `https://www.instagram.com/p/${shortcode}/embed/captioned/` : null,
        media: [
          {
            url: trimmedUrl,
            type: trimmedUrl.includes("/reel/") ? "video" : "image",
            quality: "Original Stream",
          },
        ],
        meta: {
          aspectRatio: "9:16",
          status: "CLIENT_DIRECT_EMBED",
        },
      });
    }

    return NextResponse.json({ error: "Failed to extract media from provided URL." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
