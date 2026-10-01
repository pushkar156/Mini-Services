import { GoogleGenAI } from "@google/genai";

const PROMPT_TEMPLATE = `
You are an expert diagram designer and technical educator.

Your task is to convert user-provided topics, details, and optional images into clear, logically ordered flowcharts using Mermaid syntax.

STRICT RULES:
1. Output ONLY valid Mermaid code.
2. Start every response with: flowchart TD
3. Use short, clear labels for nodes.
4. If an image is provided, incorporate its subject matter into the flowchart.
5. Use decision nodes only when a logical branch exists.
6. Do NOT add explanations, markdown, or comments.
7. Do NOT wrap the output in code fences.
8. Ensure the flow is top-down and easy to understand.
9. Do NOT hallucinate steps. Only include logically necessary steps.
10. If the topic is abstract, convert it into a conceptual process flow.

The output must be directly renderable by Mermaid without errors.

---
TITLE: {TITLE}
DETAILS: {DETAILS}
---
`;

/**
 * Get active API key dynamically from OVI Hub storage or env
 */
function getActiveGeminiKey(): string {
  if (typeof window !== "undefined") {
    const hubKey = window.localStorage.getItem("OVI_HUB_GEMINI_KEY");
    if (hubKey && hubKey.trim()) return hubKey.trim();
    const legacyKey = window.localStorage.getItem("GEMINI_API_KEY");
    if (legacyKey && legacyKey.trim()) return legacyKey.trim();
  }
  return (process.env.API_KEY || "").trim();
}

/**
 * Check active AI provider ('gemini' or 'ollama')
 */
function getActiveProvider(): string {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("OVI_HUB_ACTIVE_PROVIDER") || "gemini";
  }
  return "gemini";
}

export const generateMermaidCode = async (
  title: string,
  details: string,
  image?: { inlineData: { data: string; mimeType: string } }
): Promise<string> => {
  const prompt = PROMPT_TEMPLATE
    .replace('{TITLE}', title)
    .replace('{DETAILS}', details || 'N/A');

  const provider = getActiveProvider();

  // 1. Ollama Provider Branch
  if (provider === "ollama" && typeof window !== "undefined" && (window as any).OllamaClient) {
    try {
      const ollamaClient = (window as any).OllamaClient;
      const res = await ollamaClient.generate({
        prompt: prompt + "\n\nRemember: output ONLY the raw Mermaid diagram starting with 'flowchart TD' with NO code blocks or markdown backticks."
      });
      let text = (res.text || "").trim();
      text = text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();
      if (!text.startsWith("flowchart")) {
        text = "flowchart TD\n" + text;
      }
      return text;
    } catch (ollamaErr: any) {
      console.error("Ollama flowchart error:", ollamaErr);
      throw new Error(ollamaErr.message || "Failed to communicate with local Ollama.");
    }
  }

  // 2. Gemini Provider Branch (BYOK)
  const apiKey = getActiveGeminiKey();
  if (!apiKey) {
    if (typeof window !== "undefined" && (window as any).ApiKeyManager) {
      (window as any).ApiKeyManager.openSettings("gemini");
    }
    throw new Error("No Gemini API key configured. Please set your API key in the top navigation bar or switch to Ollama.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [{ text: prompt }];
    if (image) {
      parts.unshift(image);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    if (response.text) {
      let cleaned = response.text.trim();
      cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();
      return cleaned;
    } else {
      throw new Error("Received an empty response from the API.");
    }

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && (error.message.includes("key") || error.status === 401)) {
      if (typeof window !== "undefined" && (window as any).ApiKeyManager) {
        (window as any).ApiKeyManager.openSettings("gemini");
      }
    }
    throw new Error(error.message || "Failed to communicate with the Gemini API.");
  }
};
