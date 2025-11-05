
'use server';
/**
 * @fileOverview An AI assistant for the CuraLink platform using OpenAI.
 *
 * - askCuraLinkAssistant - A function that answers questions about CuraLink.
 * - CuraLinkAssistantInput - The input type for the assistant.
 * - CuraLinkAssistantOutput - The output type for the assistant.
 */

import { z } from 'genkit';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ChatHistorySchema = z.object({
  role: z.enum(['user', 'model']),
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
  const { question, history = [] } = input;
  
  const systemPrompt = `You are a friendly and helpful AI assistant for a platform called CuraLink.
  
CuraLink's mission is to connect patients and researchers to accelerate medical advancements.

Key Features:
- AI-Powered Trial Matching: Helps patients find relevant clinical trials.
- Simplified Research: Provides AI-generated summaries of complex medical publications.
- Health Expert Connections: Allows users to find and connect with healthcare providers and researchers.
- Community Forums: A place for patients and researchers to connect.

Your role is to answer user questions about the platform. Be concise, friendly, and informative. If a user asks something outside the scope of CuraLink, politely state that you can only answer questions about the platform.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: question },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
    });

    const answer = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return { answer };

  } catch (error) {
    console.error('Error calling OpenAI for chatbot:', error);
    return { answer: "Sorry, I'm having trouble connecting to the AI service right now." };
  }
}
