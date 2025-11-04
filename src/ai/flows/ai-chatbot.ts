'use server';
/**
 * @fileOverview An AI assistant for the CuraLink platform.
 *
 * - askCuraLinkAssistant - A function that answers questions about CuraLink.
 * - CuraLinkAssistantInput - The input type for the assistant.
 * - CuraLinkAssistantOutput - The output type for the assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatHistorySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const CuraLinkAssistantInputSchema = z.object({
  question: z.string().describe('The user\'s question about CuraLink.'),
  history: z.array(ChatHistorySchema).optional().describe('The conversation history.'),
});
export type CuraLinkAssistantInput = z.infer<typeof CuraLinkAssistantInputSchema>;

const CuraLinkAssistantOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the user\'s question.'),
});
export type CuraLinkAssistantOutput = z.infer<typeof CuraLinkAssistantOutputSchema>;

export async function askCuraLinkAssistant(input: CuraLinkAssistantInput): Promise<CuraLinkAssistantOutput> {
  return curaLinkAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curaLinkAssistantPrompt',
  input: { schema: CuraLinkAssistantInputSchema },
  output: { schema: CuraLinkAssistantOutputSchema },
  system: `You are a friendly and helpful AI assistant for a platform called CuraLink.
  
  CuraLink's mission is to connect patients and researchers to accelerate medical advancements.
  
  Key Features:
  - AI-Powered Trial Matching: Helps patients find relevant clinical trials.
  - Simplified Research: Provides AI-generated summaries of complex medical publications.
  - Health Expert Connections: Allows users to find and connect with healthcare providers and researchers.
  - Community Forums: A place for patients and researchers to connect (currently in development).
  
  Your role is to answer user questions about the platform. Be concise, friendly, and informative. If a user asks something outside the scope of CuraLink, politely state that you can only answer questions about the platform.
  
  {{#if history}}
  Here is the conversation history:
  {{#each history}}
  {{role}}: {{content}}
  {{/each}}
  {{/if}}
  `,
  prompt: `User question: {{{question}}}`,
});

const curaLinkAssistantFlow = ai.defineFlow(
  {
    name: 'curaLinkAssistantFlow',
    inputSchema: CuraLinkAssistantInputSchema,
    outputSchema: CuraLinkAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
