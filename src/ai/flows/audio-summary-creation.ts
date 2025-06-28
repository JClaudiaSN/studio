'use server';

/**
 * @fileOverview A flow for creating audio summaries of visual content.
 *
 * - createAudioSummary - A function that generates an audio summary from an image.
 * - CreateAudioSummaryInput - The input type for the createAudioSummary function.
 * - CreateAudioSummaryOutput - The return type for the createAudioSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const CreateAudioSummaryInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a chart or diagram, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .describe(
      'A description of the chart or diagram, including the key insights to focus on.'
    ),
});

export type CreateAudioSummaryInput = z.infer<typeof CreateAudioSummaryInputSchema>;

const CreateAudioSummaryOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe('The audio summary of the visual content, as a data URI.'),
});

export type CreateAudioSummaryOutput = z.infer<typeof CreateAudioSummaryOutputSchema>;

export async function createAudioSummary(
  input: CreateAudioSummaryInput
): Promise<CreateAudioSummaryOutput> {
  return createAudioSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAudioSummaryPrompt',
  input: {schema: CreateAudioSummaryInputSchema},
  output: {schema: CreateAudioSummaryOutputSchema},
  prompt: `You are an expert at creating audio summaries of visual content for students with visual impairments.

  Given the following description and image of a chart or diagram, create an audio summary that conveys the key insights.

  Description: {{{description}}}
  Image: {{media url=imageDataUri}}

  The audio summary should be clear, concise, and easy to understand.
  It should focus on the most important information and use descriptive language to help the student visualize the content.
  Speak it in a single speaker's voice, since this is a single piece of information.
  Your response should be in text format; I will use another model to convert this into audio.
  `,
});

const createAudioSummaryFlow = ai.defineFlow(
  {
    name: 'createAudioSummaryFlow',
    inputSchema: CreateAudioSummaryInputSchema,
    outputSchema: CreateAudioSummaryOutputSchema,
  },
  async input => {
    const {text} = await prompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {audioDataUri: audioDataUri};
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

