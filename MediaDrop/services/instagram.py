"""
services/instagram.py
Extractor module for publicly accessible Instagram posts, reels, and videos.

Resolves media through an ordered ladder of public endpoints. Every candidate URL is
validated against an allowlist before it is returned, so a login wall, an age gate or a
rate-limited response can never be mistaken for real post media (it used to surface
Instagram's own logo as the "photo").
"""

import re
import json
import time
from html import unescape
from urllib.parse import parse_qs, urlsplit

import requests

# Standard headers mimicking a modern browser for public metadata retrieval
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}

# Mobile bot headers (frequently returned clean OpenGraph previews)
BOT_HEADERS = {
    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Accept": "*/*",
}

# iOS Safari headers - Instagram serves a different (often richer) SSR payload to mobile
MOBILE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Public web app id used by instagram.com itself for unauthenticated GraphQL reads
IG_APP_ID = "936619743392459"

# Known persisted-query ids for the public post query. These rot over time, so each is
# attempted in turn and a failure of the whole strategy is non-fatal.
GRAPHQL_DOC_IDS = ("8845758582119845", "10015901848480474", "9510064595728286")

# --- Media URL validation ---------------------------------------------------------------

# Instagram/Facebook CDN hosts that actually serve post media
_MEDIA_HOST_SUFFIXES = (".cdninstagram.com", ".fbcdn.net")

# Profile pictures live under this prefix - never post content
_AVATAR_MARKER = "/t51.82787-19/"

# Static site chrome: logos, badges, sprites. This is what used to leak through as "media".
_JUNK_MARKERS = ("rsrc.php", "instagram_logo", "ig-badge", "/static/", "/images/icon")

# Path prefixes used for photos (t51.*) and video streams (t2/t50/o1)
_MEDIA_PATH_MARKERS = ("/v/t51.", "/v/t2/", "/v/t50.", "/v/t16.", "/o1/v/")

_MEDIA_EXT_RE = re.compile(r"\.(?:jpg|jpeg|png|webp|heic|mp4|mov)(?:$|\?)", re.IGNORECASE)

# Post photos in the embed markup; anything else there is a "related posts" thumbnail
_POST_PHOTO_MARKER = "/t51.82787-15/"

# Explicit thumbnail sizing tokens (s240x240, p150x150, ...) - only ever on preview crops
_THUMB_SIZE_RE = re.compile(r"[sp]\d{2,4}x\d{2,4}")


def is_post_media_url(raw_url, allow_crops: bool = False) -> bool:
    """
    Returns True only for URLs that can plausibly be real Instagram post media.

    Guards against the failure mode where a blocked or login-walled response yields
    Instagram's own logo, a profile avatar, or a static asset, which would then be
    happily reported as the user's photo.

    Downscaled preview crops are rejected by default because they must never be handed
    out as the downloadable file. Pass allow_crops=True when validating a poster image,
    where a scaled candidate is perfectly serviceable.
    """
    if not raw_url or not isinstance(raw_url, str):
        return False

    try:
        parts = urlsplit(raw_url)
    except ValueError:
        return False

    if parts.scheme not in ("http", "https"):
        return False

    host = (parts.hostname or "").lower()
    if not host.endswith(_MEDIA_HOST_SUFFIXES):
        return False

    path = parts.path
    if _AVATAR_MARKER in path:
        return False

    lowered = raw_url.lower()
    if any(marker in lowered for marker in _JUNK_MARKERS):
        return False

    # Reject downscaled preview crops. Full-resolution post URLs carry no sizing token
    # (their stp is e.g. "dst-jpg_e35_tt6"), while grid and related-post thumbnails do
    # ("c0.0.240.240a_dst-jpg_s240x240"). Scoped to the path and the stp directive because
    # the opaque signature params can contain an incidental sNNNxNNN-looking substring.
    if not allow_crops:
        if _THUMB_SIZE_RE.search(path):
            return False
        for stp in parse_qs(parts.query).get("stp", ()):
            if _THUMB_SIZE_RE.search(stp):
                return False

    if any(marker in path for marker in _MEDIA_PATH_MARKERS):
        return True

    return bool(_MEDIA_EXT_RE.search(path))


def _is_embed_post_photo(raw_url: str) -> bool:
    """
    Stricter check used only when scraping raw <img> tags out of the embed page, where
    Instagram also renders unrelated "related posts" thumbnails alongside the real slides.
    """
    if not is_post_media_url(raw_url):
        return False
    if _POST_PHOTO_MARKER not in raw_url:
        return False
    return not _THUMB_SIZE_RE.search(raw_url)


def _clean_url(raw_url: str) -> str:
    """Normalizes an escaped URL taken out of HTML or embedded JSON."""
    if not raw_url:
        return ""
    return unescape(raw_url.replace("\\u0026", "&").replace("\\/", "/").replace("\\", ""))


# --- HTTP ------------------------------------------------------------------------------

_session = requests.Session()


def _fetch(url: str, headers: dict, retries: int = 2, timeout: int = 12):
    """
    GETs a URL, retrying transient failures with a short backoff.
    Returns the response text, or "" if every attempt failed.
    """
    for attempt in range(retries + 1):
        try:
            _session.cookies.clear()
            response = _session.get(url, headers=headers, timeout=timeout)
            if response.status_code == 200 and response.text:
                return response.text
            # 429/5xx are worth another try; 404 is not
            if response.status_code in (404, 410):
                return ""
        except requests.RequestException:
            pass
        if attempt < retries:
            time.sleep(0.6 * (attempt + 1))
    return ""


# --- Shortcode parsing -----------------------------------------------------------------

def extract_instagram_shortcode(url: str) -> str:
    """
    Extracts the shortcode from an Instagram URL.
    Supports formats:
    - https://www.instagram.com/p/CODE/
    - https://www.instagram.com/reel/CODE/
    - https://www.instagram.com/reels/CODE/
    - https://www.instagram.com/tv/CODE/
    - https://www.instagram.com/share/p/CODE/
    - https://www.instagram.com/share/reel/CODE/
    - https://www.instagram.com/username/p/CODE/
    - https://instagr.am/p/CODE/
    """
    pattern = (
        # Anchor the host on a boundary so lookalikes ("notinstagram.com",
        # "instagram.com.evil.net") do not match.
        r"(?:^|[/.])(?:instagram\.com|instagr\.am)/(?:[A-Za-z0-9_.]+/)?"
        r"(?:p|reel|reels|tv|share/p|share/reel|share)/([A-Za-z0-9_-]+)"
    )
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    return ""


# --- Result shaping --------------------------------------------------------------------

def _build_result(items, title, shortcode, source_url, partial=False, note=None) -> dict:
    """
    Normalizes a validated list of media items into the response contract consumed by
    app.py. A post with more than one item is always reported as a carousel so the UI
    can never silently present 1 of N.
    """
    items = [
        item for item in items
        if item.get("media_url") and is_post_media_url(item["media_url"])
    ]
    if not items:
        return None

    # Drop duplicates while preserving slide order
    unique, seen = [], set()
    for item in items:
        if item["media_url"] in seen:
            continue
        seen.add(item["media_url"])
        # A poster image that fails validation would render as a logo in the preview, so
        # fall back to the media URL itself rather than show something misleading.
        thumb = item.get("thumbnail_url")
        item["thumbnail_url"] = (
            thumb if is_post_media_url(thumb, allow_crops=True) else item["media_url"]
        )
        unique.append(item)

    first = unique[0]
    media_type = "carousel" if len(unique) > 1 else first["media_type"]

    result = {
        "success": True,
        "platform": "instagram",
        "media_type": media_type,
        "media_url": first["media_url"],
        "thumbnail_url": first.get("thumbnail_url") or first["media_url"],
        "title": title,
        "shortcode": shortcode,
        "source_url": source_url,
        "partial": partial,
        "error": None,
    }
    if note:
        result["note"] = note
    if len(unique) > 1:
        result["carousel_items"] = unique
    return result


def _largest(candidates, url_key="url"):
    """Picks the highest-resolution entry from a list of {url,width,height} dicts."""
    best, best_area = None, -1
    for candidate in candidates or []:
        if not isinstance(candidate, dict):
            continue
        url = candidate.get(url_key) or candidate.get("src")
        if not url:
            continue
        width = candidate.get("width") or candidate.get("config_width") or 0
        height = candidate.get("height") or candidate.get("config_height") or 0
        area = (width or 0) * (height or 0)
        if area > best_area:
            best, best_area = url, area
    return best


def _walk_for_key(node, key, found=None):
    """Recursively collects every dict in a JSON tree that contains `key`."""
    if found is None:
        found = []
    if isinstance(node, dict):
        if key in node:
            found.append(node)
        for value in node.values():
            _walk_for_key(value, key, found)
    elif isinstance(node, list):
        for value in node:
            _walk_for_key(value, key, found)
    return found


# --- Normalizers for the two payload shapes Instagram serves ---------------------------

def _items_from_graph_media(media: dict):
    """
    Normalizes a `shortcode_media` node (embed contextJSON and GraphQL both use this shape).
    Handles GraphSidecar carousels, GraphVideo and GraphImage.
    """
    if not isinstance(media, dict):
        return []

    def one(node):
        is_video = bool(node.get("is_video"))
        thumb = _clean_url(
            _largest(node.get("display_resources"), url_key="src") or node.get("display_url") or ""
        )
        if is_video:
            url = _clean_url(node.get("video_url") or "")
        else:
            url = thumb
        if not url:
            return None
        return {
            "media_type": "video" if is_video else "image",
            "media_url": url,
            "thumbnail_url": thumb or url,
        }

    edges = (media.get("edge_sidecar_to_children") or {}).get("edges") or []
    if edges:
        items = [one(edge.get("node") or {}) for edge in edges]
        return [item for item in items if item]

    single = one(media)
    return [single] if single else []


def _items_from_v1_media(media: dict):
    """
    Normalizes a v1 web-info node (`carousel_media` / `image_versions2` / `video_versions`),
    which is what the modern instagram.com SSR payload embeds.
    """
    if not isinstance(media, dict):
        return []

    def one(node):
        thumb = _clean_url(_largest((node.get("image_versions2") or {}).get("candidates")) or "")
        video = _clean_url(_largest(node.get("video_versions")) or "")
        url = video or thumb
        if not url:
            return None
        return {
            "media_type": "video" if video else "image",
            "media_url": url,
            "thumbnail_url": thumb or url,
        }

    children = media.get("carousel_media")
    if isinstance(children, list) and children:
        items = [one(child) for child in children]
        return [item for item in items if item]

    single = one(media)
    return [single] if single else []


def _caption_from_graph_media(media: dict) -> str:
    """Pulls the caption text out of a shortcode_media node."""
    edges = (media.get("edge_media_to_caption") or {}).get("edges") or []
    for edge in edges:
        text = ((edge.get("node") or {}).get("text") or "").strip()
        if text:
            return text
    return ""


# --- Strategies ------------------------------------------------------------------------

def _strategy_embed_context(shortcode: str, source_url: str):
    """
    S1: the public captioned-embed endpoint renders server-side HTML carrying a
    `contextJSON` blob with every carousel slide. This is the most reliable path.
    """
    embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"
    for headers in (BOT_HEADERS, MOBILE_HEADERS, HEADERS):
        html_text = _fetch(embed_url, headers)
        if not html_text:
            continue

        for encoded in re.findall(r'"contextJSON"\s*:\s*"((?:[^"\\]|\\.)*)"', html_text):
            try:
                parsed = json.loads(json.loads(f'"{encoded}"'))
            except (ValueError, TypeError):
                continue

            media = (parsed.get("gql_data") or {}).get("shortcode_media")
            if not media:
                continue

            items = _items_from_graph_media(media)
            title = _caption_from_graph_media(media)
            if not title:
                caption_match = re.search(
                    r'<div class="Caption"[^>]*>(.*?)</div>', html_text, re.DOTALL
                )
                if caption_match:
                    title = re.sub(r"<[^>]+>", "", caption_match.group(1)).strip()

            result = _build_result(
                items, title[:150] or f"Instagram Post ({shortcode})", shortcode, source_url
            )
            if result:
                return result, html_text

        # Keep the markup for the later scrape strategy even if contextJSON was unusable
        return None, html_text
    return None, ""


def _strategy_page_ssr(shortcode: str, source_url: str):
    """
    S2: the post page embeds its own data as `<script type="application/json">` blobs.
    Survives cases where the embed endpoint is blocked.
    """
    page_url = f"https://www.instagram.com/p/{shortcode}/"
    for headers in (MOBILE_HEADERS, HEADERS, BOT_HEADERS):
        html_text = _fetch(page_url, headers, timeout=15)
        if not html_text:
            continue

        blobs = re.findall(
            r'<script[^>]+type="application/json"[^>]*>(.*?)</script>', html_text, re.DOTALL
        )
        for blob in blobs:
            if "image_versions2" not in blob and "shortcode_media" not in blob:
                continue
            try:
                parsed = json.loads(blob)
            except ValueError:
                continue

            # Modern v1 shape
            for node in _walk_for_key(parsed, "image_versions2"):
                items = _items_from_v1_media(node)
                if not items:
                    continue
                caption = ((node.get("caption") or {}).get("text") or "").strip()
                result = _build_result(
                    items, caption[:150] or f"Instagram Post ({shortcode})", shortcode, source_url
                )
                if result:
                    return result

            # Legacy graph shape, occasionally still present
            for node in _walk_for_key(parsed, "shortcode_media"):
                media = node.get("shortcode_media")
                items = _items_from_graph_media(media)
                if not items:
                    continue
                caption = _caption_from_graph_media(media or {})
                result = _build_result(
                    items, caption[:150] or f"Instagram Post ({shortcode})", shortcode, source_url
                )
                if result:
                    return result
    return None


def _strategy_graphql(shortcode: str, source_url: str):
    """
    S3: the public persisted GraphQL query instagram.com itself uses for post pages.
    Best effort - the doc_id values rot, so every failure here is silent.
    """
    endpoint = "https://www.instagram.com/graphql/query"
    headers = {
        **MOBILE_HEADERS,
        "X-IG-App-ID": IG_APP_ID,
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": f"https://www.instagram.com/p/{shortcode}/",
    }
    for doc_id in GRAPHQL_DOC_IDS:
        payload = {
            "doc_id": doc_id,
            "variables": json.dumps({"shortcode": shortcode}),
        }
        try:
            _session.cookies.clear()
            response = _session.post(endpoint, data=payload, headers=headers, timeout=12)
            if response.status_code != 200:
                continue
            data = response.json()
        except (requests.RequestException, ValueError):
            continue

        media = (data.get("data") or {}).get("xdt_shortcode_media") or (
            data.get("data") or {}
        ).get("shortcode_media")
        if not media:
            continue

        items = _items_from_graph_media(media)
        caption = _caption_from_graph_media(media)
        result = _build_result(
            items, caption[:150] or f"Instagram Post ({shortcode})", shortcode, source_url
        )
        if result:
            return result
    return None


def _strategy_embed_scrape(shortcode: str, source_url: str, html_text: str):
    """
    S4: last structured attempt - pull <video>/<img> tags straight out of the embed markup.
    Only accepts real post photos, which excludes the "related posts" thumbnails Instagram
    renders on the same page.
    """
    if not html_text:
        return None

    items, seen = [], set()

    for raw in re.findall(r'<video[^>]+src=["\']([^"\']+)["\']', html_text):
        url = _clean_url(raw)
        if is_post_media_url(url) and url not in seen:
            seen.add(url)
            items.append({"media_type": "video", "media_url": url, "thumbnail_url": url})

    for raw in re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html_text):
        url = _clean_url(raw)
        if _is_embed_post_photo(url) and url not in seen:
            seen.add(url)
            items.append({"media_type": "image", "media_url": url, "thumbnail_url": url})

    # A single video plus one image is a video post and its cover frame, not a 2-slide album
    videos = [item for item in items if item["media_type"] == "video"]
    images = [item for item in items if item["media_type"] == "image"]
    if len(videos) == 1 and len(images) == 1:
        items = [{
            "media_type": "video",
            "media_url": videos[0]["media_url"],
            "thumbnail_url": images[0]["media_url"],
        }]

    caption_match = re.search(r'<div class="Caption"[^>]*>(.*?)</div>', html_text, re.DOTALL)
    title = ""
    if caption_match:
        title = re.sub(r"<[^>]+>", "", caption_match.group(1)).strip()

    return _build_result(
        items, title[:150] or f"Instagram Post ({shortcode})", shortcode, source_url
    )


def _strategy_opengraph(shortcode: str, source_url: str):
    """
    S5: OpenGraph tags. Deliberately last and always flagged `partial`, because og:image is
    a cropped 640px render of the *first* slide only - returning it unflagged is what made a
    10-photo album look like one image.
    """
    page_url = f"https://www.instagram.com/p/{shortcode}/"
    for headers in (BOT_HEADERS, MOBILE_HEADERS):
        html_text = _fetch(page_url, headers)
        if not html_text:
            continue

        og_video = re.search(
            r'<meta property="og:video(?::secure_url)?"\s+content="([^"]+)"', html_text
        )
        og_image = re.search(r'<meta property="og:image"\s+content="([^"]+)"', html_text)
        og_title = re.search(r'<meta property="og:title"\s+content="([^"]+)"', html_text)

        title = unescape(og_title.group(1)) if og_title else f"Instagram Media ({shortcode})"
        thumb = _clean_url(og_image.group(1)) if og_image else ""

        items = []
        if og_video:
            video_url = _clean_url(og_video.group(1))
            items = [{
                "media_type": "video",
                "media_url": video_url,
                "thumbnail_url": thumb or video_url,
            }]
        elif thumb:
            items = [{"media_type": "image", "media_url": thumb, "thumbnail_url": thumb}]

        result = _build_result(
            items,
            title[:150],
            shortcode,
            source_url,
            partial=True,
            note=(
                "Instagram limited this request, so only the cover image could be recovered. "
                "If this post is an album, retry in a moment to get every slide."
            ),
        )
        if result:
            return result
    return None


# --- Public entry point ----------------------------------------------------------------

def extract_instagram_media(url: str) -> dict:
    """
    Attempts to extract public media from an Instagram URL.

    Returns a dictionary:
    {
        "success": bool,
        "platform": "instagram",
        "media_type": "video" | "image" | "carousel",
        "media_url": str,
        "thumbnail_url": str,
        "title": str,
        "shortcode": str,
        "source_url": str,
        "partial": bool,               # True when only a cover image could be recovered
        "carousel_items": [ {...} ],   # present only for multi-slide posts
        "error": str | None
    }
    """
    shortcode = extract_instagram_shortcode(url)
    if not shortcode:
        return {
            "success": False,
            "platform": "instagram",
            "error": (
                "Invalid Instagram URL. Please provide a valid post or reel link "
                "(e.g., https://www.instagram.com/p/... or /reel/...)"
            ),
        }

    # S1 also hands back the embed markup so S4 can reuse it without a second request
    result, embed_html = _strategy_embed_context(shortcode, url)
    if result:
        return result

    for strategy in (_strategy_page_ssr, _strategy_graphql):
        try:
            result = strategy(shortcode, url)
        except Exception:
            result = None
        if result:
            return result

    try:
        result = _strategy_embed_scrape(shortcode, url, embed_html)
    except Exception:
        result = None
    if result:
        return result

    try:
        result = _strategy_opengraph(shortcode, url)
    except Exception:
        result = None
    if result:
        return result

    return {
        "success": False,
        "platform": "instagram",
        "error": (
            "Could not extract public media from this Instagram link. "
            "This usually occurs if the account is private, requires user login, "
            "or the post is age-restricted/rate-limited by Instagram."
        ),
        "shortcode": shortcode,
        "source_url": url,
    }
