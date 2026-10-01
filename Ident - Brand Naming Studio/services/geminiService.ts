import { GoogleGenAI, Type } from "@google/genai";
import { BrandInput, BrandName, BrandResult, GroundingSource } from "../types";

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

export const generateBrandNames = async (input: BrandInput): Promise<BrandResult> => {
  const provider = getActiveProvider();

  // 1. Ollama Provider Branch
  if (provider === "ollama" && typeof window !== "undefined" && (window as any).OllamaClient) {
    try {
      const prompt = `You are a world-class branding expert.
Product Description: ${input.description}
Industry: ${input.industry}
Desired Tone: ${input.tone}

Generate 10 unique, memorable, and available brand names.
Respond ONLY with a JSON array in the exact format:
[
  {"name": "BrandOne", "rationale": "Short explanation under 15 words."},
  {"name": "BrandTwo", "rationale": "Short explanation under 15 words."}
]`;

      const res = await (window as any).OllamaClient.generate({
        prompt,
        format: "json"
      });

      const text = (res.text || "").trim();
      const parsed = JSON.parse(text);
      const names: BrandName[] = Array.isArray(parsed) ? parsed : (parsed.names || []);
      return {
        names,
        sources: []
      };
    } catch (ollamaErr: any) {
      console.error("Ollama branding error:", ollamaErr);
      throw new Error(ollamaErr.message || "Failed to generate brand names with local Ollama.");
    }
  }

  // 2. Gemini Provider Branch (BYOK)
  const apiKey = getActiveGeminiKey();
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    if (typeof window !== "undefined" && (window as any).ApiKeyManager) {
      (window as any).ApiKeyManager.openSettings("gemini");
    }
    throw new Error("No Gemini API key configured. Please set your API key in the top navigation bar or switch to Ollama in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const textPart = {
    text: `You are a world-class branding expert and naming specialist.
    Product Description: ${input.description}
    Industry: ${input.industry}
    Desired Tone: ${input.tone}
    
    Task: 
    1. Generate 10 unique, memorable, and suitable brand names.
    2. USE GOOGLE SEARCH to verify that these names are not already prominent existing brands, websites, or major companies in the ${input.industry} space.
    3. Only provide names that appear to be relatively unique or available based on your search.
    
    Criteria:
    1. Names should be easy to pronounce and spell.
    2. Names should evoke the requested tone: ${input.tone}.
    3. Provide a brief rationale (max 15 words) for each name explaining its meaning or psychological impact.
    4. Ensure names are relevant to the ${input.industry} industry.`
  };

  const parts: any[] = [textPart];
  
  if (input.visualContext) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: input.visualContext.split(',')[1]
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'The creative and verified brand name.',
              },
              rationale: {
                type: Type.STRING,
                description: 'Short explanation of why this name works and its perceived availability.',
              },
            },
            propertyOrdering: ["name", "rationale"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from the AI model.");
    }
    
    const jsonStr = text.trim();
    const names: BrandName[] = JSON.parse(jsonStr);
    
    // Extract grounding sources from Search tool
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return {
      names,
      sources: sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i)
    };
  } catch (error: any) {
    console.error("Failed to parse Gemini response:", error);
    if (error.message && (error.message.includes("key") || error.status === 401)) {
      if (typeof window !== "undefined" && (window as any).ApiKeyManager) {
        (window as any).ApiKeyManager.openSettings("gemini");
      }
    }
    throw new Error(error.message || "Failed to generate brand names. Please try again.");
  }
};
