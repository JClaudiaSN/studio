'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  courseSubject: z.string().describe("The subject of the course."),
  courseOutline: z
    .string()
    .describe("A simple outline of the course content."),
});

export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;
// Define the output schema for the flow
const GenerateContentOutputSchema = z.object({
  studyMaterials: z
    .string()
    .describe("Generated study materials for the course."),
  evaluations: z
    .string()
    .describe("Generated evaluations for the course."),
  quizzes: z.string().describe("Generated quizzes for the course."),
});

export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: GenerateContentOutputSchema},
  prompt: `Generate study materials, evaluations, and quizzes for a course 
  on the subject "{{{courseSubject}}}" with the following outline:

  {{{courseOutline}}}

  Provide the output as a JSON object with keys "studyMaterials", "evaluations", and "quizzes". 
  The values for each key should be strings containing the respective generated content.`,
});
// Define the Genkit flow
const generateContentFlow = ai.defineFlow(
  {
    name: "generateContentFlow",
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);