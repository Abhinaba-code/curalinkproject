import OpenAI from 'openai';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI object with the Google AI plugin.
// This is used by any flows that still rely on Genkit.
export const ai = genkit({
  plugins: [googleAI()],
});


// Initialize the OpenAI client for direct API calls.
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in the environment variables.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
