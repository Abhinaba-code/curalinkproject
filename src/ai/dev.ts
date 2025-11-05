import { config } from 'dotenv';
config();

// The dev file is used to register Genkit flows for local development.
// Since we are moving to OpenAI directly for some flows, we may not need all these imports.
// Keeping them for now in case other flows still use Genkit.
import '@/ai/flows/ai-summarize-medical-publications.ts';
import '@/ai/flows/ai-powered-expert-recommendations.ts';
import '@/ai/flows/ai-summarize-clinical-trials.ts';
import '@/ai/flows/ai-chatbot.ts';
import '@/ai/flows/ai-generate-personalized-feed.ts';
