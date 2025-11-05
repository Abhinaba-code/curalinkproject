import { genkit, Ai } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI object. This is used for other flows.
export const ai: Ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
