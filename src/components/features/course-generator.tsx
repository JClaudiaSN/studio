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
import { generateContent } from '@/ai/flows/course-generation';
import { createAudioDescription } from '@/ai/flows/audio-description-creation';

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
  const [topicText, setTopicText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
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
      setTopicText(result.studyMaterials)
    } catch (error) {
      console.error('Failed to generate course:', error);
      // Optionally display an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudioDescription = async () => {
    if (!topicText) {
      toast({
        title: 'Missing Information',
        description: 'Por favor, genera el contenido del tema antes de generar el audio.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAudioDataUri(null);
    try {
      const result = await createAudioDescription({ textDescription: topicText });
      setAudioDataUri(result.audioDataUri);
    } catch (error) {
      toast({
        title: 'Error al generar audio',
        description: 'Algo salió mal. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePublish = async () => {
    if (!output) {
      toast({
        title: "No content to publish",
        description: "Generate content first before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Publish Study Materials (Readings)
      await fetch(`/api/classroom/courses/${courseId}/courseMaterials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...output, subject: courseSubject, audioDataUri: audioDataUri}),
      });

      toast({
        title: "¡Publicado!",
        description: "El contenido estructurado ha sido publicado en tu curso.",
      });
    } catch (error) {
      console.error('Failed to publish content:', error);
      toast({ title: 'Publication failed', description: 'There was an error publishing the content.', variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  }
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="text-primary" /> Generacion de contenidos</CardTitle>
        <CardDescription>Genera tu contenido de texto.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="subject">Tema</Label>
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
              <h3 className="text-lg font-semibold">Materiales de Lectura Generado</h3>
              <div className="mt-2 p-4 border rounded-md whitespace-pre-wrap">
                {output.studyMaterials}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Evaluacion Generada</h3>
              <div className="mt-2 p-4 border rounded-md whitespace-pre-wrap">
                {output.evaluations}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Cuestionario Generado</h3>
              <div className="mt-2 p-4 border rounded-md whitespace-pre-wrap">
                {output.quizzes}
              </div>
            </div>
          </div>
          
        )}
        {!isLoading && audioDataUri && (
          <div>
            <Label>Descripción de Audio Generado</Label>
            <audio src={audioDataUri} controls className="w-full mt-2" />
          </div>
        )}
        <Button onClick={handleGenerateCourse} disabled={isLoading}>
                <Sparkles className="mr-3 h-4 w-3" />
                {isLoading ? 'Analizando...' : 'Generar Contenido'}
              </Button>
      </CardContent>
      <CardFooter className="flex justify-between">
              
              <Button onClick={handleGenerateAudioDescription} disabled={!output || isPublishing}>
                <Sparkles className="mr-3 h-4 w-3" />
                {isLoading ? 'Generando...' : 'Generar Audio'}
              </Button>
              <Button onClick={handlePublish} disabled={!output || isPublishing}>
                <Send className="mr-3 h-4 w-3" /> Publicar
              </Button>
      </CardFooter>
    </Card>
  );
}