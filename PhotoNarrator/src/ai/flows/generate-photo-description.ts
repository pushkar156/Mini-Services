'use server';

/**
 * @fileOverview A flow that generates a descriptive paragraph about a photo using AI.
 *
 * - generatePhotoDescription - A function that handles the photo description generation process.
 * - GeneratePhotoDescriptionInput - The input type for the generatePhotoDescription function.
 * - GeneratePhotoDescriptionOutput - The return type for the generatePhotoDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePhotoDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to generate a description for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
  apiKey: z.string().optional().describe('Optional user-provided Gemini API key (BYOK).')
});
export type GeneratePhotoDescriptionInput = z.infer<typeof GeneratePhotoDescriptionInputSchema>;

const GeneratePhotoDescriptionOutputSchema = z.object({
  description: z.string().describe('A descriptive paragraph about the photo.'),
});
export type GeneratePhotoDescriptionOutput = z.infer<typeof GeneratePhotoDescriptionOutputSchema>;

export async function generatePhotoDescription(input: GeneratePhotoDescriptionInput): Promise<GeneratePhotoDescriptionOutput> {
  return generatePhotoDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhotoDescriptionPrompt',
  input: {schema: GeneratePhotoDescriptionInputSchema},
  output: {schema: GeneratePhotoDescriptionOutputSchema},
  prompt: `You are an AI art historian and photo analyst.

Your task is to analyze the provided image.

1.  **If the image is a recognizable work of art (like a famous painting):**
    *   Identify the artwork, the artist, and the approximate date of creation.
    *   Describe the history and context in which it was created.
    *   Explain its symbolism and what it represents.
    *   Provide a rich, detailed description of the visual elements of the piece.

2.  **If the image is a general photograph:**
    *   Provide a detailed and captivating paragraph that describes the scene, objects, and overall mood.

Your response should be a well-written, coherent paragraph.

Photo: {{media url=photoDataUri}}
  `
});

const generatePhotoDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePhotoDescriptionFlow',
    inputSchema: GeneratePhotoDescriptionInputSchema,
    outputSchema: GeneratePhotoDescriptionOutputSchema,
  },
  async input => {
    if (input.apiKey && input.apiKey.trim()) {
      process.env.GEMINI_API_KEY = input.apiKey.trim();
      process.env.GOOGLE_GENAI_API_KEY = input.apiKey.trim();
      process.env.GOOGLE_API_KEY = input.apiKey.trim();
    }
    const {output} = await prompt(input);
    return output!;
  }
);
