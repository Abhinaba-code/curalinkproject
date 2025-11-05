import { config } from 'dotenv';
config();

import { genkit, Ai } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI object with the Google AI and OpenAI plugins.
export const ai: Ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
