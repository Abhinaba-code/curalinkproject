
'use server';

import { generateObject } from 'ai';
import { google } from '../client';
import { SummarizeSymptomsInputSchema, SummarizeSymptomsOutputSchema } from './schemas';
import type { SummarizeSymptomsInput, SummarizeSymptomsOutput } from './schemas';


export async function summarizeSymptoms(input: SummarizeSymptomsInput): Promise<SummarizeSymptomsOutput> {
  const prompt = `
        You are a helpful AI health assistant. Your task is to analyze a list of symptoms logged by a user and provide a clear, easy-to-understand summary.
        Your response MUST NOT be medical advice. It should be informational and observational, empowering the user to have a more informed conversation with their doctor.

        **Symptom Log:**
        ---
        ${JSON.stringify(input.symptoms)}
        ---

        **Your Task:**
        1.  **Summary:** Write a brief, high-level paragraph summarizing the logged symptoms. Mention the time frame and the most frequent or severe symptoms. ALWAYS start the summary with the phrase "This is an AI-generated analysis and not medical advice."
        2.  **Patterns:** Identify up to 3 key patterns or trends. Examples: "Headaches appear to be logged most frequently on weekends." or "The severity of 'Fatigue' has slightly increased over the last two weeks."
        3.  **Next Steps:** Provide 2-3 general suggestions. These should focus on encouraging communication with a healthcare professional. For example: "Consider sharing this log with your doctor to discuss these patterns." or "Keeping a consistent log can be very helpful for your care team."
    `;

    const { object } = await generateObject({
        model: google('gemini-1.5-flash'),
        schema: SummarizeSymptomsOutputSchema,
        prompt: prompt,
    });

    return object;
}
