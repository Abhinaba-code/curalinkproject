
'use server';

import { generateText } from 'ai';
import { google } from '../client';
import type { ChatbotInput, ChatbotOutput } from './schemas';

export async function chatbot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
    const history = (input.history || []).map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }]
    }));

    const systemPrompt = `You are a friendly and helpful AI assistant for a platform called CuraLink.
    CuraLink connects patients with researchers to accelerate medical advancements.

    Your role is to answer user questions about the platform in a concise and encouraging way.
    If you don't know the answer, say "I'm not sure about that, but you can find more information on the CuraLink website."
    Do not make up information.`;

    const { text } = await generateText({
        model: google('models/gemini-pro'),
        system: systemPrompt,
        prompt: `Here is the user's question: "${input.query}"`,
        // The AI SDK types don't perfectly align with the history format here, but it works.
        // We cast to any to avoid a TypeScript error.
        history: history as any,
    });

    return { response: text };
}
