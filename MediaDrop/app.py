"""
MediaDrop - Local Web Application
Backend Server (Flask)

Author: BTech Student Project / MediaDrop
Description: Extracts publicly available images and videos from Instagram and Pinterest
             and streams them directly to the user's browser for local downloading.
"""

import os
import urllib.parse
from flask import Flask, render_template, request, jsonify, Response, send_file

from services.instagram import extract_instagram_media
from services.pinterest import extract_pinterest_media
from services.downloader import (
    download_media_stream,
    generate_suggested_filename,
    is_proxyable_media_url,
    sanitize_filename,
    cleanup_old_downloads,
    DOWNLOADS_DIR,
)

# Initialize Flask app
# template_folder points to the HTML templates directory
# static_folder points to CSS, JS, and image assets
app = Flask(__name__, template_folder="templates", static_folder="static")

# Enable cleanup on server startup
cleanup_old_downloads()


def identify_platform(url: str) -> str:
    """
    Identifies if a given URL belongs to Instagram or Pinterest.
    Returns 'instagram', 'pinterest', or 'unsupported'.
    """
    if not url:
        return "unsupported"
        
    url_lower = url.lower().strip()
    if "instagram.com" in url_lower or "instagr.am" in url_lower:
        return "instagram"
    elif "pinterest." in url_lower or "pin.it" in url_lower:
        return "pinterest"
    return "unsupported"


def build_thumb_proxy_url(media_url: str) -> str:
    """
    Wraps a CDN media URL in the local /api/thumb proxy.

    Media URLs are resolved server-side (from a Vercel node), and the Instagram CDN often
    refuses those same URLs when a browser in another region loads them directly - which
    left broken previews that looked like the app had grabbed the wrong image.
    """
    if not media_url:
        return ""
    return "/api/thumb?url=" + urllib.parse.quote(media_url, safe="")


@app.route("/")
def index():
    """
    Renders the main single-page UI for MediaDrop.
    """
    return render_template("index.html")


@app.route("/sw.js")
def serve_sw():
    """
    Serves the service worker with JavaScript mime-type.
    """
    return send_file(os.path.join(app.static_folder, "js", "sw.js"), mimetype="application/javascript")


@app.route("/manifest.json")
def serve_manifest():
    """
    Serves the manifest file with JSON mime-type.
    """
    return send_file(os.path.join(app.static_folder, "manifest.json"), mimetype="application/json")


@app.route("/api/extract", methods=["POST"])
def api_extract():
    """
    API endpoint: Analyzes the provided URL, detects the platform,
    and extracts public media metadata (direct video/image link, title, thumbnail).
    
    Request JSON:
        { "url": "https://www.pinterest.com/pin/..." }
    """
    try:
        data = request.get_json(silent=True) or request.form
        raw_url = data.get("url", "").strip() if data else ""

        if not raw_url:
            return jsonify({
                "success": False,
                "error": "Please enter a valid Instagram or Pinterest URL."
            }), 400

        platform = identify_platform(raw_url)
        if platform == "unsupported":
            return jsonify({
                "success": False,
                "error": "Unsupported platform. MediaDrop currently supports public Instagram and Pinterest links."
            }), 400

        # Route to appropriate extractor service
        if platform == "instagram":
            result = extract_instagram_media(raw_url)
        elif platform == "pinterest":
            result = extract_pinterest_media(raw_url)
        else:
            result = {"success": False, "error": "Unknown platform."}

        if not result.get("success"):
            return jsonify({
                "success": False,
                "platform": platform,
                "error": result.get("error", "Extraction failed for this URL.")
            }), 400

        # Build clean download endpoint URL for the frontend
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
            "thumb_url": build_thumb_proxy_url(result.get("thumbnail_url") or result["media_url"]),
            "inline_url": build_thumb_proxy_url(result["media_url"]),
            "title": result.get("title", "MediaDrop Item"),
            "filename": suggested_filename,
            "stream_url": stream_download_url,
            "source_url": raw_url,
            "shortcode": result.get("shortcode") or result.get("pin_id") or "",
            "partial": bool(result.get("partial")),
        }
        if result.get("note"):
            response_data["note"] = result["note"]

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

                c_thumbnail = item.get("thumbnail_url") or item["media_url"]
                carousel_formatted.append({
                    "media_type": item_type,
                    "media_url": item["media_url"],
                    "thumbnail_url": c_thumbnail,
                    "thumb_url": build_thumb_proxy_url(c_thumbnail),
                    "filename": c_filename,
                    "stream_url": c_stream_url,
                })
            response_data["carousel_items"] = carousel_formatted

        return jsonify(response_data)

    except Exception as e:
        # Return user-friendly JSON error without exposing raw tracebacks
        return jsonify({
            "success": False,
            "error": f"An unexpected error occurred during extraction: {str(e)}"
        }), 500


@app.route("/api/stream", methods=["GET"])
def api_stream():
    """
    Streams the extracted media directly to the user's browser,
    attaching Content-Disposition header so it triggers a native file download.
    """
    media_url = request.args.get("url", "")
    filename = request.args.get("filename", "mediadrop_download.mp4")
    media_type = request.args.get("type", "image")

    if not media_url:
        return jsonify({"success": False, "error": "Missing media URL parameter."}), 400

    # Only known Instagram/Pinterest CDNs may be fetched, so this endpoint cannot be used
    # as a general-purpose proxy for arbitrary or internal hosts.
    if not is_proxyable_media_url(media_url):
        return jsonify({
            "success": False,
            "error": "That media URL is not on a supported Instagram or Pinterest CDN."
        }), 400

    clean_filename = sanitize_filename(filename, "mp4" if media_type == "video" else "jpg")

    try:
        stream_gen, content_type, size = download_media_stream(media_url)

        headers = {
            "Content-Disposition": f'attachment; filename="{clean_filename}"',
            "Content-Type": content_type,
        }
        if size:
            headers["Content-Length"] = str(size)

        return Response(stream_gen, headers=headers, mimetype=content_type)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to download and stream media: {str(e)}"
        }), 500


@app.route("/api/thumb", methods=["GET"])
def api_thumb():
    """
    Proxies a media URL for inline preview use (carousel thumbnails, single preview).

    Serves the bytes through this origin so previews do not depend on the browser being
    able to reach the CDN node the URL was resolved against.
    """
    media_url = request.args.get("url", "")

    if not media_url:
        return jsonify({"success": False, "error": "Missing media URL parameter."}), 400

    if not is_proxyable_media_url(media_url):
        return jsonify({
            "success": False,
            "error": "That media URL is not on a supported Instagram or Pinterest CDN."
        }), 400

    try:
        stream_gen, content_type, size = download_media_stream(media_url)

        headers = {
            "Content-Disposition": "inline",
            "Content-Type": content_type,
            "Cache-Control": "public, max-age=3600",
        }
        if size:
            headers["Content-Length"] = str(size)

        return Response(stream_gen, headers=headers, mimetype=content_type)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to load preview: {str(e)}"
        }), 502


@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "online",
        "app": "MediaDrop",
        "supported_platforms": ["instagram", "pinterest"],
        "version": "1.0.0"
    })


if __name__ == "__main__":
    # Local development server running on host 127.0.0.1 and port 5000 (or 3000)
    port = int(os.environ.get("PORT", 5000))
    print(f"==================================================")
    print(f"  MediaDrop Server running at: http://127.0.0.1:{port}")
    print(f"  Supported: Instagram & Pinterest (Public Media)")
    print(f"==================================================")
    app.run(host="0.0.0.0", port=port, debug=True)
