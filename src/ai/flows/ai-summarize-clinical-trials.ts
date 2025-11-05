
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
  trialDetails: z.string().describe('The detailed text of a clinical trial, including title, description, and eligibility criteria.'),
});
export type SummarizeClinicalTrialInput = z.infer<typeof SummarizeClinicalTrialInputSchema>;

const SummarizeClinicalTrialOutputSchema = z.object({
  aiSummary: z.string().describe('An AI-generated summary of the clinical trial.'),
});
export type SummarizeClinicalTrialOutput = z.infer<typeof SummarizeClinicalTrialOutputSchema>;

export async function summarizeClinicalTrial(input: SummarizeClinicalTrialInput): Promise<SummarizeClinicalTrialOutput> {
  return summarizeClinicalTrialFlow(input);
}

const summarizeClinicalTrialPrompt = ai.definePrompt({
    name: 'summarizeClinicalTrialPrompt',
    input: { schema: SummarizeClinicalTrialInputSchema },
    output: { schema: SummarizeClinicalTrialOutputSchema },
    model: googleAI('gemini-pro'),
    system: `You are an expert medical research analyst. Your task is to summarize the provided clinical trial information for a general audience (patient-friendly). 
  Focus on the trial's purpose, what it involves for a participant, and key eligibility criteria. Keep the summary concise and easy to understand.
  Do not provide medical advice. Start the summary directly, without any preamble.`,
    prompt: `Please summarize the following clinical trial: {{{trialDetails}}}`,
});

const summarizeClinicalTrialFlow = ai.defineFlow(
    {
        name: 'summarizeClinicalTrialFlow',
        inputSchema: SummarizeClinicalTrialInputSchema,
        outputSchema: SummarizeClinicalTrialOutputSchema,
    },
    async (input) => {
        try {
            const { output } = await summarizeClinicalTrialPrompt(input);
            if (!output) {
                throw new Error('No output from AI model.');
            }
            return output;
        } catch (error) {
            console.error('Error in summarizeClinicalTrialFlow:', error);
            throw new Error('Failed to generate AI summary.');
        }
    }
);
