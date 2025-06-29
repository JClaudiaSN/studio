import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { textToSpeech } from '@genkit-ai/googleai'; // Corrected import

const EvaluateResponseInputSchema = z.object({
  question: z.object({
    correctAnswer: z.string().describe('The correct answer for the question (e.g., "A", "B", "C", or "D" or a number).'),
  }),
  transcribedResponse: z.string().describe('The transcribed text of the student\'s audio response.'),
});
export type EvaluateResponseInput = z.infer<typeof EvaluateResponseInputSchema>;

const EvaluateResponseOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the transcribed response is correct.'),
  feedbackAudioDataUri: z.string().describe('The audio data URI for the feedback.'),
});
export type EvaluateResponseOutput = z.infer<typeof EvaluateResponseOutputSchema>;

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: z.object({
    isCorrect: z.boolean(),
    correctAnswer: z.string(),
    transcribedResponse: z.string(),
  }),
  output: z.string(),
  prompt: `You are an encouraging and helpful educator providing feedback on a quiz question.

  The correct answer was "{{correctAnswer}}". The student's transcribed response was "{{transcribedResponse}}".

  If the answer is correct, provide positive reinforcement.
  If the answer is incorrect, explain why the student's answer is wrong and provide a hint or point towards the correct concept without giving the answer directly.
  Keep the feedback clear, concise, and supportive.
  `,
});

export const evaluateResponseFlow = ai.defineFlow(
  {
    name: 'evaluateResponseFlow',
    inputSchema: EvaluateResponseInputSchema,
    outputSchema: EvaluateResponseOutputSchema,
  },
  async (input: EvaluateResponseInput): Promise<EvaluateResponseOutput> => {
    const correctAnswer = input.question.correctAnswer.toLowerCase().trim();
    const transcribedResponse = input.transcribedResponse.toLowerCase().trim();

    let isCorrect = false;
    let feedbackText = '';

    // Simple check for presence of correct answer (case-insensitive)
    // This can be made more sophisticated for better flexibility
    if (transcribedResponse.includes(correctAnswer)) {
      isCorrect = true;
      feedbackText = 'Correct!';
    } else {
      feedbackText = `Incorrect. The correct answer was ${input.question.correctAnswer}.`;
    }

    // Generate audio for the feedback text
    const { media } = await ai.generate({
      model: textToSpeech('googleai/gemini-2.5-flash-preview-tts'), // Using the imported function
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: feedbackText,
    });

    const feedbackAudioDataUri = (media && media.url) ? media.url : ''; // Handle potential failure

    if (!feedbackAudioDataUri) {
      console.error('Failed to generate audio feedback for:', feedbackText);
    }

    return {
      isCorrect: isCorrect,
      feedbackAudioDataUri: feedbackAudioDataUri,
    };
  }
);