import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CANDIDATE_TEXT_MODELS, getConfiguredKeys } from "@/lib/gemini";

// Enable CORS for Chrome Extension & VS Code extension usage
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export type EnhancementStyle = "coding" | "agentic" | "reasoning" | "concise" | "creative";
export type TargetModel = "general" | "claude" | "gemini" | "gpt4" | "deepseek";
export type OutputFormat = "markdown" | "xml" | "raw";

const STYLE_GUIDELINES: Record<EnhancementStyle, string> = {
  coding: `Focus: High-precision software engineering and architectural specification.
Techniques:
- Explicitly state language, runtime, framework conventions, and type safety constraints.
- Demand production-grade implementation: edge-case handling, input validation, clean separation of concerns, and error recovery.
- Include testing requirements and performance boundaries where relevant.
- Instruct the model to avoid placeholders (e.g. "// TODO", "// implement here") and deliver complete, operable code.`,

  agentic: `Focus: Autonomous execution, task orchestration, and tool calling protocol.
Techniques:
- Frame the persona as a senior autonomous agent with explicit operational boundaries.
- Define a step-by-step execution protocol: inspect -> plan -> execute -> verify.
- Add strict stopping criteria, confirmation gates for high-risk actions, and deterministic recovery procedures if an action fails.
- Detail expected tool calling syntax, structured output constraints, and telemetry reporting.`,

  reasoning: `Focus: Deep analytical chain-of-thought and rigorous cognitive verification.
Techniques:
- Require the model to work through the solution step-by-step before concluding.
- Mandate self-critique: challenge intermediate assumptions, test counter-hypotheses, and verify boundary conditions.
- Specify clear cognitive stages (Deconstruct Problem -> Analyze Dependencies -> Formulate Strategy -> Verify Soundness -> Output Solution).`,

  concise: `Focus: Maximum information density with zero token waste.
Techniques:
- Eradicate conversational pleasantries, introductory chatter, and repetitive restatements.
- Use dense, telegraphic bullet points, direct imperative verbs, and compact structural rules.
- Maintain high precision while cutting fluff, achieving maximum prompt economy.`,

  creative: `Focus: Atmospheric richness, voice, narrative nuance, and sensory depth.
Techniques:
- Define evocative tone, cadence, perspective, and aesthetic worldbuilding parameters.
- Provide tonal guardrails, vocabulary constraints, and structural pacing instructions.
- Encourage unique stylistic analogies and vivid idiosyncratic details.`
};

const MODEL_SPECIFICS: Record<TargetModel, string> = {
  general: "Format with clear markdown headings, concise bullet points, and code blocks.",
  claude: "Heavily utilize Claude-optimized semantic XML tags (e.g. <context>, <instructions>, <constraints>, <examples>, <output_format>) for supreme steerability and prompt caching synergy.",
  gemini: "Structure with crisp Markdown headers, bold imperative directives, and explicit schema definitions.",
  gpt4: "Structure with markdown headers, role definition, task breakdown, and explicit few-shot or delimiter markers (### Instructions, ### Constraints).",
  deepseek: "Structure with structured cognitive directives, rigorous step verification, and mathematical/logical constraints."
};

function estimateTokens(text: string): number {
  if (!text) return 0;
  // Approximate rule of thumb for English text: ~4 chars per token or ~0.75 words per token
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words * 1.33));
}

function cleanResponse(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.trim();
  // Strip opening/closing json fences if returned
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/i, "").replace(/\s*```$/i, "");
  }
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      prompt,
      style = "coding",
      targetModel = "general",
      outputFormat = "markdown",
      includeNegative = true,
      apiKey: clientApiKey,
    } = body;

    const headerApiKey = req.headers.get("x-gemini-api-key") || undefined;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a prompt to enhance." },
        { status: 400, headers: corsHeaders }
      );
    }

    const availableKeys = getConfiguredKeys(clientApiKey, headerApiKey);
    if (availableKeys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No Gemini API key configured. Please set your key in Settings or pass x-gemini-api-key header.",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const normalizedStyle: EnhancementStyle = STYLE_GUIDELINES[style as EnhancementStyle]
      ? (style as EnhancementStyle)
      : "coding";

    const normalizedModel: TargetModel = MODEL_SPECIFICS[targetModel as TargetModel]
      ? (targetModel as TargetModel)
      : "general";

    const systemPrompt = `You are an elite principal prompt engineer and AI architect specializing in optimizing prompts for peak LLM steerability, zero ambiguity, and deterministic results.

Your task is to transform the user's raw, underspecified prompt into a master-grade, highly effective production prompt.

TARGET STYLE: ${normalizedStyle.toUpperCase()}
${STYLE_GUIDELINES[normalizedStyle]}

TARGET MODEL OPTIMIZATION: ${normalizedModel.toUpperCase()}
${MODEL_SPECIFICS[normalizedModel]}

FORMATTING RULE:
Output Format requested: ${outputFormat.toUpperCase()}
${outputFormat === "xml" ? "Use semantic XML tags (<context>, <instructions>, <guidelines>, <output_format>)." : ""}
${includeNegative ? "Include a dedicated section for 'Negative Constraints / What NOT To Do' to prevent common failure modes." : ""}

CRITICAL RULES:
1. Preserve the user's core intent 100% while vastly elevating clarity, depth, rigor, and edge-case coverage.
2. Do NOT simply write an answer to the prompt. You are ENHANCING the prompt itself so another AI can execute it with maximum precision.
3. Respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "Short descriptive title for this prompt (3-5 words)",
  "enhancedPrompt": "The full enhanced prompt ready for immediate use",
  "explanation": "2-3 concise bullet points summarizing key fortifying additions made (e.g. added schema constraints, edge cases, recovery protocols)",
  "techniquesUsed": ["Technique 1", "Technique 2", "Technique 3"]
}
Do NOT include any markdown code fences (like \`\`\`json) outside the JSON. Return raw parseable JSON only.

RAW USER PROMPT TO ENHANCE:
"""
${prompt.trim()}
"""`;

    let lastError: any = null;
    let parsedResult: any = null;
    let successfulModel = "";

    // Failover across keys and candidate models
    for (const key of availableKeys) {
      const ai = new GoogleGenAI({ apiKey: key });

      for (const model of CANDIDATE_TEXT_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: systemPrompt,
            config: {
              temperature: 0.3, // Low temperature for crisp, deterministic prompt engineering
            },
          });

          if (response && response.text) {
            const cleaned = cleanResponse(response.text);
            try {
              parsedResult = JSON.parse(cleaned);
              if (parsedResult && parsedResult.enhancedPrompt) {
                successfulModel = model;
                break;
              }
            } catch (jsonErr) {
              // If JSON parsing failed, use the text directly
              parsedResult = {
                title: "Enhanced Prompt",
                enhancedPrompt: cleaned,
                explanation: "Elevated structure, clarity, and edge-case boundaries.",
                techniquesUsed: ["Context Framing", "Constraint Enforcement"],
              };
              successfulModel = model;
              break;
            }
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (parsedResult) break;
    }

    if (!parsedResult) {
      return NextResponse.json(
        {
          success: false,
          error: lastError?.message || "Failed to generate enhanced prompt across all models.",
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const originalTokens = estimateTokens(prompt);
    const enhancedTokens = estimateTokens(parsedResult.enhancedPrompt);
    const expansionRatio = originalTokens > 0
      ? `${Math.round(((enhancedTokens - originalTokens) / originalTokens) * 100)}%`
      : "100%";

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        title: parsedResult.title || "Enhanced Prompt",
        enhancedPrompt: parsedResult.enhancedPrompt,
        explanation: parsedResult.explanation || "Enhanced with structured instructions and constraints.",
        techniquesUsed: parsedResult.techniquesUsed || [],
        metrics: {
          originalTokens,
          enhancedTokens,
          expansionRatio: expansionRatio.startsWith("-") ? expansionRatio : `+${expansionRatio}`,
          style: normalizedStyle,
          targetModel: normalizedModel,
          modelUsed: successfulModel,
          latencyMs,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}

