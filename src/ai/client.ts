'use server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';

// By default, the AI SDK will use the GOOGLE_GENERATIVE_AI_API_KEY
// environment variable for authentication.
export const google = createGoogleGenerativeAI();