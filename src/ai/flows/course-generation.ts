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
  prompt: `Generate reading materials, an evaluation with a question, and a quiz question with 4 choices for a course 
  on the subject "{{{courseSubject}}}" with the following outline:

  {{{courseOutline}}}

  Provide the output as a JSON object with keys "studyMaterials", "evaluations", and "quizzes". 
  The values for each key should be strings containing the respective generated content.
  For the quiz question, in order to extract further data and format it for programatic creation of resources, format
  the quiz as follows:
  Q: <quiz question> Opt1: <option 1> Opt2: <option 2> Opt3: <option 3> Opt4: <option 4>
  Note: generate all responses in SPANISH
  `,
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