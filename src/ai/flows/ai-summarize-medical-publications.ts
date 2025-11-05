
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

export async function summarizeMedicalPublication(input: SummarizeMedicalPublicationInput): Promise<SummarizeMedicalPublicationOutput> {
    return summarizePublicationFlow(input);
}

const summarizePublicationPrompt = ai.definePrompt({
    name: 'summarizePublicationPrompt',
    input: { schema: SummarizeMedicalPublicationInputSchema },
    output: { schema: SummarizeMedicalPublicationOutputSchema },
    model: googleAI('gemini-pro'),
    system: `You are an expert medical writer. Your task is to summarize the provided medical publication abstract for a general audience.
  Explain the key findings and why they are important in simple terms. The summary should be clear, concise, and easy to understand for someone without a scientific background.
  Start the summary directly, without any preamble.`,
    prompt: `Please summarize the following publication content: {{{publicationContent}}}`,
});

const summarizePublicationFlow = ai.defineFlow(
    {
        name: 'summarizePublicationFlow',
        inputSchema: SummarizeMedicalPublicationInputSchema,
        outputSchema: SummarizeMedicalPublicationOutputSchema,
    },
    async (input) => {
        try {
            const { output } = await summarizePublicationPrompt(input);
            if (!output) {
                throw new Error('No output from AI model.');
            }
            return output;
        } catch (error) {
            console.error('Error in summarizePublicationFlow:', error);
            throw new Error('Failed to generate AI summary.');
        }
    }
);
