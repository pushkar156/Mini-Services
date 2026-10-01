
export interface GroundingSource {
  uri: string;
  title: string;
}

export interface BrandName {
  name: string;
  rationale: string;
}

export interface BrandResult {
  names: BrandName[];
  sources: GroundingSource[];
}

export interface BrandInput {
  description: string;
  industry: string;
  tone: string;
  visualContext?: string; // base64 image data
}

export interface HistoryItem {
  id: string;
  result: BrandResult;
  input: BrandInput;
  timestamp: number;
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  PLAYFUL = 'Playful',
  MODERN = 'Modern',
  LUXURY = 'Luxury',
  MINIMALIST = 'Minimalist',
  AVANT_GARDE = 'Avant-Garde'
}
