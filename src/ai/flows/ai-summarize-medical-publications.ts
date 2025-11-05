
'use server';
/**
 * @fileOverview Provides AI-powered summaries of medical publications.
 *
 * - summarizeMedicalPublication - A function that takes medical publication content and returns a summary.
 * - SummarizeMedicalPublicationInput - The input type for the summarizeMedicalPublication function.
 * - SummarizeMedicalPublicationOutput - The return type for the summarizeMedicalPublication function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SummarizeMedicalPublicationInputSchema = z.object({
  publicationContent: z.string().describe('The content of the medical publication to be summarized.'),
});
export type SummarizeMedicalPublicationInput = z.infer<typeof SummarizeMedicalPublicationInputSchema>;

const SummarizeMedicalPublicationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the medical publication.'),
});
export type SummarizeMedicalPublicationOutput = z.infer<typeof SummarizeMedicalPublicationOutputSchema>;

const summarizeMedicalPublicationPrompt = ai.definePrompt(
  {
    name: 'summarizeMedicalPublicationPrompt',
    input: { schema: SummarizeMedicalPublicationInputSchema },
    output: { schema: SummarizeMedicalPublicationOutputSchema },
    model: googleAI('gemini-pro'),
    system: `You are an expert at summarizing complex medical research papers for a general audience.
  
Summarize the following medical publication content, focusing on the key findings, methodology, and significance. Explain it in a way that a patient or non-specialist can understand.`,
    prompt: `{{{publicationContent}}}`,
  },
);

const summarizeMedicalPublicationFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalPublicationFlow',
    inputSchema: SummarizeMedicalPublicationInputSchema,
    outputSchema: SummarizeMedicalPublicationOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await summarizeMedicalPublicationPrompt(input);
        return output!;
    } catch (error) {
        console.error('Error in summarizeMedicalPublicationFlow:', error);
        throw new Error('Failed to generate AI summary.');
    }
  }
);


export async function summarizeMedicalPublication(input: SummarizeMedicalPublicationInput): Promise<SummarizeMedicalPublicationOutput> {
    return summarizeMedicalPublicationFlow(input);
}
