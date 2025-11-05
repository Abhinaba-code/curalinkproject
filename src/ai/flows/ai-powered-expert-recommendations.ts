
'use server';

/**
 * @fileOverview AI-powered expert recommendations flow for researchers.
 *
 * - getExpertRecommendations - A function that recommends health experts based on shared research interests.
 * - ExpertRecommendationsInput - The input type for the getExpertRecommendations function.
 * - ExpertRecommendationsOutput - The return type for the getExpertRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ExpertRecommendationsInputSchema = z.object({
  researchInterests: z
    .string()
    .describe('The research interests of the researcher.'),
  numberOfRecommendations: z
    .number()
    .default(5)
    .describe('The number of expert recommendations to return.'),
});
export type ExpertRecommendationsInput = z.infer<typeof ExpertRecommendationsInputSchema>;

const ExpertRecommendationsOutputSchema = z.object({
  expertRecommendations: z
    .array(z.string())
    .describe('A list of recommended health experts.'),
});
export type ExpertRecommendationsOutput = z.infer<typeof ExpertRecommendationsOutputSchema>;

export async function getExpertRecommendations(
  input: ExpertRecommendationsInput
): Promise<ExpertRecommendationsOutput> {
  return expertRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expertRecommendationsPrompt',
  input: {schema: ExpertRecommendationsInputSchema},
  output: {schema: ExpertRecommendationsOutputSchema},
  model: googleAI('gemini-pro'),
  prompt: `You are an AI assistant helping researchers find potential collaborators.

  Based on the researcher's stated research interests, recommend health experts who may be good collaborators.

  Research Interests: {{{researchInterests}}}

  Number of Recommendations: {{{numberOfRecommendations}}}

  Experts:`,
});

const expertRecommendationsFlow = ai.defineFlow(
  {
    name: 'expertRecommendationsFlow',
    inputSchema: ExpertRecommendationsInputSchema,
    outputSchema: ExpertRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
