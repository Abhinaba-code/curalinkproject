
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

    const prompt = `You are an expert medical writer. Your task is to summarize the provided medical publication abstract for a general audience.
        Explain the key findings and why they are important in simple terms. The summary should be clear, concise, and easy to understand for someone without a scientific background.

        Please summarize the following publication content:
        ---
        ${input.publicationContent}
        ---
        `;

    const { object } = await generateObject({
        model: google('models/gemini-pro'),
        schema: SummarizeMedicalPublicationOutputSchema,
        prompt: prompt,
    });

    return object;
}
