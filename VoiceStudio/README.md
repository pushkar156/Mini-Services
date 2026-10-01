# Gemini AI Studio — Multi-Service Suite 🎙️✍️

A modern, high-performance multi-service AI application powered by the Google Gemini API.

Built with pure **HTML5**, modern **CSS**, vanilla **JavaScript**, and a lightweight **Node.js + Express** server. No React, no Next.js, and no complex frontend frameworks.

---

## Services Included

1. 🎙️ **Voice Studio (Text-to-Speech)**: Studio-grade speech synthesis with 10 voice modules, 12 emotional tones, dialogue screenplay mode, real-time MP3/WAV generation, and an interactive audio player.
2. ✍️ **Text Humanizer**: Converts artificial, rigid AI-generated text (ChatGPT, Claude, Gemini) into authentic, natural-sounding human writing with high burstiness, natural rhythm, zero clichés, and a seamless 1-click bridge to Voice Studio.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [Multi-Service Architecture](#3-multi-service-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Folder Structure](#5-folder-structure)
6. [Prerequisites & Installing Node.js](#6-prerequisites--installing-nodejs)
7. [Installation](#7-installation)
8. [Configuring Environment Variables](#8-configuring-environment-variables)
9. [The 3-Key Failover System](#9-the-3-key-failover-system)
10. [Running Locally](#10-running-locally)
11. [Building & Deployment](#11-building--deployment)
12. [Security Guidelines](#12-security-guidelines)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Overview

**Gemini AI Studio** unites voice and text intelligence into a unified web application:
- **Voice Studio**: Converts scripts and dialogue into 24kHz studio master WAV and compressed MP3 audio powered by `gemini-3.8-flash-tts` / `gemini-3.8-flash-lite-tts`.
- **Text Humanizer**: Rewrites robotic AI text to defeat predictable statistical patterns, bypass AI detectors (Turnitin, GPTZero), and inject human cadence. Humanized text can immediately be sent to Voice Studio with a single click.

---

## 2. Key Features

### ✍️ Text Humanizer Service
- **Anti-AI Pattern Rewriting**: Eliminates overused AI clichés (`delve`, `testament`, `tapestry`, `in conclusion`, `furthermore`).
- **5 Humanization Modes**:
  1. *Ultra-Bypass (High Perplexity & Burstiness)* (Default)
  2. *Conversational & Natural* (Warm & relatable)
  3. *Academic & Nuanced* (Scholarly & rigorous)
  4. *Executive & Boardroom* (Crisp & punchy)
  5. *Creative & Storyteller* (Vivid & expressive)
- **3 Rewriting Depths**: Light Polish, Balanced, and Deep Structural Reconstruction.
- **Human Authenticity Metrics**: Live Human score estimation (e.g. 97% Human), cadence burstiness evaluation, and word count deltas.
- **⚡ 1-Click "Send to Voice Studio" Bridge**: Instantly transfers humanized prose directly into Voice Studio to synthesize natural speech.
- **Copy & Export**: One-click clipboard copy and `.txt` file export.

### 🎙️ Voice Studio Service
- **Gemini TTS Synthesis with MP3 & WAV**: Produces native 24kHz mono 16-bit `.wav` audio master and automatic high-efficiency `.mp3` encoding.
- **Dual Format Downloads**: Instant one-click download for both **`.MP3`** (compact size, universal compatibility) and **`.WAV`** (uncompressed studio master).
- **3-Key Automatic Failover**: Ensures high availability by cycling through `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, and `GEMINI_API_KEY_3` without interrupting the user.
- **10 TTS Voice Modules**: General, Narration, Storytelling, Podcast, Educational, News, Advertisement, Conversational, Audiobook, Character / Dramatic.
- **12 Emotional Tones**: Neutral, Friendly, Professional, Excited, Calm, Serious, Dramatic, Energetic, Warm, Confident, Storytelling, Whispering.
- **Dialogue Mode (Multi-Speaker)**: Generates conversations between two distinct Gemini voices (e.g., Alex as *Puck* and Sarah as *Kore*).
- **Vocal Bursts & Backchanneling**: Supports natural speech tags like `<breath>`, `<laugh>`, `<gasp>`, `|yeah|`, and `|mhm|`.
- **Integrated Audio Player**: Play/pause/stop, timeline seek scrubber, visualizer bars, volume/mute, and 0.75x–1.5x speed selector.
- **Quick Sample Presets**: Narration, Podcast, Storytelling, and Dialogue demos ready to synthesize with one click.
- **Character & Word Counter**: Real-time stats with estimated speech duration.
- **Strict Server-Side Security**: API keys are never sent to the browser or stored in client code.

---

## 3. Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (custom dark studio theme), Vanilla ES6 JavaScript.
- **Backend**: Node.js, Express (`^4.21.2`), `@google/genai` (`^2.4.0`), `dotenv`.
- **API**: Google Gemini TTS API (`gemini-3.8-flash-tts`).

---

## 4. Folder Structure

```
gemini-voice-studio/
│
├── public/                     # Static frontend assets (served by Express)
│   ├── index.html              # Studio single-page UI
│   ├── style.css               # Clean vanilla CSS dark studio theme
│   └── app.js                  # Frontend audio player & API communication
│
├── server/                     # Backend Node.js / Express code
│   ├── server.js               # Express application & API endpoints
│   ├── gemini.js               # Gemini TTS client & 3-key failover logic
│   └── voices.js               # Prebuilt voice catalogue & safe metadata
│
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore file (protects .env and node_modules)
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Complete documentation
```

---

## 5. Prerequisites & Installing Node.js

You need Node.js version 18.0 or later installed on your system.

### On macOS / Linux:
Download from [nodejs.org](https://nodejs.org) or install via terminal:
```bash
# Using nvm (Node Version Manager - Recommended)
nvm install 20
nvm use 20
```

### On Windows:
Download and run the official installer from [nodejs.org](https://nodejs.org).

Verify your installation:
```bash
node -v
npm -v
```

---

## 6. Installation

1. Clone or extract the project repository.
2. Navigate to the project root directory:
```bash
cd gemini-voice-studio
```
3. Install dependencies:
```bash
npm install
```

---

## 7. Configuring Environment Variables

1. Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```

2. Open `.env` in your text editor and add your Google Gemini API keys:
```env
# Primary API Key
GEMINI_API_KEY_1=AIzaSyYourFirstKeyHere

# Secondary API Key (used automatically if Key 1 hits limits)
GEMINI_API_KEY_2=AIzaSyYourSecondKeyHere

# Tertiary API Key (used automatically if Key 2 hits limits)
GEMINI_API_KEY_3=AIzaSyYourThirdKeyHere

# Server Port (optional, defaults to 3000)
PORT=3000

# Optional: Override TTS Model
# GEMINI_TTS_MODEL=gemini-3.8-flash-tts
```

> If you only have one key right now, provide it as `GEMINI_API_KEY_1`. The application will work normally and safely note that Key 1 is active.

---

## 8. The 3-Key Failover System

Gemini Voice Studio features automatic server-side key rotation located in `server/gemini.js`:

1. **Attempt Key 1**: The server always makes its initial call using `GEMINI_API_KEY_1`.
2. **Detect Recoverable Errors**: If the request encounters rate limits (`429`), quota limits (`RESOURCE_EXHAUSTED`), authentication/key errors (`401`, `403`), or temporary service issues (`500`, `503`), the server catches the error.
3. **Attempt Key 2**: It immediately retries the exact same request using `GEMINI_API_KEY_2`.
4. **Attempt Key 3**: If Key 2 fails, it falls back to `GEMINI_API_KEY_3`.
5. **Safe Logging**: The server logs clean status reports:
   ```
   [Gemini] Attempting key 1
   [Gemini] Key 1 failed (HTTP 429), trying key 2
   [Gemini] Key 2 succeeded
   ```
   **Keys and authorization headers are never logged or returned to the browser.**
6. **Frontend Transparency**: The browser UI never knows which key was used. If all keys are exhausted, a generic, user-friendly message is displayed ("Voice generation failed. Please try again.").

---

## 9. Running Locally

### Development Mode:
```bash
npm run dev
```
Open your browser and visit: `http://localhost:3000`

### Direct Node Server:
```bash
npm start
# or: node server/server.js
```

---

## 10. Building & Deployment

### Deployment to Render / Railway / Google Cloud Run

This application is designed as a standalone Node.js Express server, making deployment straightforward:

1. **Build command**: `npm run build`
2. **Start command**: `npm start` (runs `node server/server.js`)
3. **Environment variables**:
   In your hosting platform's dashboard (e.g., Render Environment tab, Railway Variables, or Cloud Run Environment variables), add:
   - `GEMINI_API_KEY_1`
   - `GEMINI_API_KEY_2`
   - `GEMINI_API_KEY_3`
   - `PORT=3000` (or leave default assigned by platform)

> **Important**: Never add Gemini API keys as public or client-side build variables (`VITE_` or `NEXT_PUBLIC_`). They must always be server runtime environment variables.

---

## 11. Security Guidelines

> ⚠️ **CRITICAL SECURITY REQUIREMENT**
> 
> **Never commit your `.env` file to Git or GitHub.**

1. **Keep `.env` in `.gitignore`**: The provided `.gitignore` already ignores all `.env*` files except `.env.example`.
2. **Never expose keys in client code**: Gemini keys exist exclusively in the Node.js backend. The frontend only communicates with `/api/tts` and `/api/voices`.
3. **No client-side key storage**: Never place keys in `localStorage`, `sessionStorage`, cookies, or URL query parameters.
4. **Input limits**: Text is validated on both client and server (maximum 10,000 characters per generation).

---

## 12. Changing the Gemini TTS Model

The model configuration is centralized in `server/gemini.js`:

```javascript
// server/gemini.js
export const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts";
export const FALLBACK_TTS_MODEL = "gemini-3.8-flash-lite-tts";
```

- **`gemini-3.8-flash-tts`**: Best for expressive audio, voice design, backchanneling, and multi-speaker dialogue.
- **`gemini-3.8-flash-lite-tts`**: Recommended fallback for general high-efficiency narration and localization.

You can also change the model without modifying code by setting the environment variable in `.env`:
```env
GEMINI_TTS_MODEL=gemini-3.8-flash-tts
```

---

## 13. Adding & Customizing Voices

The available Gemini prebuilt voices are registered in `server/voices.js`:

```javascript
// server/voices.js
const GEMINI_VOICES = [
  {
    id: "Kore",
    name: "Kore",
    gender: "Female",
    style: "Warm / Professional",
    description: "Clear, balanced, and articulate with an engaging, pleasant presence.",
    language: "English (Global / US)",
    recommended: ["Narration", "Educational", "General", "Audiobook"]
  },
  // Add new Gemini voice IDs here
];
```

Any changes in `server/voices.js` are automatically exposed via the `GET /api/voices` endpoint and dynamically reflected in the studio UI dropdowns.

---

## 14. Troubleshooting

### Problem: "No Gemini API keys are configured"
- **Cause**: No keys found in `.env` or system environment.
- **Fix**: Check that `.env` exists in the root folder and defines at least `GEMINI_API_KEY_1=AIzaSy...`. Restart the server after editing `.env`.

### Problem: "Voice generation failed. Please try again."
- **Cause**: All configured Gemini API keys failed (e.g. rate limit, quota exhausted, invalid key).
- **Fix**: Check the server terminal logs (`[Gemini] Attempting key 1...`). Verify your API keys in [Google AI Studio](https://aistudio.google.com).

### Problem: Audio does not play automatically
- **Cause**: Modern browsers sometimes restrict autoplay policies until the user has interacted with the page.
- **Fix**: Click the large **Play** button in the player controls or interact with the page before generating.

### Problem: Dialogue mode sounds like one speaker
- **Cause**: Dialogue turns did not have speaker names prefixing the text.
- **Fix**: Format text with speaker names followed by colons, for example:
  ```
  Alex: Hello Sarah, are you ready?
  Sarah: Yes, let's begin!
  ```

---

## License

Apache-2.0 License.
