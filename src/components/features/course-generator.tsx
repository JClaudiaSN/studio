'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateAltText } from '@/ai/flows/image-alt-text-generation';
import { ImageIcon, Sparkles, Send, FileText} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { generateContent, GenerateContentInputSchema } from '@/ai/flows/course-generation';

interface CourseGenerationInput {
  subject: string;
  outline: string;
}

interface CourseGenerationOutput {
  studyMaterials: string;
  evaluations: string;
  quizzes: string;
}

export function CourseGenerator({ courseId }: { courseId: string}) {
  const [courseSubject, setCourseSubject] = useState('');
  const [courseOutline, setCourseOutline] = useState('');
  const [output, setOutput] = useState<CourseGenerationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handleGenerateCourse = async () => {
    if (!courseSubject || !courseOutline) {
      toast({
        title: 'No se proporcionó contenido',
        description: 'Por favor, introduce el contenido del curso para analizar.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setOutput(null); // Clear previous output
    try {
      const result = await generateContent({ courseSubject, courseOutline });
      setOutput(result);
    } catch (error) {
      console.error('Failed to generate course:', error);
      // Optionally display an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

    const handlePublish = () => {
    toast({
      title: "¡Publicado!",
      description: "El contenido estructurado ha sido publicado en tu curso."
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="text-primary" /> Generacion de contenidos</CardTitle>
        <CardDescription>Genera tu contenido de texto.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="subject">Materia del Curso</Label>
          <Input
            id="subject"
            name="subject"
            value={courseSubject}
            onChange={(e) => setCourseSubject(e.target.value)}
            placeholder="Ej. Logaritmos para secundaria"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="outline">Esquema del Contenido</Label>
          <Textarea
            id="outline"
            name="outline"
            value={courseOutline}
            onChange={(e) => setCourseOutline(e.target.value)}
            placeholder="Proporciona un esquema simple del contenido del curso..."
            rows={6}
          />
        </div>

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
      <CardFooter className="flex justify-between">
              <Button onClick={handleGenerateCourse} disabled={isLoading}>
       <Sparkles className="mr-2 h-4 w-4" />
       {isLoading ? 'Analizando...' : 'Obtener Contenido'}
              </Button>
              <Button onClick={handlePublish} disabled={!output}>
       <Send className="mr-2 h-4 w-4" /> Publicar
              </Button>
            </CardFooter>
    </Card>
  );
}