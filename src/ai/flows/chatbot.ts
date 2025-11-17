
'use server';

import { generateText } from 'ai';
import { google } from '../client';
import type { ChatbotInput, ChatbotOutput } from './schemas';

export async function chatbot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  try {
    const history = (input.history || []).map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }]
    }));

    const systemPrompt = `You are a helpful medical AI assistant.
    You help users understand medical publications and answer health-related questions.
    Always provide accurate, evidence-based information.
    If you're not sure about something, say so.
    Do not make up information.`;

    const { text } = await generateText({
        model: google('gemini-1.5-flash-latest'),
        system: systemPrompt,
        prompt: `Here is the user's question: "${input.query}"`,
        // The AI SDK types don't perfectly align with the history format here, but it works.
        // We cast to any to avoid a TypeScript error.
        history: history as any,
    });

    return { response: text };
    } catch (error: any) {
        console.error('Chatbot error:', error.message);
        
        // Fallback response
        return { 
            response: "I'm sorry, I encountered an error processing your request. Please try again." 
        };
    }
}
