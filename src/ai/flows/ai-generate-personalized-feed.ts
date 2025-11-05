
'use server';
/**
 * @fileOverview Generates a personalized feed for a user based on their interests.
 *
 * - generatePersonalizedFeed - A function that generates feed content.
 * - GeneratePersonalizedFeedInput - The input type for the feed generation.
 * - GeneratePersonalizedFeedOutput - The output type for the feed generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GeneratePersonalizedFeedInputSchema = z.object({
  interests: z.array(z.string()).describe("A list of the user's medical conditions or research interests."),
});
export type GeneratePersonalizedFeedInput = z.infer<typeof GeneratePersonalizedFeedInputSchema>;


const FeedItemSchema = z.object({
    type: z.enum(['trial', 'publication', 'expert']),
    title: z.string(),
    summary: z.string(),
    link: z.string(),
});

const GeneratePersonalizedFeedOutputSchema = z.object({
  feed: z.array(FeedItemSchema).describe('A list of personalized feed items for the user.'),
});
export type GeneratePersonalizedFeedOutput = z.infer<typeof GeneratePersonalizedFeedOutputSchema>;


export async function generatePersonalizedFeed(input: GeneratePersonalizedFeedInput): Promise<GeneratePersonalizedFeedOutput> {
  return personalizedFeedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFeedPrompt',
  input: { schema: GeneratePersonalizedFeedInputSchema },
  output: { schema: GeneratePersonalizedFeedOutputSchema },
  model: googleAI('gemini-pro'),
  system: `You are an AI assistant for CuraLink, a platform that connects patients and researchers.
  Your task is to generate a personalized feed of content for a user based on their stated interests.
  The feed should contain a mix of relevant clinical trials, medical publications, and health experts.
  For each item, provide a title, a brief summary explaining why it's relevant to the user's interests, and a simple placeholder link.
  
  Example User Interests: "Glioblastoma", "Immunotherapy"
  
  Example Output:
  - A clinical trial for a new immunotherapy drug for Glioblastoma.
  - A recently published paper on tumor microenvironments in brain cancer.
  - A renowned neuro-oncologist who specializes in Glioblastoma research.
  
  Generate 3-5 items for the user's feed.
  Make the links simple paths: for trials use '/dashboard/trials', for publications use '/dashboard/publications', and for experts use '/dashboard/experts'.
  `,
  prompt: `Generate a personalized feed for a user with the following interests: {{{interests}}}.`,
});


const personalizedFeedFlow = ai.defineFlow(
  {
    name: 'personalizedFeedFlow',
    inputSchema: GeneratePersonalizedFeedInputSchema,
    outputSchema: GeneratePersonalizedFeedOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
