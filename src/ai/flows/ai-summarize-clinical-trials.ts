'use server';
/**
 * @fileOverview AI-powered summarization of clinical trials.
 *
 * - summarizeClinicalTrial - A function that takes clinical trial details and returns an AI-generated summary.
 * - SummarizeClinicalTrialInput - The input type for the summarizeClinicalTrial function, including the trial details.
 * - SummarizeClinicalTrialOutput - The return type for the summarizeClinicalTrial function, containing the AI-generated summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SummarizeClinicalTrialInputSchema = z.object({
  trialDetails: z.string().describe('The detailed text of a clinical trial.'),
});
export type SummarizeClinicalTrialInput = z.infer<typeof SummarizeClinicalTrialInputSchema>;

const SummarizeClinicalTrialOutputSchema = z.object({
  aiSummary: z.string().describe('An AI-generated summary of the clinical trial.'),
});
export type SummarizeClinicalTrialOutput = z.infer<typeof SummarizeClinicalTrialOutputSchema>;

export async function summarizeClinicalTrial(input: SummarizeClinicalTrialInput): Promise<SummarizeClinicalTrialOutput> {
  return summarizeClinicalTrialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeClinicalTrialPrompt',
  model: googleAI('gemini-pro'),
  input: {schema: SummarizeClinicalTrialInputSchema},
  output: {schema: SummarizeClinicalTrialOutputSchema},
  prompt: `You are an AI expert in summarizing clinical trials for patients.

  Given the following clinical trial details, provide a concise and easy-to-understand summary that helps patients quickly assess the trial's relevance to their needs.

  Clinical Trial Details:
  {{trialDetails}}
  `,
});

const summarizeClinicalTrialFlow = ai.defineFlow(
  {
    name: 'summarizeClinicalTrialFlow',
    inputSchema: SummarizeClinicalTrialInputSchema,
    outputSchema: SummarizeClinicalTrialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
