
'use server';
/**
 * @fileOverview AI-powered summarization of clinical trials using OpenAI.
 *
 * - summarizeClinicalTrial - A function that takes clinical trial details and returns an AI-generated summary.
 * - SummarizeClinicalTrialInput - The input type for the summarizeClinicalTrial function.
 * - SummarizeClinicalTrialOutput - The return type for the summarizeClinicalTrial function, containing the AI-generated summary.
 */

import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI();

const SummarizeClinicalTrialInputSchema = z.object({
  trialDetails: z.string().describe('The detailed text of a clinical trial, including title, description, and eligibility criteria.'),
});
export type SummarizeClinicalTrialInput = z.infer<typeof SummarizeClinicalTrialInputSchema>;

const SummarizeClinicalTrialOutputSchema = z.object({
  aiSummary: z.string().describe('An AI-generated summary of the clinical trial.'),
});
export type SummarizeClinicalTrialOutput = z.infer<typeof SummarizeClinicalTrialOutputSchema>;

export async function summarizeClinicalTrial(input: SummarizeClinicalTrialInput): Promise<SummarizeClinicalTrialOutput> {
  const systemPrompt = `You are an expert medical research analyst. Your task is to summarize the provided clinical trial information for a general audience (patient-friendly). 
  Focus on the trial's purpose, what it involves for a participant, and key eligibility criteria. Keep the summary concise and easy to understand.
  Do not provide medical advice. Start the summary directly, without any preamble.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Please summarize the following clinical trial: ${input.trialDetails}` },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
    });

    const aiSummary = completion.choices[0]?.message?.content || 'Summary is not available at this time.';
    return { aiSummary };
  } catch (error) {
    console.error('Error calling OpenAI for clinical trial summary:', error);
    throw new Error('Failed to generate AI summary.');
  }
}
