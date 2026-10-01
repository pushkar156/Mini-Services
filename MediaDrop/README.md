# MediaDrop 📥

> **Live Demo**: [media-drop-one.vercel.app](https://media-drop-one.vercel.app/)

A lightweight, free, web application built with **Python (Flask)** and **Vanilla HTML/CSS/JavaScript** to extract and download publicly accessible images and videos from **Instagram** and **Pinterest**.

---

## 🌟 Features

- **Platform Auto-Detection**: Paste a URL and MediaDrop automatically identifies whether it is an Instagram post/reel or a Pinterest pin.
- **Zero Third-Party APIs or Paid Keys**: Uses public page structure, Open Graph metadata, and HTML embed endpoints.
- **Zipped Bulk Downloads**: Automatically bundles multi-photo Instagram carousel albums into a single `.zip` file using local `JSZip` to bypass browser download throttling.
- **Themed Light & Dark Modes**: Premium Sun/Moon switch to toggle between Cyber Emerald (Dark Theme) and Porcelain Minimal (Light Theme) aesthetics.
- **PWA Auto-Install Banner**: Custom floating installation banner gated by `sessionStorage` (shows once per session, easily dismissible) for one-click desktop/mobile installation.
- **Native Browser Downloads**: Streams media files directly to your computer with proper `Content-Disposition` attachment headers and proxy safety filters.
- **High-Resolution Pinterest Upgrades**: Automatically resolves thumbnail image URLs to full original quality (`/originals/`).
- **Interactive Live Preview**: Preview images or play videos directly in the browser before saving.
- **Graceful Error Handling**: Explains why certain private, restricted, or login-walled URLs cannot be fetched.

---

## 📁 Project Structure

```
mediadrop/
│
├── app.py                      # Main Flask application entry point & API routes
├── requirements.txt            # Python dependencies (Flask, requests, bs4, urllib3)
├── README.md                   # Setup guide and architecture documentation
├── vercel.json                 # Vercel deployment & routing configuration
│
├── api/
│   └── index.py                # Vercel serverless function entrypoint
│
├── services/                   # Modular extraction logic
│   ├── __init__.py             # Exports extractor functions
│   ├── instagram.py            # Public Instagram post/reel parser
│   ├── pinterest.py            # Pinterest pin & pin.it resolver & parser
│   └── downloader.py           # Stream generator, filename sanitizer & cleanup
│
├── templates/
│   └── index.html              # Frontend user interface (Jinja2 / HTML5 PWA page)
│
├── static/
│   ├── css/
│   │   └── style.css           # Modern, minimal responsive styling
│   ├── js/
│   │   ├── script.js           # Client-side validation, AJAX requests & UI state
│   │   └── sw.js               # Service Worker for offline asset caching
│   ├── images/
│   │   ├── logo.png            # High-resolution brand logo
│   │   ├── icon-192.png        # PWA launcher icon (192x192)
│   │   └── icon-512.png        # PWA splash icon (512x512)
│   └── manifest.json           # Web App Manifest for mobile installation
│
└── downloads/                  # Temporary cache directory for streamed downloads
```

### 🧠 What Every Major File Does

1. **`app.py`**:
   - Creates the Flask application instance.
   - Serves the frontend at `GET /`.
   - Implements `POST /api/extract` to inspect the submitted URL, route to the correct platform service, and return media metadata as JSON.
   - Implements `GET /api/stream` to fetch chunks of the media file from the remote source and stream them directly into the user's browser as a download attachment.

2. **`services/instagram.py`**:
   - Parses Instagram shortcodes from URLs (`/p/`, `/reel/`, `/tv/`, `/share/p/`).
   - Retrieves public captioned embed markup and OpenGraph tags to extract video and image sources without credentials.

3. **`services/pinterest.py`**:
   - Follows HTTP redirects for short `pin.it` URLs to find the canonical pin.
   - Parses `__PWS_DATA__` JSON state, JSON-LD schemas, and OpenGraph metadata to retrieve 720p/HD MP4 videos and full-resolution original photos.

4. **`services/downloader.py`**:
   - Formats clean filenames (e.g. `mediadrop_instagram_C123.mp4` or `mediadrop_pinterest_99220.jpg`).
   - Provides an asynchronous stream generator for piping bytes directly to the browser.
   - Manages temporary file cleanup in the `downloads/` directory.

5. **`templates/index.html` & `static/`**:
   - Provides a clean, responsive single-screen user interface with real-time platform badges, clipboard paste support, quick-test sample chips, video player preview, and direct download buttons.

---

## 🚀 How to Run Locally on Windows

Follow these exact steps in your terminal:

### Step 1: Open Terminal
Open **Command Prompt** (`cmd.exe`) or **PowerShell** and navigate to the project directory:
```cmd
cd path\to\mediadrop
```

### Step 2: Create a Virtual Environment
```cmd
python -m venv venv
```

### Step 3: Activate the Virtual Environment
- **On Command Prompt (`cmd.exe`)**:
  ```cmd
  venv\Scripts\activate
  ```
- **On PowerShell**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(Note: If PowerShell shows an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` once).*

### Step 4: Install Dependencies
```cmd
pip install -r requirements.txt
```

### Step 5: Start the Flask Application
```cmd
python app.py
```

### Step 6: Open in Browser
Open your web browser and visit:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)** (or `http://localhost:5000`)

---

## 🍏 How to Run on macOS / Linux

```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the application
python3 app.py
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser.

---

## 🚀 Deploying to Vercel

Host MediaDrop on Vercel as a Python Serverless Function:

1. **Commit and Push**: Ensure all files are committed and pushed to your GitHub repository.
2. **Import to Vercel**: Connect your GitHub account to Vercel and click **Add New > Project**, then import your `MediaDrop` repository.
3. **Automatic Deployment**: Vercel will automatically read [vercel.json](file:///d:/Pushkar/Pushkar/Personal%20Projects/MediaDrop/vercel.json) and compile the application.

---

## 📱 Progressive Web App (PWA) Support

MediaDrop is fully configured as a Progressive Web App, enabling native home screen installation on both desktop and mobile devices:

### Custom Install Prompt
When a user opens the web app, a custom, glassmorphic installation banner floats at the bottom of the screen:
- Users can click **Install** to prompt native browser installation.
- Users can dismiss the banner using the close (`X`) button. Dismissal is gated using `sessionStorage` (it stays hidden for the remainder of that browser tab session, resetting on new tab sessions).

### Manual Installation:
- **Android (Chrome)**: Tap the **three-dots menu** and select **"Install App"** (or click the custom bottom banner).
- **iOS / iPhone (Safari)**: Tap the **Share** button, scroll down, and select **"Add to Home Screen"**.
- **Desktop (Chrome/Edge)**: Click the **Install** icon inside the address bar or use the floating bottom banner.

---

## ⚠️ Important Notes on Public Content & Limitations

- **Public Accounts Only**: MediaDrop is designed to respect security boundaries. It does not bypass login walls, age gates, private accounts, CAPTCHAs, or authentication checks.
- **Platform Changes**: Major platforms occasionally adjust their client HTML structures. If an extraction fails, MediaDrop returns a helpful notice detailing the potential cause (private post, deleted media, or temporary rate limiting).
- **Educational Intent**: This software is intended for educational exploration of web scraping, metadata parsing, and Flask streaming architecture.
