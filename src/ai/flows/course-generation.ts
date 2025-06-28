'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
  courseSubject: z.string().describe("The subject of the course."),
  courseOutline: z
    .string()
    .describe("A simple outline of the course content."),
});

// Define the output schema for the flow
export const courseMaterialGeneratorOutputSchema = z.object({
  studyMaterials: z
    .string()
    .describe("Generated study materials for the course."),
  evaluations: z
    .string()
    .describe("Generated evaluations for the course."),
  quizzes: z.string().describe("Generated quizzes for the course."),
});

// Define the Genkit flow
export const courseGenerationFlow = ai.defineFlow({
  name: "courseMaterialGenerator",
  inputSchema: z.object({
    courseSubject: z.string().describe("The subject of the course."),
    courseOutline: z
      .string()
      .describe("A simple outline of the course content."),
  }),
  outputSchema: z.object({
    studyMaterials: z
      .string()
      .describe("Generated study materials for the course."),
    evaluations: z
      .string()
      .describe("Generated evaluations for the course."),
    quizzes: z.string().describe("Generated quizzes for the course."),
  }),
});

const courseGenerationPrompt = ai.definePrompt({
  name: 'courseGenerationPrompt',
  input: courseGenerationFlow.inputSchema,
  output: courseGenerationFlow.outputSchema,
  prompt: `Generate study materials, evaluations, and quizzes for a course on the subject "{{{courseSubject}}}" with the following outline:\n\n{{{courseOutline}}}\n\nProvide the output as a JSON object with keys "studyMaterials", "evaluations", and "quizzes". The values for each key should be strings containing the respective generated content.`,
});

export async function courseGeneration(
  input: z.infer<typeof courseGenerationFlow.inputSchema>
): Promise<z.infer<typeof courseGenerationFlow.outputSchema>> {
  return courseGenerationFlow(input);
}

courseGenerationFlow.on(async input => {
  // Use AI model to generate course materials based on input
  const {output} = await courseGenerationPrompt(input);
  return output!;
});

  });

  // Parse the AI response and extract study materials, evaluations, and quizzes
  // This is a simplified example; you might need more sophisticated parsing
  const text = response.text();

  const studyMaterialsMatch = text.match(/Study Materials:\n([\s\S]*?)\nEvaluations:/);
  const evaluationsMatch = text.match(/Evaluations:\n([\s\S]*?)\nQuizzes:/);
  const quizzesMatch = text.match(/Quizzes:\n([\s\S]*)$/);

  const studyMaterials = studyMaterialsMatch ? studyMaterialsMatch[1].trim() : "Could not generate study materials.";
  const evaluations = evaluationsMatch ? evaluationsMatch[1].trim() : "Could not generate evaluations.";
  const quizzes = quizzesMatch ? quizzesMatch[1].trim() : "Could not generate quizzes.";


  return {
    studyMaterials: studyMaterials,
    evaluations: evaluations,
    quizzes: quizzes,
  };
});