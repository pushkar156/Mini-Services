"""
services/cli_extract.py
CLI bridge to invoke Python extractors from CLI or Node.js child processes.
"""

import sys
import os
import json
import urllib.parse

# Ensure current directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from services.instagram import extract_instagram_media
    from services.pinterest import extract_pinterest_media
    from services.downloader import generate_suggested_filename
except ImportError:
    from instagram import extract_instagram_media
    from pinterest import extract_pinterest_media
    from downloader import generate_suggested_filename


def identify_platform(url: str) -> str:
    url_lower = url.lower().strip()
    if "instagram.com" in url_lower or "instagr.am" in url_lower:
        return "instagram"
    elif "pinterest." in url_lower or "pin.it" in url_lower:
        return "pinterest"
    return "unsupported"


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No URL provided"}))
        sys.exit(1)

    raw_url = sys.argv[1].strip()
    platform = identify_platform(raw_url)

    if platform == "unsupported":
        print(json.dumps({
            "success": False,
            "error": "Unsupported platform. MediaDrop currently supports public Instagram and Pinterest links."
        }))
        sys.exit(0)

    if platform == "instagram":
        result = extract_instagram_media(raw_url)
    elif platform == "pinterest":
        result = extract_pinterest_media(raw_url)
    else:
        result = {"success": False, "error": "Unknown platform."}

    if not result.get("success"):
        print(json.dumps(result))
        sys.exit(0)

    item_id = result.get("shortcode") or result.get("pin_id") or "media"
    suggested_filename = generate_suggested_filename(platform, result.get("media_type", "image"), item_id)
    encoded_media_url = urllib.parse.quote(result["media_url"], safe="")
    encoded_filename = urllib.parse.quote(suggested_filename, safe="")
    stream_download_url = f"/api/stream?url={encoded_media_url}&filename={encoded_filename}&type={result.get('media_type', 'image')}"

    response_data = {
        "success": True,
        "platform": platform,
        "media_type": result.get("media_type", "image"),
        "media_url": result["media_url"],
        "thumbnail_url": result.get("thumbnail_url") or result["media_url"],
        "title": result.get("title", "MediaDrop Item"),
        "filename": suggested_filename,
        "stream_url": stream_download_url,
        "source_url": raw_url,
    }

    # Format carousel items if they exist
    if result.get("media_type") == "carousel" and "carousel_items" in result:
        carousel_formatted = []
        for index, item in enumerate(result["carousel_items"]):
            item_type = item.get("media_type", "image")
            item_id_str = f"{item_id}_{index + 1}"
            c_filename = generate_suggested_filename(platform, item_type, item_id_str)
            
            c_encoded_media_url = urllib.parse.quote(item["media_url"], safe="")
            c_encoded_filename = urllib.parse.quote(c_filename, safe="")
            c_stream_url = f"/api/stream?url={c_encoded_media_url}&filename={c_encoded_filename}&type={item_type}"
            
            carousel_formatted.append({
                "media_type": item_type,
                "media_url": item["media_url"],
                "thumbnail_url": item.get("thumbnail_url") or item["media_url"],
                "filename": c_filename,
                "stream_url": c_stream_url,
            })
        response_data["carousel_items"] = carousel_formatted

    print(json.dumps(response_data))


if __name__ == "__main__":
    main()
