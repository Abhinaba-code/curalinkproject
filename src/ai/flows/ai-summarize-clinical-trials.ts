
'use server';
/**
 * @fileOverview AI-powered summarization of clinical trials.
 *
 * - summarizeClinicalTrial - A function that takes clinical trial details and returns an AI-generated summary.
 * - SummarizeClinicalTrialInput - The input type for the summarizeClinicalTrial function.
 * - SummarizeClinicalTrialOutput - The return type for the summarizeClinicalTrial function, containing the AI-generated summary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SummarizeClinicalTrialInputSchema = z.object({
  trialDetails: z.string().describe('The detailed text of a clinical trial.'),
});
export type SummarizeClinicalTrialInput = z.infer<typeof SummarizeClinicalTrialInputSchema>;

const SummarizeClinicalTrialOutputSchema = z.object({
  aiSummary: z.string().describe('An AI-generated summary of the clinical trial.'),
});
export type SummarizeClinicalTrialOutput = z.infer<typeof SummarizeClinicalTrialOutputSchema>;

const summarizeClinicalTrialPrompt = ai.definePrompt(
    {
        name: 'summarizeClinicalTrialPrompt',
        input: { schema: SummarizeClinicalTrialInputSchema },
        output: { schema: SummarizeClinicalTrialOutputSchema },
        model: googleAI('gemini-pro'),
        system: `You are an AI expert in summarizing clinical trials for patients.

Given the following clinical trial details, provide a concise and easy-to-understand summary that helps patients quickly assess the trial's relevance to their needs.`,
        prompt: `{{{trialDetails}}}`,
    }
);

const summarizeClinicalTrialFlow = ai.defineFlow(
    {
        name: 'summarizeClinicalTrialFlow',
        inputSchema: SummarizeClinicalTrialInputSchema,
        outputSchema: SummarizeClinicalTrialOutputSchema,
    },
    async (input) => {
        try {
            const { output } = await summarizeClinicalTrialPrompt(input);
            return output!;
        } catch (error) {
            console.error('Error in summarizeClinicalTrialFlow:', error);
            throw new Error('Failed to generate AI summary.');
        }
    }
);

export async function summarizeClinicalTrial(input: SummarizeClinicalTrialInput): Promise<SummarizeClinicalTrialOutput> {
  return summarizeClinicalTrialFlow(input);
}
