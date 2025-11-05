import OpenAI from 'openai';

// This file is updated to use OpenAI instead of Genkit.
// The `ai` object is now an instance of the OpenAI client.

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in the environment variables.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
