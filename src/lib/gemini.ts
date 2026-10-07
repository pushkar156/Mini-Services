/**
 * OVI Atelier - Shared Gemini Engine Utilities
 * 
 * Provides resilient candidate models, multi-key resolution,
 * robust JSON output parsing, and error recovery.
 */

export const CANDIDATE_TEXT_MODELS = Array.from(
  new Set(
    [
      process.env.GEMINI_TEXT_MODEL,
      "gemini-3.5-flash-lite", // Highest availability, zero 503 capacity issues
      "gemini-flash-lite-latest",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-flash-latest",
    ].filter(Boolean) as string[]
  )
);

export const CANDIDATE_TTS_MODELS = Array.from(
  new Set(
    [
      process.env.GEMINI_TTS_MODEL,
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-3.1-flash-tts-preview",
      "gemini-2.5-flash-preview-tts",
    ].filter(Boolean) as string[]
  )
);

export function getConfiguredKeys(clientApiKey?: string, headerApiKey?: string): string[] {
  const candidates = [
    clientApiKey,
    headerApiKey,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY,
  ];

  return Array.from(
    new Set(
      candidates.filter((k): k is string => {
        if (!k || typeof k !== "string") return false;
        const trimmed = k.trim();
        return (
          trimmed.length > 5 &&
          !trimmed.includes("your_first_key_here") &&
          !trimmed.includes("MY_GEMINI_API_KEY") &&
          !trimmed.includes("PLACEHOLDER_API_KEY")
        );
      }).map((k) => k.trim())
    )
  );
}

export function parseJsonResponse<T = any>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();

  // Strip code fences if wrapping
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(text) as T;
  } catch {}

  // Try extracting array
  const arrMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]) as T;
    } catch {}
  }

  // Try extracting object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]) as T;
    } catch {}
  }

  return null;
}

export function cleanMermaidCode(raw: string): string {
  if (!raw) return "";
  let text = raw.trim();
  text = text.replace(/^```[a-zA-Z]*\s*/i, "").replace(/\s*```$/i, "").trim();

  const match = text.match(/(graph\s+(?:TD|TB|LR|RL|BT)[\s\S]*|flowchart\s+(?:TD|TB|LR|RL|BT)[\s\S]*)/i);
  if (match) {
    text = match[1].trim();
  } else if (!text.startsWith("graph") && !text.startsWith("flowchart")) {
    text = "graph TD\n" + text;
  }
  return text;
}
