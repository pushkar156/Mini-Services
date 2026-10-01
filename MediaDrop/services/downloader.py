"""
services/downloader.py
Utility for streaming and downloading extracted media files with proper headers,
filename sanitization, and automatic cleanup.
"""

import os
import re
import time
import urllib.request
from typing import Generator, Tuple, Optional
from urllib.parse import urlsplit

# Only these CDNs may be fetched on a caller's behalf. Without this allowlist the
# streaming endpoints act as an open proxy for any URL, including internal addresses
# such as cloud instance-metadata services.
ALLOWED_MEDIA_HOST_SUFFIXES = (
    ".cdninstagram.com",
    ".fbcdn.net",
    ".pinimg.com",
)

# Base directory for temporary downloads
DOWNLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "downloads")
try:
    os.makedirs(DOWNLOADS_DIR, exist_ok=True)
except Exception:
    # Fallback to /tmp for read-only environments like Vercel
    DOWNLOADS_DIR = os.path.join("/tmp", "mediadrop_downloads")
    try:
        os.makedirs(DOWNLOADS_DIR, exist_ok=True)
    except Exception:
        DOWNLOADS_DIR = "/tmp"


def is_proxyable_media_url(raw_url: str) -> bool:
    """
    Returns True only for http(s) URLs hosted on a known Instagram or Pinterest media CDN.

    Every endpoint that fetches a caller-supplied URL must gate on this, otherwise the
    server will happily relay arbitrary hosts (including link-local metadata endpoints)
    back to the client.
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
    return bool(host) and host.endswith(ALLOWED_MEDIA_HOST_SUFFIXES)


def sanitize_filename(name: str, default_extension: str = "mp4") -> str:
    """
    Sanitizes a string for use as a secure cross-platform filename.
    """
    # Remove characters illegal in Windows/Linux/macOS filenames
    clean_name = re.sub(r'[\\/*?:"<>|]', "", name)
    clean_name = re.sub(r'\s+', "_", clean_name).strip("._")
    
    if not clean_name:
        clean_name = f"mediadrop_{int(time.time())}"
        
    if not any(clean_name.lower().endswith(ext) for ext in [".mp4", ".jpg", ".jpeg", ".png", ".webp", ".gif"]):
        ext = default_extension.lstrip(".")
        clean_name = f"{clean_name}.{ext}"
        
    return clean_name


def generate_suggested_filename(platform: str, media_type: str, item_id: str = "") -> str:
    """
    Generates a clean suggested filename based on platform and type.
    """
    timestamp = int(time.time())
    identifier = item_id if item_id else str(timestamp)
    ext = "mp4" if media_type == "video" else "jpg"
    return f"mediadrop_{platform}_{identifier}.{ext}"


def detect_content_type(url: str, media_type: str) -> str:
    """
    Determines appropriate Content-Type header based on URL and media type.
    """
    lower_url = url.lower()
    if media_type == "video" or ".mp4" in lower_url:
        return "video/mp4"
    if ".png" in lower_url:
        return "image/png"
    if ".webp" in lower_url:
        return "image/webp"
    if ".gif" in lower_url:
        return "image/gif"
    return "image/jpeg"


def download_media_stream(media_url: str, chunk_size: int = 65536) -> Tuple[Generator[bytes, None, None], str, Optional[int]]:
    """
    Opens a stream for the media URL and yields chunks.
    Returns (generator, content_type, content_length).
    """
    req = urllib.request.Request(
        media_url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            "Referer": "https://www.pinterest.com/" if "pinimg" in media_url else "https://www.instagram.com/",
        }
    )
    
    response = urllib.request.urlopen(req, timeout=30)
    content_type = response.headers.get("Content-Type") or detect_content_type(media_url, "video" if ".mp4" in media_url else "image")
    content_length = response.headers.get("Content-Length")
    size = int(content_length) if content_length and content_length.isdigit() else None

    def stream_generator() -> Generator[bytes, None, None]:
        try:
            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                yield chunk
        finally:
            response.close()

    return stream_generator(), content_type, size


def cleanup_old_downloads(max_age_seconds: int = 3600):
    """
    Deletes temporary files in the downloads directory older than max_age_seconds.
    """
    now = time.time()
    try:
        for fname in os.listdir(DOWNLOADS_DIR):
            fpath = os.path.join(DOWNLOADS_DIR, fname)
            if os.path.isfile(fpath) and fname != ".gitkeep":
                if now - os.path.getmtime(fpath) > max_age_seconds:
                    try:
                        os.remove(fpath)
                    except OSError:
                        pass
    except Exception:
        pass
