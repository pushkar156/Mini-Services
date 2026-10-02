# OVI Atelier ✧ Unified Creative Suite

> High-density tactile micro-services engineered for synthesis pipelines, lexical cadence alignment, architectural diagramming, and client-driven media extraction.

[![Deployment Status](https://img.shields.io/badge/Vercel-Live%20Deployment-black?style=for-the-badge&logo=vercel)](https://ovi-atelier.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-20232a?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFA611?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🏛️ Vision & Philosophy

**OVI Atelier** brings together 6 standalone creative micro-services into an architectural, local-first web application. Rather than generic utilitarian dashboards, each service is designed as an intimate craft environment—ranging from Braun-inspired hi-fi audio controls to Japanese editorial presses and darkroom contact sheets.

- **Local-First Privacy:** Zero API keys are stored on servers. Gemini BYOK keys are encrypted directly in the client browser's local storage.
- **Local Ollama Support:** Seamless toggle between remote Google Gemini models and offline, local Ollama endpoints (`http://localhost:11434`).
- **Cloud History Synchronization:** Authenticated users enjoy real-time Cloud Firestore history archiving across all engines without compromising privacy.

---

## 🛠️ The 6 Creative Engines

| Engine | Theme & Aesthetic | Capabilities & Architecture |
|---|---|---|
| **[Voice Studio](/voice)** | *Braun Hi-Fi Audio Console* | Physical Dieter Rams sliders for rate, pitch, and timbre. Multi-speaker script dialogue tags (`[Speaker A]`), live waveform scrubber, and speech synthesis via Gemini audio generation. |
| **[Text Humanizer](/humanizer)** | *Japanese Editorial Press* | Dual literary desks with anti-AI cadence alignment. Real-time cliché scanner highlighting synthetic filler words, burstiness & perplexity variance gauges, and one-click transfer to Voice Studio. |
| **[Ductus Flowchart](/ductus)** | *Architectural Blueprint Studio* | Vector CAD drafting canvas with dot-grid matting. Prompt-to-flowchart generation, Mermaid.js real-time rendering, zoom/pan controls, and SVG/PNG architectural vector export. |
| **[Ident Naming](/ident)** | *Haute Couture Brand Atelier* | Phonosemantic lexicon synthesizer for luxury tech and tactile hardware. Evaluates syllabic cadence, phoneme resonance, and multi-TLD availability (`.com`, `.io`, `.ai`) with CSV dossier export. |
| **[MediaDrop](/mediadrop)** | *Nordic Glacier Vault* | Client-side media extraction utility for Instagram and Pinterest public posts. Direct in-browser parsing without serverless IP bans or Python binaries, featuring local ZIP batch streaming. |
| **[PhotoNarrator](/photonarrator)** | *Film Darkroom & Cine-Silver* | Analog contact sheet gallery. Transcribes emulsion cues, exposure contrast, and EXIF metadata into evocative literary prose and film-grade narrative arcs. |

---

## ⚡ Technical Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19, TypeScript)
- **Styling & Design System:** Tailored Vanilla Tailwind CSS with high-end HSL palettes:
  - *Obsidian Black:* `#0B0C0E`
  - *Cashmere Sand:* `#CDC6BB`
  - *Smoked Amber:* `#C89B6D`
  - *Japanese Linen:* `#1B1917`
  - *Glacier Mist:* `#688B9A`
- **Typography:** Google Fonts:
  - `Syne` & `Space Grotesk` (Display & Titles)
  - `JetBrains Mono` (Telemetry & Code Metrics)
  - `Newsreader` & `Italiana` (Editorial Serif Prose)
- **Backend & Cloud Services:**
  - **Firebase Authentication:** Google OAuth (Popup) + Email/Password sign-in.
  - **Cloud Firestore:** User-scoped timeline history (`users/{uid}/history`) with reactive real-time sync (`onSnapshot`).
  - **Firestore Security Rules:** Strict least-privilege, owner-only mutation protection.
- **AI Runtimes:**
  - Google Gemini 2.5 / Flash via `@google/genai`
  - Local Ollama Engine (`/api/tags`, `/api/generate`)

---

## 📁 Repository Anatomy

```text
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js Serverless Route Handlers
│   │   │   ├── ductus/          # AI Mermaid diagram compiler
│   │   │   ├── humanize/        # Anti-AI cadence processor
│   │   │   ├── ident/           # Phonosemantic brand synthesizer
│   │   │   ├── mediadrop/       # Client extraction proxy
│   │   │   ├── narrate/         # Photo-to-prose generator
│   │   │   ├── stream/          # Media stream pipe
│   │   │   └── tts/             # Gemini Voice audio buffer
│   │   ├── ductus/              # Ductus CAD Studio Page
│   │   ├── humanizer/           # Editorial Humanizer Page
│   │   ├── ident/               # Brand Atelier Page
│   │   ├── mediadrop/           # Glacier Vault Page
│   │   ├── photonarrator/       # Film Darkroom Page
│   │   ├── voice/               # Braun Voice Console Page
│   │   ├── globals.css          # Design tokens & glassmorphic utilities
│   │   ├── icon.svg             # Minimalist vector favicon
│   │   ├── layout.tsx           # Global Providers & Sticky Micro-Bar
│   │   └── page.tsx             # The Central Atelier Directory
│   ├── components/
│   │   ├── AuthModal.tsx        # Firebase Sign-In / Sign-Up Modal
│   │   ├── HistoryDrawer.tsx    # Slide-over Firestore Archive Timeline
│   │   ├── Navbar.tsx           # 48px sticky glassmorphic navigation bar
│   │   ├── OviLogo.tsx          # Minimalist architectural vector hallmark
│   │   └── SettingsModal.tsx    # BYOK / Local Ollama connection modal
│   ├── context/
│   │   ├── ApiKeyContext.tsx    # Client BYOK & Ollama state manager
│   │   └── AuthContext.tsx      # Firebase User reactive auth state
│   └── lib/
│       ├── firebase.ts          # Firebase App, Auth & Firestore singleton
│       └── historyService.ts    # Firestore history collection CRUD
├── firestore.rules              # Production Cloud Firestore Security Rules
├── firebase.json                # Firebase configuration manifest
└── phases.md                    # Architecture and migration roadmap
```

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/pushkar156/Mini-Services.git
cd Mini-Services
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy

1. **Client-Side BYOK:** All API keys entered in the Key Setup dialog remain strictly inside your browser's `localStorage`. They are transmitted directly to the respective API providers via secure client calls and are never stored in databases.
2. **Firestore Rules:** User data is strictly isolated under `/users/{userId}/history/{docId}` where only the matching `request.auth.uid` has read and write permissions.

---

## 🌐 Live Production

The application is deployed on Vercel at:
**[https://ovi-atelier.vercel.app/](https://ovi-atelier.vercel.app/)**

---

© 2026 OVI Atelier. Crafted with precision.
