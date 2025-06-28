'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CourseGenerationInput {
  subject: string;
  outline: string;
}

interface CourseGenerationOutput {
  studyMaterials: string;
  evaluations: string;
  quizzes: string;
}

export function CourseGenerator() {
  const [input, setInput] = useState<CourseGenerationInput>({ subject: '', outline: '' });
  const [output, setOutput] = useState<CourseGenerationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateCourse = async () => {
    setIsLoading(true);
    setOutput(null); // Clear previous output
    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: CourseGenerationOutput = await response.json();
      setOutput(data);
    } catch (error) {
      console.error('Failed to generate course:', error);
      // Optionally display an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generador de Curso</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="subject">Materia del Curso</Label>
          <Input
            id="subject"
            name="subject"
            value={input.subject}
            onChange={handleInputChange}
            placeholder="Ej. Logaritmos para secundaria"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="outline">Esquema del Contenido</Label>
          <Textarea
            id="outline"
            name="outline"
            value={input.outline}
            onChange={handleInputChange}
            placeholder="Proporciona un esquema simple del contenido del curso..."
            rows={6}
          />
        </div>
        <Button onClick={handleGenerateCourse} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Curso'}
        </Button>

        {output && (
          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-semibold">Materiales de Estudio Generados</h3>
              <div className="mt-2 p-4 border rounded-md whitespace-pre-wrap">
                {output.studyMaterials}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Evaluaciones Generadas</h3>
              <div className="mt-2 p-4 border rounded-md whitespace-pre-wrap">
                {output.evaluations}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Cuestionarios Generados</h3>
              <div className="mt-2 p-4 border rounded-md whitespace-pre-wrap">
                {output.quizzes}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}