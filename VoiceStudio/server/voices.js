/**
 * Gemini TTS Voice Configuration Library
 * 
 * Centralized registry of Gemini TTS prebuilt voices.
 * These voices are natively supported by the Google Gemini TTS models
 * (such as gemini-3.8-flash-tts and gemini-3.8-flash-lite-tts).
 */

const GEMINI_VOICES = [
  {
    id: "Kore",
    name: "Kore",
    gender: "Female",
    style: "Warm / Professional",
    description: "Clear, balanced, and articulate with an engaging, pleasant presence.",
    language: "English (Global / US)",
    recommended: ["Narration", "Educational", "General", "Audiobook"]
  },
  {
    id: "Puck",
    name: "Puck",
    gender: "Male",
    style: "Energetic / Conversational",
    description: "Youthful, vibrant, and enthusiastic tone ideal for modern content.",
    language: "English (Global / US)",
    recommended: ["Podcast", "Advertisement", "Conversational", "Character"]
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "Male",
    style: "Deep / Narration",
    description: "Rich, resonant, deep voice with high authority and cinematic weight.",
    language: "English (Global / US)",
    recommended: ["Audiobook", "Storytelling", "News", "Narration"]
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Male",
    style: "Strong / Expressive",
    description: "Commanding, expressive, and confident with dramatic impact.",
    language: "English (Global / US)",
    recommended: ["Character", "Storytelling", "Advertisement"]
  },
  {
    id: "Aoede",
    name: "Aoede",
    gender: "Female",
    style: "Warm / Friendly",
    description: "Gentle, compassionate, warm, and inviting tone.",
    language: "English (Global / US)",
    recommended: ["Storytelling", "Conversational", "Educational"]
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "Female",
    style: "Bright / Versatile",
    description: "Crisp, lively, and versatile modern female voice.",
    language: "English (Global / US)",
    recommended: ["News", "Podcast", "General"]
  },
  {
    id: "Leda",
    name: "Leda",
    gender: "Female",
    style: "Calm / Articulate",
    description: "Soothing, measured, and highly articulate delivery.",
    language: "English (Global / US)",
    recommended: ["Educational", "Audiobook", "Narration"]
  },
  {
    id: "Orus",
    name: "Orus",
    gender: "Male",
    style: "Clear / Authoritative",
    description: "Measured, clear, and journalistic tone.",
    language: "English (Global / US)",
    recommended: ["News", "Educational", "Professional"]
  }
];

/**
 * Returns all available Gemini TTS voices with safe metadata.
 * No credentials or internal configurations are exposed.
 */
export function getAvailableVoices() {
  return GEMINI_VOICES;
}

/**
 * Finds a specific voice by name, or returns the default voice (Kore).
 */
export function getVoiceByName(name) {
  if (!name) return GEMINI_VOICES[0];
  const found = GEMINI_VOICES.find(v => v.name.toLowerCase() === name.toLowerCase());
  return found || GEMINI_VOICES[0];
}
