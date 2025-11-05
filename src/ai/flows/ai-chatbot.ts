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
import { googleAI } from '@genkit-ai/google-genai';

const ChatHistorySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const CuraLinkAssistantInputSchema = z.object({
  question: z.string().describe("The user's question about CuraLink."),
  history: z.array(ChatHistorySchema).optional().describe('The conversation history.'),
});
export type CuraLinkAssistantInput = z.infer<typeof CuraLinkAssistantInputSchema>;

const CuraLinkAssistantOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the user's question."),
});
export type CuraLinkAssistantOutput = z.infer<typeof CuraLinkAssistantOutputSchema>;

export async function askCuraLinkAssistant(input: CuraLinkAssistantInput): Promise<CuraLinkAssistantOutput> {
  return curaLinkAssistantFlow(input);
}

const curaLinkAssistantFlow = ai.defineFlow(
  {
    name: 'curaLinkAssistantFlow',
    inputSchema: CuraLinkAssistantInputSchema,
    outputSchema: CuraLinkAssistantOutputSchema,
  },
  async (input) => {
    const { question, history } = input;

    const historyMessages = history ? history.map(h => `${h.role}: ${h.content}`) : [];
    
    const prompt = `You are a friendly and helpful AI assistant for a platform called CuraLink.
  
CuraLink's mission is to connect patients and researchers to accelerate medical advancements.

Key Features:
- AI-Powered Trial Matching: Helps patients find relevant clinical trials.
- Simplified Research: Provides AI-generated summaries of complex medical publications.
- Health Expert Connections: Allows users to find and connect with healthcare providers and researchers.
- Community Forums: A place for patients and researchers to connect.

Your role is to answer user questions about the platform. Be concise, friendly, and informative. If a user asks something outside the scope of CuraLink, politely state that you can only answer questions about the platform.

${historyMessages.join('\n')}
user: ${question}
assistant:
`;

    const llmResponse = await ai.generate({
      model: googleAI('gemini-pro'),
      prompt: prompt,
    });

    return { answer: llmResponse.text };
  }
);
