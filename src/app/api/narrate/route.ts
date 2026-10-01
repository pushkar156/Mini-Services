import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const CANDIDATE_MODELS = [
  process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

function getConfiguredKeys(clientApiKey?: string): string[] {
  const candidates = [
    clientApiKey,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY,
  ];

  return candidates.filter((k): k is string => {
    if (!k || typeof k !== "string") return false;
    const trimmed = k.trim();
    return trimmed.length > 5 && !trimmed.includes("your_first_key_here") && !trimmed.includes("MY_GEMINI_API_KEY");
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      imageMime = "image/jpeg",
      depth = "editorial",
      apiKey: clientApiKey,
    } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "Please upload an image to analyze." }, { status: 400 });
    }

    const availableKeys = getConfiguredKeys(clientApiKey);
    if (availableKeys.length === 0) {
      return NextResponse.json(
        { error: "No Gemini API key available. Please configure your API key in the top bar settings." },
        { status: 401 }
      );
    }

    const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

    const depthInstruction =
      depth === "haiku"
        ? "Format the prose as a profound 3-line poetic haiku or aphoristic verse."
        : depth === "cinematic"
        ? "Format the prose as a 35mm filmic monologue, focusing on tactile silence, ambient shadows, and personal memory."
        : "Format the prose as an elite museum curatorial gallery label with deep architectural observation, lighting nuances, and aesthetic philosophy.";

    const prompt = `You are an elite art curator, film photographer, and literary gallery author.
Analyze the provided visual plate with utmost aesthetic precision.
Narrative Depth Mode: ${depth.toUpperCase()}
${depthInstruction}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "Evocative Title (3-5 words)",
  "plateNumber": "PLATE N° 04 // THE SILENT ARCHITECT",
  "dateLocation": "Location / Era, e.g. London Southbank, 1976 / Reconstructed 2026",
  "hook": "A single compelling italicized opening observation under 20 words.",
  "prose": "Two eloquent, poetic curatorial paragraphs analyzing the light, shadow, texture, and emotional resonance.",
  "metrology": {
    "camera": "Leica M11 • 35mm f/1.4 Summilux • ISO 200 • 1/500s",
    "dynamicRange": "14.6 EV [Zone III-VIII]",
    "emulsion": "Silver Bromide / Fine Grain",
    "focalPlane": "Hyperfocal @ 12.8m"
  }
}
Do NOT include markdown backticks (\`\`\`) or any commentary. Return ONLY the raw JSON.`;

    let lastError: any = null;
    let narrativeResult: any = null;

    for (const key of availableKeys) {
      const ai = new GoogleGenAI({ apiKey: key });

      for (const model of CANDIDATE_MODELS) {
        try {
          const contents = [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: imageMime,
              },
            },
            { text: prompt },
          ];

          const response = await ai.models.generateContent({
            model,
            contents,
          });

          if (response && response.text) {
            let cleaned = response.text.trim();
            if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
              cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
            }
            narrativeResult = JSON.parse(cleaned);
            if (narrativeResult && narrativeResult.title) {
              break;
            }
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (narrativeResult) break;
    }

    if (!narrativeResult) {
      return NextResponse.json(
        { error: lastError?.message || "Failed to analyze photograph with vision model." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...narrativeResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate photo narrative." },
      { status: 500 }
    );
  }
}
