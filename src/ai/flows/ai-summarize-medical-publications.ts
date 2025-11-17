
'use server';

import { generateObject } from 'ai';
import { google } from '../client';
import { SummarizeMedicalPublicationInputSchema, SummarizeMedicalPublicationOutputSchema } from './schemas';
import type { SummarizeMedicalPublicationInput, SummarizeMedicalPublicationOutput } from './schemas';

export async function summarizeMedicalPublication(input: SummarizeMedicalPublicationInput): Promise<SummarizeMedicalPublicationOutput> {
    // Debug: Check if API key exists
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key first 10 chars:', apiKey?.substring(0, 10));

    const prompt = `
        Summarize the following medical publication:
        ${input.publicationContent}
    `;

    const { object } = await generateObject({
        model: google('models/gemini-pro'),
        schema: SummarizeMedicalPublicationOutputSchema,
        prompt: prompt,
    });
    
    return object;
}
