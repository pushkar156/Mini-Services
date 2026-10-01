// Regenerates the description of a given photo.
'use server';
/**
 * @fileOverview An AI agent that regenerates the description of a photo.
 *
 * - regeneratePhotoDescription - A function that handles the regeneration of photo descriptions.
 * - RegeneratePhotoDescriptionInput - The input type for the regeneratePhotoDescription function.
 * - RegeneratePhotoDescriptionOutput - The return type for the regeneratePhotoDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegeneratePhotoDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to be described, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  apiKey: z.string().optional().describe('Optional user-provided Gemini API key (BYOK).')
});
export type RegeneratePhotoDescriptionInput = z.infer<
  typeof RegeneratePhotoDescriptionInputSchema
>;

const RegeneratePhotoDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A detailed, descriptive paragraph of the photo.'),
});
export type RegeneratePhotoDescriptionOutput = z.infer<
  typeof RegeneratePhotoDescriptionOutputSchema
>;

export async function regeneratePhotoDescription(
  input: RegeneratePhotoDescriptionInput
): Promise<RegeneratePhotoDescriptionOutput> {
  return regeneratePhotoDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regeneratePhotoDescriptionPrompt',
  input: {schema: RegeneratePhotoDescriptionInputSchema},
  output: {schema: RegeneratePhotoDescriptionOutputSchema},
  prompt: `You are an AI art historian and photo analyst. Your task is to generate a new and different description for the provided image.

1.  **If the image is a recognizable work of art (like a famous painting):**
    *   Identify the artwork, the artist, and the approximate date of creation.
    *   Describe the history and context in which it was created.
    *   Explain its symbolism and what it represents.
    *   Provide a rich, detailed description of the visual elements of the piece, offering a fresh perspective from any previous descriptions.

2.  **If the image is a general photograph:**
    *   Provide a new, detailed and captivating paragraph that describes the scene, objects, and overall mood. Focus on different aspects or use a different tone than a previous description might have.

Your response should be a well-written, coherent paragraph.

Photo: {{media url=photoDataUri}}`,
});

const regeneratePhotoDescriptionFlow = ai.defineFlow(
  {
    name: 'regeneratePhotoDescriptionFlow',
    inputSchema: RegeneratePhotoDescriptionInputSchema,
    outputSchema: RegeneratePhotoDescriptionOutputSchema,
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
