"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createAudioSummary } from '@/ai/flows/audio-summary-creation';
import { Mic, Sparkles, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AudioSummaryGenerator({ courseId }: { courseId: string }) {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImageDataUri(loadEvent.target?.result as string);
        setAudioDataUri(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSummary = async () => {
    if (!imageDataUri || !description) {
      toast({
        title: 'Missing Information',
 description: 'Por favor, sube un gráfico/diagrama y proporciona una descripción.',
 variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAudioDataUri(null);
    try {
      const result = await createAudioSummary({ imageDataUri, description });
      setAudioDataUri(result.audioDataUri);
    } catch (error) {
      console.error(error);
      toast({
 title: 'Error al generar audio',
 description: 'Algo salió mal. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!imageDataUri || !audioDataUri || !description) return;
    setIsPublishing(true);
    try {
      // const response = await fetch()
      const response = await fetch(`/api/classroom/courses/${courseId}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataUri, audioDataUri, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish audio summary');
      }

      toast({
 title: "¡Publicado!",
 description: "El resumen de audio se ha publicado en tu curso."
      })
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error Publishing',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mic className="text-primary" /> Generador de Resúmenes de Audio</CardTitle>
        <CardDescription>Genera resúmenes para tu contenido de audio usando IA.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chart-upload">Upload Chart/Diagram</Label>
          <Input id="chart-upload" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        {imageDataUri && (
          <div className="relative w-full h-64 rounded-md overflow-hidden border bg-white">
            <Image src={imageDataUri} alt="Chart or diagram preview" fill className="object-contain" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="chart-description">Descripción y Puntos Clave</Label>
          <Textarea
            id="chart-description"
            placeholder="Describe the chart and what students should learn from it..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        {isLoading && <Skeleton className="w-full h-14 rounded-md" />}
        {!isLoading && audioDataUri && (
          <div>
            <Label>Resumen de Audio Generado</Label>
            <audio src={audioDataUri} controls className="w-full mt-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleGenerateSummary} disabled={!imageDataUri || !description || isLoading || isPublishing}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generando...' : 'Generar Audio'}
        </Button>
        <Button onClick={handlePublish} disabled={!audioDataUri || isLoading || isPublishing}>
            <Send className="mr-2 h-4 w-4" /> 
            {isPublishing ? 'Publicando...' : 'Publicar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
