
'use server';

import { generateObject } from 'ai';
import { google } from '../client';
import { SummarizeMedicalPublicationInputSchema, SummarizeMedicalPublicationOutputSchema } from './schemas';
import type { SummarizeMedicalPublicationInput, SummarizeMedicalPublicationOutput } from './schemas';

export async function summarizeMedicalPublication(input: SummarizeMedicalPublicationInput): Promise<SummarizeMedicalPublicationOutput> {
    const prompt = `You are an expert medical writer. Your task is to summarize the provided medical publication abstract for a general audience.
        Explain the key findings and why they are important in simple terms. The summary should be clear, concise, and easy to understand for someone without a scientific background.

        Please summarize the following publication content:
        ---
        ${input.publicationContent}
        ---
        `;

    const { object } = await generateObject({
        model: google('gemini-pro'),
        schema: SummarizeMedicalPublicationOutputSchema,
        prompt: prompt,
    });

    return object;
}
