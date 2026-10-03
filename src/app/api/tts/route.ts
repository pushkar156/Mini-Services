import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Mp3Encoder } from "@breezystack/lamejs";

function convertWavToMp3(wavBuffer: any, bitrate = 128): Buffer | null {
  try {
    if (!wavBuffer || wavBuffer.length < 44) return null;
    let dataOffset = 44;
    const dataIdx = wavBuffer.indexOf(Buffer.from("data"));
    if (dataIdx !== -1 && dataIdx + 8 <= wavBuffer.length) {
      dataOffset = dataIdx + 8;
    }
    const pcmData = wavBuffer.subarray(dataOffset);
    const numSamples = Math.floor(pcmData.length / 2);
    const samples = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      samples[i] = pcmData.readInt16LE(i * 2);
    }
    const encoder = new Mp3Encoder(1, 24000, bitrate);
    const chunks: Buffer[] = [];
    const blockSize = 1152;
    for (let i = 0; i < samples.length; i += blockSize) {
      const block = samples.subarray(i, i + blockSize);
      const mp3Buf = encoder.encodeBuffer(block);
      if (mp3Buf.length > 0) chunks.push(Buffer.from(mp3Buf));
    }
    const endBuf = encoder.flush();
    if (endBuf.length > 0) chunks.push(Buffer.from(endBuf));
    return Buffer.concat(chunks);
  } catch (err) {
    console.error("MP3 encoding error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "Puck", dialogue, format = "mp3", speed = 1.0 } = body;
    const clientApiKey = req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY || "";

    if (!clientApiKey) {
      return NextResponse.json(
        { success: false, error: "Please configure your Gemini API Key in Settings (top right)." },
        { status: 401 }
      );
    }

    if (!dialogue && (!text || typeof text !== "string" || text.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "Please enter text to synthesize." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: clientApiKey.trim() });
    const isMultiSpeaker = Array.isArray(dialogue) && dialogue.length > 1;

    let speechConfig: any;
    if (isMultiSpeaker) {
      const turns = dialogue.map((line: any) => ({
        text: line.text,
        speaker: line.speaker || line.voice || "Puck",
      }));
      speechConfig = {
        multiSpeakerConfig: {
          turns,
        },
      };
    } else {
      speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      };
    }

    const promptText = isMultiSpeaker
      ? dialogue.map((d: any) => `${d.speaker || d.voice || "Speaker"}: ${d.text}`).join("\n")
      : text.trim();

    const CANDIDATE_TTS_MODELS = Array.from(
      new Set(
        [
          process.env.GEMINI_TTS_MODEL,
          "gemini-3.8-flash-tts",
          "gemini-3.8-flash-lite-tts",
          "gemini-2.5-flash",
          "gemini-3.8-flash",
        ].filter(Boolean) as string[]
      )
    );

    let response: any = null;
    let ttsError: any = null;

    for (const model of CANDIDATE_TTS_MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: promptText,
          config: {
            responseModalities: ["AUDIO"],
            speechConfig,
          },
        });

        if (response?.candidates?.[0]?.content?.parts) {
          break;
        }
      } catch (err: any) {
        ttsError = err;
      }
    }

    const candidates = response?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error(ttsError?.message || "No speech candidates returned by Gemini TTS.");
    }

    const parts = candidates[0].content?.parts;
    let base64Audio = "";
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
          base64Audio = part.inlineData.data || "";
          break;
        }
      }
    }

    if (!base64Audio) {
      throw new Error("Gemini response did not contain inline audio data.");
    }

    const rawWavBuffer: Buffer = Buffer.from(base64Audio, "base64");
    let finalAudioBuffer: Buffer = rawWavBuffer;
    let outFormat = "wav";

    if (format === "mp3") {
      const mp3 = convertWavToMp3(rawWavBuffer);
      if (mp3) {
        finalAudioBuffer = mp3;
        outFormat = "mp3";
      }
    }

    return new NextResponse(new Uint8Array(finalAudioBuffer), {
      status: 200,
      headers: {
        "Content-Type": outFormat === "mp3" ? "audio/mp3" : "audio/wav",
        "Content-Length": finalAudioBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("[TTS API Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Voice generation failed." },
      { status: 503 }
    );
  }
}
