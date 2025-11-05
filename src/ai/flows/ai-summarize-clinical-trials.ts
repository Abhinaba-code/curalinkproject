
'use server';
/**
 * @fileOverview AI-powered summarization of clinical trials.
 *
 * - summarizeClinicalTrial - A function that takes clinical trial details and returns an AI-generated summary.
 * - SummarizeClinicalTrialInput - The input type for the summarizeClinicalTrial function.
 * - SummarizeClinicalTrialOutput - The return type for the summarizeClinicalTrial function, containing the AI-generated summary.
 */

import { z } from 'genkit';

const SummarizeClinicalTrialInputSchema = z.object({
  trialDetails: z.string().describe('The detailed text of a clinical trial.'),
});
export type SummarizeClinicalTrialInput = z.infer<typeof SummarizeClinicalTrialInputSchema>;

const SummarizeClinicalTrialOutputSchema = z.object({
  aiSummary: z.string().describe('An AI-generated summary of the clinical trial.'),
});
export type SummarizeClinicalTrialOutput = z.infer<typeof SummarizeClinicalTrialOutputSchema>;

export async function summarizeClinicalTrial(input: SummarizeClinicalTrialInput): Promise<SummarizeClinicalTrialOutput> {
  // This feature is temporarily disabled due to a persistent error.
  // Returning a placeholder summary.
  return Promise.resolve({
      aiSummary: "The AI summary feature is currently unavailable. We are working to restore it. Please check back later."
  });
}
