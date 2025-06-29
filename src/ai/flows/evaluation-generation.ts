'use server';
/**
 * @fileOverview Provides AI-powered evaluation/quiz generation.
 *
 * - generateEvaluation - Analyzes a topic and generates a multiple-choice quiz.
 * - GenerateEvaluationInput - The input type for the generateEvaluation function.
 * - GenerateEvaluationOutput - The return type for the generateEvaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    .describe('A suitable title for the quiz, based on the topic.'),
  questions: z.array(z.object({
    questionText: z.string().describe('The text of the quiz question.'),
    correctAnswer: z.string().describe('The correct answer for the question (e.g., "A", "B", "C", or "D").'),
    audioDataUri: z.string().describe('The audio data URI for the question text.'),
  })),
});
export type GenerateEvaluationOutput = z.infer<typeof GenerateEvaluationOutputSchema>;

export async function generateEvaluation(
  input: GenerateEvaluationInput
): Promise<GenerateEvaluationOutput> {
  return generateEvaluationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationPrompt',
  input: { schema: GenerateEvaluationInputSchema },
  output: { schema: GenerateEvaluationOutputSchema },
  prompt: `You are an expert educator creating a quiz.

  Generate a multiple-choice quiz about the following topic: {{{topic}}}

  The quiz should have exactly {{{numQuestions}}} questions.

  For each question, provide 4 options (A, B, C, D).

  Format the output as a JSON object with two fields: "title" and "questions".
  The "title" field should be a suitable title for the quiz.
  The "questions" field should be an array of objects, where each object represents a question.
  Each question object should have two fields: "questionText" and "correctAnswer".
  The "questionText" should include the question and the four multiple-choice options.
  The "correctAnswer" should be the letter (A, B, C, or D) corresponding to the correct answer.

  Example JSON structure:
  {
    "title": "Quiz Title",
    "questions": [{"questionText": "Question 1 text with options A, B, C, D", "correctAnswer": "A"}, ...]
  }
`,
});

const generateEvaluationFlow = ai.defineFlow(
  {
    name: 'generateEvaluationFlow',
    inputSchema: GenerateEvaluationInputSchema,
    outputSchema: GenerateEvaluationOutputSchema,
  },
  async input => {
    const { text } = await prompt(input);
    // Parse the JSON output from the prompt
    const output: GenerateEvaluationOutput = JSON.parse(text);

    // Generate audio for each question
    for (const question of output.questions) {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts', // Using the model name directly
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: question.questionText,
      });

      if (media && media.url) {
        question.audioDataUri = media.url;
      } else {
        console.error('Failed to generate audio for question:', question.questionText);
        // Handle cases where audio generation fails, perhaps by providing a default or error indicator
        question.audioDataUri = ''; // Or a placeholder
      }
    }

    return output;
  }
);
