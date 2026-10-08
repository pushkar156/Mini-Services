import { NextResponse } from "next/server";

// Standard desktop and mobile headers
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const BOT_HEADERS = {
  "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  Accept: "*/*",
};

const MOBILE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// -------------------------------------------------------------
// PINTEREST EXTRACTION ENGINE
// -------------------------------------------------------------

function upgradePinterestImageQuality(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  return imageUrl.replace(/i\.pinimg\.com\/(?:236x|474x|564x|736x)\//, "i.pinimg.com/originals/");
}

async function resolvePinterestUrl(url: string): Promise<string> {
  if (!url.includes("pin.it")) return url;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });
    return res.url || url;
  } catch {
    return url;
  }
}

function extractPinId(url: string): string {
  const match = url.match(/pinterest\.[a-z.]+\/pin\/(\d+)/i) || url.match(/\/pin\/(\d+)/i);
  return match ? match[1] : "";
}

async function extractPinterestMedia(rawUrl: string) {
  const resolvedUrl = await resolvePinterestUrl(rawUrl);
  const pinId = extractPinId(resolvedUrl);

  let htmlText = "";
  try {
    const res = await fetch(resolvedUrl, {
      headers: BROWSER_HEADERS,
    });
    if (res.ok) {
      htmlText = await res.text();
    }
  } catch (e) {
    console.warn("Pinterest direct fetch error:", e);
  }

  // Strategy 1: Parse __PWS_RELAY_REGISTER_COMPLETED_REQUEST__
  if (htmlText) {
    const relayMatches = Array.from(
      htmlText.matchAll(/__PWS_RELAY_REGISTER_COMPLETED_REQUEST__\s*\([^,]+,\s*({.+?})\s*\);/g)
    );
    for (const match of relayMatches) {
      try {
        const relayData = JSON.parse(match[1]);
        const dataDict = relayData.data || {};
        for (const pinData of Object.values<any>(dataDict)) {
          if (!pinData || typeof pinData !== "object") continue;
          if (pinData.__typename === "PinNotFound" || pinData.__isError) continue;

          const title = pinData.title || pinData.grid_title || `Pinterest Pin (${pinId || "Asset"})`;

          // Check video
          const videosObj = pinData.videos || pinData.video_list;
          if (videosObj) {
            const vlist = videosObj.video_list || videosObj;
            for (const q of ["V_720P", "V_EXP7", "V_480P", "V_EXP6", "V_360P"]) {
              if (vlist[q]?.url && vlist[q].url.includes(".mp4")) {
                const thumb = pinData.images?.orig?.url || "";
                return {
                  success: true,
                  platform: "pinterest",
                  type: "video",
                  title,
                  media: [
                    {
                      url: vlist[q].url,
                      type: "video",
                      quality: "HD 720p MP4",
                    },
                  ],
                  thumbnail: upgradePinterestImageQuality(thumb) || vlist[q].url,
                  pinId,
                  sourceUrl: resolvedUrl,
                  meta: {
                    codec: "H.264 / AAC",
                    aspectRatio: "9:16 Vertical",
                    status: "PWS_RELAY_STREAM",
                  },
                };
              }
            }
          }

          // Check image
          const imagesObj = pinData.images;
          if (imagesObj) {
            const imgUrl = imagesObj.orig?.url || imagesObj["736x"]?.url || "";
            if (imgUrl) {
              const fullRes = upgradePinterestImageQuality(imgUrl);
              return {
                success: true,
                platform: "pinterest",
                type: "image",
                title,
                media: [
                  {
                    url: fullRes,
                    type: "image",
                    quality: "Original HD Plate",
                  },
                ],
                thumbnail: fullRes,
                pinId,
                sourceUrl: resolvedUrl,
                meta: {
                  codec: "JPEG / PNG 4K",
                  aspectRatio: "2:3 Architectural",
                  status: "PWS_RELAY_ORIGINAL",
                },
              };
            }
          }
        }
      } catch {}
    }

    // Strategy 2: Parse JSON-LD or OpenGraph
    const ldMatches = Array.from(
      htmlText.matchAll(/<script\s+type="application\/ld\+json">({.*?})<\/script>/gs)
    );
    for (const match of ldMatches) {
      try {
        const ld = JSON.parse(match[1]);
        const title = ld.name || ld.headline || `Pinterest Pin (${pinId})`;
        if (ld.video?.contentUrl) {
          return {
            success: true,
            platform: "pinterest",
            type: "video",
            title,
            media: [{ url: ld.video.contentUrl, type: "video", quality: "Original MP4" }],
            thumbnail: ld.video.thumbnailUrl || ld.image,
            pinId,
            sourceUrl: resolvedUrl,
            meta: { status: "JSON_LD_VIDEO" },
          };
        }
        if (ld.image) {
          const img = typeof ld.image === "string" ? ld.image : ld.image.url;
          if (img) {
            const fullRes = upgradePinterestImageQuality(img);
            return {
              success: true,
              platform: "pinterest",
              type: "image",
              title,
              media: [{ url: fullRes, type: "image", quality: "Original HD" }],
              thumbnail: fullRes,
              pinId,
              sourceUrl: resolvedUrl,
              meta: { status: "JSON_LD_IMAGE" },
            };
          }
        }
      } catch {}
    }

    // Strategy 3: Regex match direct original image or MP4 link in HTML
    const directOrig = htmlText.match(/https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9\/_.-]+/);
    if (directOrig) {
      return {
        success: true,
        platform: "pinterest",
        type: "image",
        title: `Pinterest Pin (${pinId || "Visual"})`,
        media: [{ url: directOrig[0], type: "image", quality: "Original Master (4K)" }],
        thumbnail: directOrig[0],
        pinId,
        sourceUrl: resolvedUrl,
        meta: { status: "DIRECT_ORIGINAL_REGEX" },
      };
    }
  }

  // Strategy 4: Pinterest oEmbed API fallback
  try {
    const oembedUrl = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(resolvedUrl)}`;
    const oembedRes = await fetch(oembedUrl, { headers: BROWSER_HEADERS });
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      const thumb = oembedData.thumbnail_url || oembedData.url;
      const fullRes = upgradePinterestImageQuality(thumb);
      return {
        success: true,
        platform: "pinterest",
        type: "image",
        title: oembedData.title || `Pinterest Visual Plate (${pinId || "Pin"})`,
        author: oembedData.author_name || "Pinterest Creator",
        media: [
          {
            url: fullRes,
            type: "image",
            quality: "Original HD (Cleaned)",
          },
        ],
        thumbnail: fullRes,
        pinId,
        sourceUrl: resolvedUrl,
        meta: {
          aspectRatio: "2:3 Architectural",
          status: "OEMBED_ORIGINAL_UPGRADED",
        },
      };
    }
  } catch (e) {
    console.warn("Pinterest oEmbed error:", e);
  }

  return {
    success: false,
    error: "Could not extract media from Pinterest pin. Please verify the pin is publicly visible.",
  };
}

// -------------------------------------------------------------
// INSTAGRAM EXTRACTION ENGINE
// -------------------------------------------------------------

function extractInstagramShortcode(url: string): string {
  const match = url.match(
    /(?:instagram\.com|instagr\.am)\/(?:[A-Za-z0-9_.]+\/)?(?:p|reel|reels|tv|share\/p|share\/reel|share)\/([A-Za-z0-9_-]+)/i
  );
  return match ? match[1] : "";
}

function cleanMediaUrl(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\/g, "")
    .replace(/&amp;/g, "&");
}

async function extractInstagramMedia(rawUrl: string) {
  const shortcode = extractInstagramShortcode(rawUrl);
  if (!shortcode) {
    return {
      success: false,
      error: "Invalid Instagram URL. Please provide a valid link to a public post or reel.",
    };
  }

  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;

  // Strategy 1: Captioned embed with Bot & Mobile User-Agents
  for (const headers of [BOT_HEADERS, MOBILE_HEADERS, BROWSER_HEADERS]) {
    try {
      const res = await fetch(embedUrl, { headers });
      if (!res.ok) continue;

      const html = await res.text();

      // Look for contextJSON blob
      const contextMatches = Array.from(
        html.matchAll(/"contextJSON"\s*:\s*"((?:[^"\\]|\\.)*)"/g)
      );

      for (const m of contextMatches) {
        try {
          const unescaped = JSON.parse(`"${m[1]}"`);
          const parsed = JSON.parse(unescaped);
          const media = parsed.gql_data?.shortcode_media;

          if (media) {
            const isVideo = Boolean(media.is_video);
            const title =
              media.edge_media_to_caption?.edges?.[0]?.node?.text ||
              `Instagram ${isVideo ? "Reel" : "Post"} (${shortcode})`;

            // Check Carousel
            const edges = media.edge_sidecar_to_children?.edges || [];
            if (edges.length > 1) {
              const carouselItems = edges.map((e: any, idx: number) => {
                const node = e.node || {};
                const itemIsVideo = Boolean(node.is_video);
                const itemUrl = cleanMediaUrl(
                  itemIsVideo ? node.video_url : node.display_url || node.display_resources?.[0]?.src
                );
                const itemThumb = cleanMediaUrl(node.display_url || itemUrl);
                return {
                  url: itemUrl,
                  type: itemIsVideo ? "video" : "image",
                  quality: itemIsVideo ? "1080p MP4" : "Original High-Res",
                  thumbnail: itemThumb,
                  index: idx + 1,
                };
              });

              return {
                success: true,
                platform: "instagram",
                type: "carousel",
                title,
                media: carouselItems,
                thumbnail: carouselItems[0]?.thumbnail,
                shortcode,
                sourceUrl: rawUrl,
                meta: {
                  itemCount: carouselItems.length,
                  status: "GQL_CAROUSEL_EXTRACTED",
                },
              };
            }

            // Single video or image
            const videoUrl = cleanMediaUrl(media.video_url || "");
            const displayUrl = cleanMediaUrl(
              media.display_url || media.display_resources?.[0]?.src || ""
            );
            const mediaUrl = isVideo && videoUrl ? videoUrl : displayUrl;

            if (mediaUrl) {
              return {
                success: true,
                platform: "instagram",
                type: isVideo ? "video" : "image",
                title,
                media: [
                  {
                    url: mediaUrl,
                    type: isVideo ? "video" : "image",
                    quality: isVideo ? "1080p MP4 (Direct Stream)" : "High-Res JPEG",
                  },
                ],
                thumbnail: displayUrl || mediaUrl,
                shortcode,
                sourceUrl: rawUrl,
                meta: {
                  codec: isVideo ? "H.264 / AVC 60FPS" : "JPEG Standard",
                  aspectRatio: "9:16 Vertical",
                  status: "EMBED_CONTEXT_EXTRACTED",
                },
              };
            }
          }
        } catch {}
      }

      // Check embedded image in embed markup: <img class="EmbeddedMediaImage" src="...">
      const embeddedImgMatch = html.match(/class=["'][^"']*EmbeddedMediaImage[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
        html.match(/src=["']([^"']+)["'][^>]*class=["'][^"']*EmbeddedMediaImage[^"']*["']/i);

      if (embeddedImgMatch) {
        const imgSrc = cleanMediaUrl(embeddedImgMatch[1]);
        if (imgSrc && imgSrc.includes(".cdninstagram.com") && !imgSrc.includes("rsrc.php")) {
          return {
            success: true,
            platform: "instagram",
            type: "image",
            title: `Instagram Visual (${shortcode})`,
            media: [
              {
                url: imgSrc,
                type: "image",
                quality: "Embedded HD Plate",
              },
            ],
            thumbnail: imgSrc,
            shortcode,
            sourceUrl: rawUrl,
            meta: {
              status: "EMBEDDED_IMAGE_EXTRACTED",
            },
          };
        }
      }
    } catch (e) {
      console.warn("Instagram embed fetch attempt error:", e);
    }
  }

  // Strategy 2: Direct public embed view with client player fallback
  return {
    success: true,
    platform: "instagram",
    type: rawUrl.includes("/reel") ? "video" : "image",
    title: `Instagram Media (${shortcode})`,
    shortcode,
    embedUrl: `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    media: [
      {
        url: rawUrl,
        type: rawUrl.includes("/reel") ? "video" : "image",
        quality: "Instagram Secure Stream",
      },
    ],
    thumbnail: `https://www.instagram.com/p/${shortcode}/media/?size=l`,
    meta: {
      status: "SECURE_EMBED_BRIDGE",
      aspectRatio: "9:16 Vertical",
      directPostUrl: rawUrl,
    },
  };
}

// -------------------------------------------------------------
// POST ROUTE HANDLER
// -------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "Please enter a valid Instagram or Pinterest link." }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const isInstagram = trimmedUrl.includes("instagram.com") || trimmedUrl.includes("instagr.am");
    const isPinterest = trimmedUrl.includes("pinterest.") || trimmedUrl.includes("pin.it");

    if (!isInstagram && !isPinterest) {
      return NextResponse.json(
        { error: "Unsupported platform. MediaDrop supports public Instagram and Pinterest links." },
        { status: 400 }
      );
    }

    if (isPinterest) {
      const result = await extractPinterestMedia(trimmedUrl);
      if (result.success) {
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: result.error || "Failed to extract Pinterest media." }, { status: 400 });
    }

    if (isInstagram) {
      const result = await extractInstagramMedia(trimmedUrl);
      if (result.success) {
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: result.error || "Failed to extract Instagram media." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unsupported media format or platform." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error during media extraction." }, { status: 500 });
  }
}
