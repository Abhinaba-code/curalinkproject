
'use server';

import { generateObject } from 'ai';
import { google } from '../client';
import { SummarizeClinicalTrialInputSchema, SummarizeClinicalTrialOutputSchema } from './schemas';
import type { SummarizeClinicalTrialInput, SummarizeClinicalTrialOutput } from './schemas';

export async function summarizeClinicalTrial(input: SummarizeClinicalTrialInput): Promise<SummarizeClinicalTrialOutput> {
    const prompt = `You are an expert medical research analyst. Your task is to summarize the provided clinical trial information for a general audience (patient-friendly).
        Focus on the trial's purpose, what it involves for a participant, and key eligibility criteria. Keep the summary concise and easy to understand.
        Do not provide medical advice. 

        Please summarize the following clinical trial:
        ---
        ${input.trialDetails}
        ---
        `;

    const { object } = await generateObject({
        model: google('models/gemini-pro'),
        schema: SummarizeClinicalTrialOutputSchema,
        prompt: prompt,
    });

    return object;
}
