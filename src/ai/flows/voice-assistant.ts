
'use server';

import { generateText } from 'ai';
import { google } from '../client';
import type { VoiceAssistantInput, VoiceAssistantOutput } from './schemas';

export async function voiceAssistant(
  input: VoiceAssistantInput
): Promise<VoiceAssistantOutput> {
    
    const prompt = `You are a friendly and helpful AI voice assistant for a platform called CuraLink.
    Your role is to answer user questions about the platform in a very concise and direct way, suitable for a voice response.
    Keep your answers to 1-2 sentences. If you don't know the answer, say "I'm not sure about that, but you can find more information on the CuraLink website."
    
    Here is the user's question: "${input.query}"
    `;

    const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: prompt,
    });

    return { response: text };
  }
