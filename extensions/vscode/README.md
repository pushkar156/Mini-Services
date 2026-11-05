# OVI — Prompt Enhancer (VS Code & Antigravity Extension)

Elevate, fortify, and optimize your prompts directly inside **VS Code**, **Antigravity**, **Cursor**, or **VSCodium**.

---

## ⚡ Key Capabilities

- **Command Palette & Shortcut:** Highlight any prompt, press `Ctrl+Alt+E` (or `Cmd+Alt+E` on macOS), and pick your archetype.
- **5 Archetypes:**
  - `$(code) Coding & Technical Specs` — architecture patterns, edge cases, type safety, error boundaries.
  - `$(hubot) Autonomous Agent Protocol` — tool boundaries, 4-step execution flow, verification criteria.
  - `$(symbol-structure) Chain-of-Thought (Reasoning)` — cognitive scratchpads, step-by-step verification.
  - `$(zap) Concise & Dense` — token-efficient, zero fluff, direct imperatives.
  - `$(paintcan) Creative Nuance` — atmospheric tone, worldbuilding, and narrative depth.
- **Action Modes:**
  - `replace` (default): seamlessly replaces selected text in-place with full undo history (`Ctrl+Z`).
  - `insertBelow`: keeps original draft and appends the fortified prompt below.
  - `diffView`: opens a clean side-by-side VS Code diff comparison view.
  - `clipboard`: copies directly to your clipboard.

---

## 🚀 How to Run & Test in VS Code / Antigravity

### Method A: Run Directly in Extension Development Host (Immediate)
1. Open this folder in VS Code / Antigravity:
   ```
   d:\Pushkar\Pushkar\Personal Projects\Mini Servieces\extensions\vscode
   ```
2. Press **`F5`** (or go to **Run and Debug** → click **Run Extension**).
3. A new Extension Development window will open with OVI Prompt Enhancer loaded!
4. Highlight any text, right-click → **OVI: Enhance Prompt** or press `Ctrl+Alt+E`.

### Method B: Install Locally as an Extension (`.vsix`)
If you have `@vscode/vsce` installed:
```bash
cd "extensions/vscode"
npx @vscode/vsce package
# Then in VS Code: Extensions view (...) -> "Install from VSIX..."
```

---

## ⚙️ Configuration Settings

Open VS Code Settings (`Ctrl+,`) and search for `ovi.promptEnhancer`:
- `ovi.promptEnhancer.apiUrl`: Default `http://localhost:3000/api/enhance` (or your deployed Vercel URL).
- `ovi.promptEnhancer.targetModel`: `claude` (default), `gemini`, `gpt4`, `deepseek`, or `general`.
- `ovi.promptEnhancer.actionOnEnhance`: `replace`, `insertBelow`, `diffView`, or `clipboard`.
- `ovi.promptEnhancer.apiKey`: Optional custom Gemini key override.

