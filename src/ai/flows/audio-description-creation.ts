'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const CreateAudioDescriptionInputSchema = z.object({
  textDescription: z
    .string()
    .describe(
      'A full text description of a course material, this text is not optimized for audio reading for vision impaired students.'
    ),
});

export type CreateAudioDescriptionInput = z.infer<typeof CreateAudioDescriptionInputSchema>;

const CreateAudioDescriptionOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe('The audio description of the text material, as a data URI.'),
});

export type CreateAudioDescriptionOutput = z.infer<typeof CreateAudioDescriptionOutputSchema>;

export async function createAudioDescription(
  input: CreateAudioDescriptionInput
): Promise<CreateAudioDescriptionOutput> {
  return createAudioDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAudioDescriptionPrompt',
  input: {schema: CreateAudioDescriptionInputSchema},
  output: {schema: CreateAudioDescriptionOutputSchema},
  prompt: `You are an expert at creating audio descriptions and summaries of educational content for students with visual impairments.

  Given the following text description create an audio summary that conveys the key insights and add some important details.

  Text Description: {{{textDescription}}}

  The audio summary should be clear, concise, and easy to understand.
  It should focus on the most important information and use descriptive language to help the student visualize the content.
  Speak it in a single speaker's voice, since this is a single piece of information.
  Your response should be in text format in spanish language. ALWAYS generate answers in SPANISH.
  `,
});

const createAudioDescriptionFlow = ai.defineFlow(
  {
    name: 'createAudioDescriptionFlow',
    inputSchema: CreateAudioDescriptionInputSchema,
    outputSchema: CreateAudioDescriptionOutputSchema,
  },
  async input => {
    const {text} = await prompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algieba'},
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

