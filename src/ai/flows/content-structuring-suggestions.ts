// src/ai/flows/content-structuring-suggestions.ts
'use server';

/**
 * @fileOverview Provides AI-powered content structure suggestions for improving screen reader accessibility.
 *
 * - contentStructuringSuggestions - Analyzes course content and suggests improvements for screen reader accessibility.
 * - ContentStructuringInput - The input type for the contentStructuringSuggestions function.
 * - ContentStructuringOutput - The return type for the contentStructuringSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentStructuringInputSchema = z.object({
  content: z
    .string()
    .describe('The course content to be analyzed for accessibility.'),
});
export type ContentStructuringInput = z.infer<typeof ContentStructuringInputSchema>;

const ContentStructuringOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'AI-generated suggestions for improving the content structure for screen reader accessibility, including proper use of headings, lists, and semantic HTML elements.'
    ),
});
export type ContentStructuringOutput = z.infer<typeof ContentStructuringOutputSchema>;

export async function contentStructuringSuggestions(
  input: ContentStructuringInput
): Promise<ContentStructuringOutput> {
  return contentStructuringSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentStructuringPrompt',
  input: {schema: ContentStructuringInputSchema},
  output: {schema: ContentStructuringOutputSchema},
  prompt: `You are an AI assistant specialized in accessibility for educational content. Review the following course content and provide specific suggestions to improve its structure for screen reader users. Focus on suggesting the proper use of headings, lists, and semantic HTML elements to enhance navigation and comprehension.

Course Content:
{{{content}}}

Accessibility Suggestions:
`,
});

const contentStructuringSuggestionsFlow = ai.defineFlow(
  {
    name: 'contentStructuringSuggestionsFlow',
    inputSchema: ContentStructuringInputSchema,
    outputSchema: ContentStructuringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
