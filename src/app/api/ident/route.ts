import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CANDIDATE_TEXT_MODELS, getConfiguredKeys, parseJsonResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      keywords,
      archetype = "Minimalist Hardware",
      constraint = "Latin root & Phonemic Balance",
      apiKey: clientApiKey,
    } = body;

    const headerApiKey = req.headers.get("x-gemini-api-key") || undefined;

    if (!keywords || typeof keywords !== "string" || !keywords.trim()) {
      return NextResponse.json({ error: "Please enter industry essence or keywords." }, { status: 400 });
    }

    const availableKeys = getConfiguredKeys(clientApiKey, headerApiKey);
    if (availableKeys.length === 0) {
      return NextResponse.json(
        { error: "No Gemini API key available. Please configure your API key in the top bar settings." },
        { status: 401 }
      );
    }

    const systemPrompt = `You are an elite haute-couture naming atelier and phonosemantic brand strategist.
You design bespoke, prestigious brand names for luxury tech, tactile computing, and architectural studios.

Keywords: ${keywords}
Target Archetype: ${archetype}
Linguistic Constraint: ${constraint}

Generate 6 extraordinary brand identity vectors.
Respond ONLY with a valid JSON array of objects with the exact schema:
[
  {
    "name": "KINETIC",
    "phonetic": "/ˈkaɪ.nɛt.ɪk/",
    "category": "GREEK / DYNAMIC",
    "score": 98.2,
    "rationale": "Crisp velar plosives (/k/) bracketed around fluid vowels invoke rigorous mechanical action and precision calibrated response.",
    "domains": {
      "com": false,
      "io": true,
      "ai": true
    }
  }
]
Do NOT include markdown backticks (\`\`\`) or any conversational text. Return ONLY the raw JSON array.`;

    let lastError: any = null;
    let brandNames: any[] = [];

    for (const key of availableKeys) {
      const ai = new GoogleGenAI({ apiKey: key });

      for (const model of CANDIDATE_TEXT_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: systemPrompt,
          });

          if (response && response.text) {
            const parsed = parseJsonResponse<any[]>(response.text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              brandNames = parsed;
              break;
            }
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (brandNames.length > 0) break;
    }

    if (brandNames.length === 0) {
      return NextResponse.json(
        { error: lastError?.message || "Failed to synthesize brand identities." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      names: brandNames,
      keywords,
      archetype,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process brand synthesis." },
      { status: 500 }
    );
  }
}
