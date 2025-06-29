'use server';
/**
 * @fileOverview Provides AI-powered evaluation/quiz generation.
 *
 * - generateEvaluation - Analyzes a topic and generates a multiple-choice quiz.
 * - GenerateEvaluationInput - The input type for the generateEvaluation function.
 * - GenerateEvaluationOutput - The return type for the generateEvaluation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEvaluationInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic for which to generate an evaluation.'),
  numQuestions: z.coerce.number().int().min(1).max(10).describe('The number of questions to generate.'),
});
export type GenerateEvaluationInput = z.infer<typeof GenerateEvaluationInputSchema>;

const GenerateEvaluationOutputSchema = z.object({
  title: z
    .string()
    .describe(
      'A suitable title for the quiz, based on the topic.'
    ),
    quizContent: z
    .string()
    .describe(
      'The full quiz content, including questions, multiple-choice options, and a separate answer key at the end, formatted as plain text.'
    ),
});
export type GenerateEvaluationOutput = z.infer<typeof GenerateEvaluationOutputSchema>;

export async function generateEvaluation(
  input: GenerateEvaluationInput
): Promise<GenerateEvaluationOutput> {
  return generateEvaluationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationPrompt',
  input: {schema: GenerateEvaluationInputSchema},
  output: {schema: GenerateEvaluationOutputSchema},
  prompt: `You are an expert educator creating a quiz.
  
  Generate a multiple-choice quiz about the following topic: {{{topic}}}
  
  The quiz should have exactly {{{numQuestions}}} questions.
  
  For each question, provide 4 options (A, B, C, D).
  
  Format the entire output as a single block of plain text.
  At the end of the quiz, provide a separate "Answer Key" section that lists the correct answers for all questions.
  Do not use markdown or any other special formatting. Just plain text.
`,
});

const generateEvaluationFlow = ai.defineFlow(
  {
    name: 'generateEvaluationFlow',
    inputSchema: GenerateEvaluationInputSchema,
    outputSchema: GenerateEvaluationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
