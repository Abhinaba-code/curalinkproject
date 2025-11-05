
'use server';
/**
 * @fileOverview Provides AI-powered summaries of medical publications using OpenAI.
 *
 * - summarizeMedicalPublication - A function that takes medical publication content and returns a summary.
 * - SummarizeMedicalPublicationInput - The input type for the summarizeMedicalPublication function.
 * - SummarizeMedicalPublicationOutput - The return type for the summarizeMedicalPublication function.
 */

import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI();


const SummarizeMedicalPublicationInputSchema = z.object({
  publicationContent: z.string().describe('The content of the medical publication to be summarized.'),
});
export type SummarizeMedicalPublicationInput = z.infer<typeof SummarizeMedicalPublicationInputSchema>;

const SummarizeMedicalPublicationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the medical publication.'),
});
export type SummarizeMedicalPublicationOutput = z.infer<typeof SummarizeMedicalPublicationOutputSchema>;


export async function summarizeMedicalPublication(input: SummarizeMedicalPublicationInput): Promise<SummarizeMedicalPublicationOutput> {
  const systemPrompt = `You are an expert medical writer. Your task is to summarize the provided medical publication abstract for a general audience.
  Explain the key findings and why they are important in simple terms. The summary should be clear, concise, and easy to understand for someone without a scientific background.
  Start the summary directly, without any preamble.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Please summarize the following publication content: ${input.publicationContent}` },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
    });

    const summary = completion.choices[0]?.message?.content || 'Summary is not available at this time.';
    return { summary };
  } catch (error) {
    console.error('Error calling OpenAI for publication summary:', error);
    throw new Error('Failed to generate AI summary.');
  }
}
