
'use server';

import { generateObject } from 'ai';
import { google } from '../client';
import { CheckTrialEligibilityInputSchema, CheckTrialEligibilityOutputSchema } from './schemas';
import type { CheckTrialEligibilityInput, CheckTrialEligibilityOutput } from './schemas';


export async function checkTrialEligibility(input: CheckTrialEligibilityInput): Promise<CheckTrialEligibilityOutput> {
    const prompt = `
        You are an AI assistant designed to help patients understand their potential eligibility for clinical trials.
        Your task is to compare a user's profile against a trial's eligibility criteria and determine a likely status.
        Do not provide medical advice. Your analysis is for informational purposes only.

        **User Profile:**
        - Age: ${input.userProfile.age}
        - Location: ${input.userProfile.location}
        - Conditions/Interests: ${input.userProfile.conditions?.join(", ")}

        **Clinical Trial Information:**
        - Locations: ${input.trial.locations?.join(", ")}
        - Eligibility Criteria:
        ---
        ${input.trial.eligibilityCriteria}
        ---

        **Your Task:**
        1.  **Analyze:** Carefully review the user's profile against the inclusion and exclusion criteria of the trial.
        2.  **Determine Status:** Categorize the user's likely eligibility as 'Eligible', 'Not Eligible', or 'Partially Eligible'.
            - 'Eligible': The user appears to meet all major inclusion criteria and does not meet major exclusion criteria.
            - 'Not Eligible': The user clearly fails to meet one or more major inclusion criteria or meets a major exclusion criterion.
            - 'Partially Eligible': The user meets some criteria, but more information is needed to make a determination. This is the most common status. Use this if any key information is missing from the user's profile.
        3.  **Explain:** Write a simple, one-sentence explanation for your decision.
        4.  **List Matched Criteria:** Identify and list up to 3 key criteria the user seems to meet.
        5.  **List Unmatched Criteria:** Identify and list up to 3 key criteria the user may not meet or that require more information. Be clear that this is not a final decision.
    `;

    const { object } = await generateObject({
        model: google('gemini-pro'),
        schema: CheckTrialEligibilityOutputSchema,
        prompt: prompt,
    });
    
    return object;
}
