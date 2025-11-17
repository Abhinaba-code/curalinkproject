
'use server';

import { generateObject } from 'ai';
import { google } from '../client';
import { ExpertRecommendationsInputSchema, ExpertRecommendationsOutputSchema } from './schemas';
import type { ExpertRecommendationsInput, ExpertRecommendationsOutput } from './schemas';

export async function getExpertRecommendations(
  input: ExpertRecommendationsInput
): Promise<ExpertRecommendationsOutput> {
  const prompt = `You are an AI assistant helping researchers find potential collaborators.
    Based on the researcher's stated research interests, recommend health experts who may be good collaborators.
    
    Research Interests: ${input.researchInterests}
    Number of Recommendations: ${input.numberOfRecommendations}
    `;

  const { object } = await generateObject({
    model: google('models/gemini-pro'),
    schema: ExpertRecommendationsOutputSchema,
    prompt: prompt,
  });

  return object;
}
