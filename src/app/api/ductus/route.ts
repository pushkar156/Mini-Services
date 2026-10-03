import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const CANDIDATE_MODELS = Array.from(
  new Set(
    [
      process.env.GEMINI_TEXT_MODEL,
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash",
    ].filter(Boolean) as string[]
  )
);

const PROMPT_TEMPLATE = `
You are an expert systems architect and diagram engineer.
Convert the given topic, architectural description, or specification into a pristine, logically ordered flowchart using Mermaid.js syntax.

STRICT RULES:
1. Output ONLY valid Mermaid code starting with: graph TD or flowchart TD
2. Use concise, informative node labels with meaningful node IDs (e.g. Ingress[API Gateway], Auth[ZK Verifier]).
3. Use modern flowchart styling classes or orthogonal connections.
4. Keep the hierarchy clean and readable top-down or left-to-right.
5. Do NOT include markdown backticks (\`\`\`), no introductory explanations, and no trailing comments. Output ONLY the raw Mermaid code.

TOPIC: {TITLE}
SPECIFICATION / DETAILS: {DETAILS}
`;

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

function cleanMermaidCode(raw: string): string {
  if (!raw) return "";
  let text = raw.trim();
  text = text.replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```$/, "").trim();
  if (!text.startsWith("graph") && !text.startsWith("flowchart")) {
    text = "graph TD\n" + text;
  }
  return text;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, details = "", imageBase64, imageMime = "image/jpeg", apiKey: clientApiKey } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Please provide a title or specification." }, { status: 400 });
    }

    const availableKeys = getConfiguredKeys(clientApiKey);
    if (availableKeys.length === 0) {
      return NextResponse.json(
        { error: "No Gemini API key available. Please configure your API key in the top bar settings." },
        { status: 401 }
      );
    }

    const prompt = PROMPT_TEMPLATE.replace("{TITLE}", title).replace("{DETAILS}", details || "Standard end-to-end architecture flow");

    let lastError: any = null;
    let resultText = "";

    for (const key of availableKeys) {
      const ai = new GoogleGenAI({ apiKey: key });

      for (const model of CANDIDATE_MODELS) {
        try {
          const contents: any[] = [];
          if (imageBase64) {
            contents.push({
              inlineData: {
                data: imageBase64,
                mimeType: imageMime,
              },
            });
          }
          contents.push({ text: prompt });

          const response = await ai.models.generateContent({
            model,
            contents,
          });

          if (response && response.text) {
            resultText = cleanMermaidCode(response.text);
            break;
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (resultText) break;
    }

    if (!resultText) {
      return NextResponse.json(
        { error: lastError?.message || "Failed to generate flowchart from models." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mermaidCode: resultText,
      title,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
