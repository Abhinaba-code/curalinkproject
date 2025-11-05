
'use server';
/**
 * @fileOverview Provides AI-powered summaries of medical publications using OpenAI.
 *
 * - summarizeMedicalPublication - A function that takes medical publication content and returns a summary.
 * - SummarizeMedicalPublicationInput - The input type for the summarizeMedicalPublication function.
 * - SummarizeMedicalPublicationOutput - The return type for the summarizeMedicalPublication function.
 */

import { openai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeMedicalPublicationInputSchema = z.object({
  publicationContent: z.string().describe('The content of the medical publication to be summarized.'),
});
export type SummarizeMedicalPublicationInput = z.infer<typeof SummarizeMedicalPublicationInputSchema>;

const SummarizeMedicalPublicationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the medical publication.'),
});
export type SummarizeMedicalPublicationOutput = z.infer<typeof SummarizeMedicalPublicationOutputSchema>;

const SYSTEM_PROMPT = `You are an expert at summarizing complex medical research papers for a general audience.
  
Summarize the following medical publication content, focusing on the key findings, methodology, and significance. Explain it in a way that a patient or non-specialist can understand.`;

export async function summarizeMedicalPublication(input: SummarizeMedicalPublicationInput): Promise<SummarizeMedicalPublicationOutput> {
  const { publicationContent } = input;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: publicationContent },
      ],
    });

    const summary = response.choices[0]?.message?.content || "Could not generate summary.";

    return { summary };
  } catch (error) {
    console.error('Error calling OpenAI for publication summary:', error);
    throw new Error('Failed to generate AI summary.');
  }
}
