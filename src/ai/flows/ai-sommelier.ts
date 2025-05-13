
/**
 * @fileOverview AI-powered food recommendation flow that considers user preferences and the restaurant's menu.
 *
 * - aiSommelier - A function that provides dish recommendations.
 * - AISommelierInput - The input type for the aiSommelier function.
 * - AISommelierOutput - The return type for the aiSommelier function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISommelierInputSchema = z.object({
  tastePreferences: z
    .string()
    .describe("A description of the user's taste preferences, including preferred flavors, ingredients, and cuisine types."),
  menuInformation: z
    .string()
    .describe('Detailed information about the restaurant menu, including dish names and descriptions. This information should be used to ensure recommendations are available at the restaurant.'),
});
export type AISommelierInput = z.infer<typeof AISommelierInputSchema>;

const AISommelierOutputSchema = z.object({
  dishRecommendations: z
    .string()
    .describe('A list of dish recommendations that match the user provided taste preferences and are available on the restaurant menu.'),
});
export type AISommelierOutput = z.infer<typeof AISommelierOutputSchema>;

export async function aiSommelier(input: AISommelierInput): Promise<AISommelierOutput> {
  return aiSommelierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSommelierPrompt',
  input: {schema: AISommelierInputSchema},
  output: {schema: AISommelierOutputSchema},
  prompt: `You are an AI sommelier that provides dish recommendations based on user taste preferences and the provided restaurant menu.

  Restaurant Menu:
  {{{menuInformation}}}

  User's Taste Preferences:
  {{{tastePreferences}}}

  Based on the restaurant menu and the user's taste preferences, what dishes would you recommend? Ensure your recommendations are directly from the provided menu.`,
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

