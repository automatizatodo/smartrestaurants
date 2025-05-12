
/**
 * @fileOverview AI-powered food recommendation flow.
 *
 * - aiSommelier - A function that provides dish recommendations based on user preferences.
 * - AISommelierInput - The input type for the aiSommelier function.
 * - AISommelierOutput - The return type for the aiSommelier function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISommelierInputSchema = z.object({
  tastePreferences: z
    .string()
    .describe("A description of the user's taste preferences, including preferred flavors, ingredients, and cuisine types."),
});
export type AISommelierInput = z.infer<typeof AISommelierInputSchema>;

const AISommelierOutputSchema = z.object({
  dishRecommendations: z
    .string()
    .describe('A list of dish recommendations that match the user provided taste preferences.'),
});
export type AISommelierOutput = z.infer<typeof AISommelierOutputSchema>;

export async function aiSommelier(input: AISommelierInput): Promise<AISommelierOutput> {
  return aiSommelierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSommelierPrompt',
  input: {schema: AISommelierInputSchema},
  output: {schema: AISommelierOutputSchema},
  prompt: `You are an AI sommelier that provides dish recommendations based on user taste preferences.

  Taste Preferences: {{{tastePreferences}}}

  Based on these preferences, what dishes would you recommend?`,
});

const aiSommelierFlow = ai.defineFlow(
  {
    name: 'aiSommelierFlow',
    inputSchema: AISommelierInputSchema,
    outputSchema: AISommelierOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
