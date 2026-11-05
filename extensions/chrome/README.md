# OVI — Prompt Enhancer (Chrome Extension)

A minimalist, high-agency browser extension that fortifies and optimizes prompts directly inside **ChatGPT**, **Claude**, **Gemini**, **Cursor**, **DeepSeek**, and any web textarea.

---

## ⚡ Key Features

- **In-Place Enhancement:** Highlight any prompt in any text area or input, press `Alt+Shift+E` (or right-click → *OVI: Enhance Prompt*), and watch it elevate into a master-grade prompt in-place!
- **Sleek Popup Workshop:** Click the toolbar icon to draft, test, and fortify prompts with target model formatting.
- **5 Archetypes:**
  - `Coding & Specs` — architecture, edge cases, strict type safety, zero placeholders.
  - `Autonomous Agent` — tool boundaries, 4-step execution protocols, stopping conditions.
  - `Chain-of-Thought` — cognitive scratchpads, step-by-step verification.
  - `Concise & Direct` — high-density, token-efficient system prompts.
  - `Creative Nuance` — atmospheric tone, voice, and narrative depth.
- **Zero CORS / CSP Boundaries:** Communicates through background service workers to ensure zero cross-origin or content-security-policy blocks.
- **Customizable Endpoint:** Points by default to `http://localhost:3000/api/enhance` or your deployed Vercel URL, with optional direct Gemini BYOK.

---

## 📦 How to Install (Load Unpacked)

1. Open Google Chrome (or Brave / Edge / Arc).
2. Navigate to `chrome://extensions/` in the URL bar.
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left.
5. Select this folder:
   ```
   d:\Pushkar\Pushkar\Personal Projects\Mini Servieces\extensions\chrome
   ```
6. The **OVI — Prompt Enhancer** icon will appear in your extensions toolbar! Pin it for quick access.

---

## 🎯 Keyboard Shortcuts & Usage

- **Default Shortcut:** `Alt+Shift+E` (replaces selected prompt with enhanced version in-place).
- **Context Menu:** Highlight text anywhere, right-click, and select `OVI: Enhance Prompt` → choose your desired archetype.
- **Configure Custom URL:** Click the extension icon → click the gear icon in the top right → set your Vercel or local URL.

