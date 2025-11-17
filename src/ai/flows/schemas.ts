
import { z } from 'zod';

export const ExpertRecommendationsInputSchema = z.object({
  researchInterests: z
    .string()
    .describe('The research interests of the researcher.'),
  numberOfRecommendations: z
    .number()
    .default(5)
    .describe('The number of expert recommendations to return.'),
});

export const ExpertRecommendationsOutputSchema = z.object({
    expertRecommendations: z.array(z.string()).describe('A list of recommended health experts.')
});

export const SummarizeClinicalTrialInputSchema = z.object({
  trialDetails: z.string().describe('The detailed text of a clinical trial, including title, description, and eligibility criteria.'),
});

export const SummarizeClinicalTrialOutputSchema = z.object({
  aiSummary: z.string().describe('An AI-generated summary of the clinical trial.'),
});

export const SummarizeMedicalPublicationInputSchema = z.object({
  publicationContent: z.string().describe('The content of the medical publication to be summarized.'),
});

export const SummarizeMedicalPublicationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the medical publication.'),
});

export const ChatbotInputSchema = z.object({
  query: z.string().describe("The user's query."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe("The conversation history."),
});

export const ChatbotOutputSchema = z.object({
    response: z.string().describe("The AI's response to the user query.")
});

export const CheckTrialEligibilityInputSchema = z.object({
    userProfile: z.object({
        age: z.number().optional().describe("The user's age in years."),
        location: z.string().optional().describe("The user's location (e.g., city, country)."),
        conditions: z.array(z.string()).optional().describe("A list of the user's medical conditions or interests."),
    }),
    trial: z.object({
        eligibilityCriteria: z.string().describe("The full text of the clinical trial's eligibility criteria."),
        locations: z.array(z.string()).optional().describe("A list of locations where the trial is being conducted."),
    }),
});

export const CheckTrialEligibilityOutputSchema = z.object({
  status: z.enum(['Eligible', 'Not Eligible', 'Partially Eligible']).describe("The user's likely eligibility status for the trial."),
  explanation: z.string().describe("A brief explanation of the eligibility determination, written for a patient to understand."),
  matchedCriteria: z.array(z.string()).describe("A list of key eligibility criteria that the user appears to meet."),
  unmatchedCriteria: z.array(z.string()).describe("A list of key eligibility criteria that the user may not meet or for which more information is needed."),
});

export const SymptomSchema = z.object({
  id: z.string(),
  notes: z.string(),
  date: z.string().describe("ISO 8601 date string"),
  severity: z.number().describe("A number from 1 (mild) to 5 (severe)"),
});
export type Symptom = z.infer<typeof SymptomSchema>;


export const SummarizeSymptomsInputSchema = z.object({
  symptoms: z.array(SymptomSchema).describe("An array of symptoms logged by the user."),
});

export const SummarizeSymptomsOutputSchema = z.object({
  summary: z.string().describe("A high-level, one-paragraph summary of the user's logged symptoms over the period."),
  patterns: z.array(z.string()).describe("A list of identified patterns or trends, such as recurring symptoms or changes in severity."),
  nextSteps: z.array(z.string()).describe("A list of general, non-medical suggestions for the user, primarily encouraging discussion with a healthcare provider."),
});

export const VoiceAssistantInputSchema = z.object({
  query: z.string().describe("The user's voice query."),
});

export const VoiceAssistantOutputSchema = z.object({
    response: z.string().describe("The AI's spoken response to the user query.")
});

export type ExpertRecommendationsInput = z.infer<typeof ExpertRecommendationsInputSchema>;
export type ExpertRecommendationsOutput = z.infer<typeof ExpertRecommendationsOutputSchema>;
export type SummarizeClinicalTrialInput = z.infer<typeof SummarizeClinicalTrialInputSchema>;
export type SummarizeClinicalTrialOutput = z.infer<typeof SummarizeClinicalTrialOutputSchema>;
export type SummarizeMedicalPublicationInput = z.infer<typeof SummarizeMedicalPublicationInputSchema>;
export type SummarizeMedicalPublicationOutput = z.infer<typeof SummarizeMedicalPublicationOutputSchema>;
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;
export type CheckTrialEligibilityInput = z.infer<typeof CheckTrialEligibilityInputSchema>;
export type CheckTrialEligibilityOutput = z.infer<typeof CheckTrialEligibilityOutputSchema>;
export type SummarizeSymptomsInput = z.infer<typeof SummarizeSymptomsInputSchema>;
export type SummarizeSymptomsOutput = z.infer<typeof SummarizeSymptomsOutputSchema>;
export type VoiceAssistantInput = z.infer<typeof VoiceAssistantInputSchema>;
export type VoiceAssistantOutput = z.infer<typeof VoiceAssistantOutputSchema>;
