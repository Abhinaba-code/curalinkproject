
'use server';
/**
 * @fileOverview AI-powered summarization of clinical trials using OpenAI.
 *
 * - summarizeClinicalTrial - A function that takes clinical trial details and returns an AI-generated summary.
 * - SummarizeClinicalTrialInput - The input type for the summarizeClinicalTrial function, including the trial details.
 * - SummarizeClinicalTrialOutput - The return type for the summarizeClinicalTrial function, containing the AI-generated summary.
 */

import { openai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeClinicalTrialInputSchema = z.object({
  trialDetails: z.string().describe('The detailed text of a clinical trial.'),
});
export type SummarizeClinicalTrialInput = z.infer<typeof SummarizeClinicalTrialInputSchema>;

const SummarizeClinicalTrialOutputSchema = z.object({
  aiSummary: z.string().describe('An AI-generated summary of the clinical trial.'),
});
export type SummarizeClinicalTrialOutput = z.infer<typeof SummarizeClinicalTrialOutputSchema>;

const SYSTEM_PROMPT = `You are an AI expert in summarizing clinical trials for patients.

Given the following clinical trial details, provide a concise and easy-to-understand summary that helps patients quickly assess the trial's relevance to their needs.`;

export async function summarizeClinicalTrial(input: SummarizeClinicalTrialInput): Promise<SummarizeClinicalTrialOutput> {
  const { trialDetails } = input;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: trialDetails },
      ],
    });

    const aiSummary = response.choices[0]?.message?.content || "Could not generate summary.";

    return { aiSummary };
  } catch (error) {
    console.error('Error calling OpenAI for trial summary:', error);
    throw new Error('Failed to generate AI summary.');
  }
}
