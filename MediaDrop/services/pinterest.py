"""
services/pinterest.py
Extractor module for publicly accessible Pinterest pins (images and videos).
Supports canonical pinterest.com/pin/ links and short pin.it links.
"""

import re
import json
import urllib.parse
from html import unescape

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def resolve_pinterest_url(url: str) -> str:
    """
    Resolves short pin.it links to full Pinterest URLs by following HTTP redirects.
    """
    import urllib.request
    
    if "pin.it" in url:
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=8) as response:
                return response.geturl()
        except Exception:
            return url
    return url


def extract_pin_id(url: str) -> str:
    """
    Extracts the Pinterest Pin ID from the URL.
    """
    match = re.search(r"pinterest\.[a-z.]+/pin/(\d+)", url)
    if match:
        return match.group(1)
    match = re.search(r"/pin/([0-9]+)", url)
    if match:
        return match.group(1)
    return ""


def upgrade_pinterest_image_quality(image_url: str) -> str:
    """
    Replaces thumbnail resolutions (236x, 474x, 736x) with original full resolution.
    e.g. i.pinimg.com/736x/... -> i.pinimg.com/originals/...
    """
    if not image_url:
        return image_url
    return re.sub(r"i\.pinimg\.com/(?:236x|474x|564x|736x)/", "i.pinimg.com/originals/", image_url)


def extract_pinterest_media(url: str) -> dict:
    """
    Extracts publicly accessible image or video from a Pinterest URL.
    
    Returns a dictionary:
    {
        "success": bool,
        "platform": "pinterest",
        "media_type": "video" | "image",
        "media_url": str,
        "thumbnail_url": str,
        "title": str,
        "pin_id": str,
        "source_url": str,
        "error": str | None
    }
    """
    import urllib.request

    resolved_url = resolve_pinterest_url(url)
    pin_id = extract_pin_id(resolved_url)

    try:
        req = urllib.request.Request(resolved_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as response:
            html_text = response.read().decode("utf-8", errors="ignore")
            final_page_url = response.geturl()
            if not pin_id:
                pin_id = extract_pin_id(final_page_url)
    except Exception as e:
        return {
            "success": False,
            "platform": "pinterest",
            "error": f"Unable to access Pinterest page. Please verify the link is public and accessible. Details: {str(e)}",
            "source_url": url,
        }

    # Strategy 1: Relay completed requests (Current Pinterest Single Page App state format)
    relay_matches = re.findall(r'__PWS_RELAY_REGISTER_COMPLETED_REQUEST__\s*\([^,]+,\s*({.+?})\s*\);', html_text)
    for relay_str in relay_matches:
        try:
            relay_data = json.loads(relay_str)
            data_dict = relay_data.get("data", {})
            for query_key, pin_data in data_dict.items():
                if isinstance(pin_data, dict):
                    # Check for PinNotFound
                    if pin_data.get("__typename") == "PinNotFound" or pin_data.get("__isError"):
                        continue
                    
                    title = pin_data.get("title") or pin_data.get("grid_title") or f"Pinterest Pin ({pin_id})"
                    
                    # 1. Videos in Relay
                    videos_obj = pin_data.get("videos") or pin_data.get("video_list") or {}
                    if isinstance(videos_obj, dict):
                        vlist = videos_obj.get("video_list", videos_obj)
                        for q in ["V_720P", "V_EXP7", "V_480P", "V_EXP6", "V_360P"]:
                            if q in vlist and isinstance(vlist[q], dict) and "url" in vlist[q]:
                                vurl = vlist[q]["url"]
                                if ".mp4" in vurl:
                                    thumb = pin_data.get("images", {}).get("orig", {}).get("url", "")
                                    return {
                                        "success": True,
                                        "platform": "pinterest",
                                        "media_type": "video",
                                        "media_url": vurl,
                                        "thumbnail_url": upgrade_pinterest_image_quality(thumb) or vurl,
                                        "title": title,
                                        "pin_id": pin_id,
                                        "source_url": resolved_url,
                                        "error": None,
                                    }

                    # 2. Images in Relay
                    images_obj = pin_data.get("images", {})
                    if isinstance(images_obj, dict):
                        img_url = ""
                        if "orig" in images_obj and isinstance(images_obj["orig"], dict):
                            img_url = images_obj["orig"].get("url", "")
                        elif "736x" in images_obj and isinstance(images_obj["736x"], dict):
                            img_url = images_obj["736x"].get("url", "")
                        
                        if img_url:
                            return {
                                "success": True,
                                "platform": "pinterest",
                                "media_type": "image",
                                "media_url": upgrade_pinterest_image_quality(img_url),
                                "thumbnail_url": img_url,
                                "title": title,
                                "pin_id": pin_id,
                                "source_url": resolved_url,
                                "error": None,
                            }
        except Exception:
            pass

    # Strategy 2: Parse __PWS_DATA__ Redux JSON state
    pws_match = re.search(r'<script\s+id="__PWS_DATA__"\s+type="application/json">({.*?})</script>', html_text, re.DOTALL)
    if pws_match:
        try:
            pws_data = json.loads(pws_match.group(1))
            props = pws_data.get("props", {}).get("initialReduxState", {}).get("pins", {})
            for pid, pdata in props.items():
                title = pdata.get("title") or pdata.get("grid_title") or pdata.get("rich_metadata", {}).get("title") or f"Pinterest Pin {pid}"
                
                videos_obj = pdata.get("videos", {})
                if videos_obj and "video_list" in videos_obj:
                    vlist = videos_obj["video_list"]
                    for quality_key in ["V_720P", "V_EXP7", "V_480P", "V_EXP6", "V_360P"]:
                        if quality_key in vlist and "url" in vlist[quality_key]:
                            video_url = vlist[quality_key]["url"]
                            if ".mp4" in video_url:
                                thumb = pdata.get("images", {}).get("orig", {}).get("url") or ""
                                return {
                                    "success": True,
                                    "platform": "pinterest",
                                    "media_type": "video",
                                    "media_url": video_url,
                                    "thumbnail_url": upgrade_pinterest_image_quality(thumb) or video_url,
                                    "title": title,
                                    "pin_id": pid or pin_id,
                                    "source_url": resolved_url,
                                    "error": None,
                                }

                images_obj = pdata.get("images", {})
                if images_obj:
                    img_url = ""
                    if "orig" in images_obj:
                        img_url = images_obj["orig"].get("url", "")
                    elif "736x" in images_obj:
                        img_url = images_obj["736x"].get("url", "")
                    
                    if img_url:
                        return {
                            "success": True,
                            "platform": "pinterest",
                            "media_type": "image",
                            "media_url": upgrade_pinterest_image_quality(img_url),
                            "thumbnail_url": img_url,
                            "title": title,
                            "pin_id": pid or pin_id,
                            "source_url": resolved_url,
                            "error": None,
                        }
        except Exception:
            pass

    # Strategy 3: JSON-LD schema markup
    ld_matches = re.findall(r'<script\s+type="application/ld\+json">({.*?})</script>', html_text, re.DOTALL)
    for ld_str in ld_matches:
        try:
            ld_json = json.loads(ld_str)
            title = ld_json.get("name") or ld_json.get("headline") or f"Pinterest Pin ({pin_id})"
            if "video" in ld_json:
                vinfo = ld_json["video"]
                vurl = vinfo.get("contentUrl") or vinfo.get("url")
                if vurl:
                    thumb = vinfo.get("thumbnailUrl") or ld_json.get("image")
                    return {
                        "success": True,
                        "platform": "pinterest",
                        "media_type": "video",
                        "media_url": vurl,
                        "thumbnail_url": thumb or vurl,
                        "title": title,
                        "pin_id": pin_id,
                        "source_url": resolved_url,
                        "error": None,
                    }
            if "image" in ld_json:
                img = ld_json["image"]
                img_url = img if isinstance(img, str) else (img.get("url") if isinstance(img, dict) else "")
                if img_url:
                    return {
                        "success": True,
                        "platform": "pinterest",
                        "media_type": "image",
                        "media_url": upgrade_pinterest_image_quality(img_url),
                        "thumbnail_url": img_url,
                        "title": title,
                        "pin_id": pin_id,
                        "source_url": resolved_url,
                        "error": None,
                    }
        except Exception:
            pass

    # Strategy 4: Direct regex detection for high-res pinimg assets
    vids = re.findall(r'(https://v\.pinimg\.com/videos/[^"\'\s<>]+\.mp4)', html_text)
    if vids:
        return {
            "success": True,
            "platform": "pinterest",
            "media_type": "video",
            "media_url": vids[0],
            "thumbnail_url": vids[0],
            "title": f"Pinterest Video Pin ({pin_id})",
            "pin_id": pin_id,
            "source_url": resolved_url,
            "error": None,
        }

    orig_imgs = re.findall(r'(https://i\.pinimg\.com/originals/[^"\'\s<>]+\.(?:jpg|jpeg|png|webp))', html_text)
    if orig_imgs:
        return {
            "success": True,
            "platform": "pinterest",
            "media_type": "image",
            "media_url": orig_imgs[0],
            "thumbnail_url": orig_imgs[0],
            "title": f"Pinterest Image Pin ({pin_id})",
            "pin_id": pin_id,
            "source_url": resolved_url,
            "error": None,
        }

    hires_imgs = re.findall(r'(https://i\.pinimg\.com/(?:736x|564x|474x)/[^"\'\s<>]+\.(?:jpg|jpeg|png|webp))', html_text)
    if hires_imgs:
        upgraded = upgrade_pinterest_image_quality(hires_imgs[0])
        return {
            "success": True,
            "platform": "pinterest",
            "media_type": "image",
            "media_url": upgraded,
            "thumbnail_url": hires_imgs[0],
            "title": f"Pinterest Image Pin ({pin_id})",
            "pin_id": pin_id,
            "source_url": resolved_url,
            "error": None,
        }

    return {
        "success": False,
        "platform": "pinterest",
        "error": "Could not extract public media from this Pinterest URL. Please verify that the pin exists and is publicly accessible.",
        "pin_id": pin_id,
        "source_url": resolved_url,
    }
