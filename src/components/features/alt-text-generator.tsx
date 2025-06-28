"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateAltText } from '@/ai/flows/image-alt-text-generation';
import { ImageIcon, Sparkles, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AltTextGenerator({ courseId }: { courseId: string }) {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImageDataUri(loadEvent.target?.result as string);
        setAltText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAltText = async () => {
    if (!imageDataUri) {
      toast({
        title: 'No Image Selected',
 description: 'Por favor, sube una imagen primero.',
 variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateAltText({ photoDataUri: imageDataUri });
      setAltText(result.altText);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Alt Text',
 description: 'Algo salió mal. Por favor, inténtalo de nuevo.',
 variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePublish = async () => {
    if (!imageDataUri || !altText) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/classroom/courses/${courseId}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataUri, altText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish material');
      }

      toast({
 title: "¡Publicado!",
 description: "La imagen y su texto alternativo han sido publicados en tu curso."
      });
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
        <CardTitle className="flex items-center gap-2"><ImageIcon className="text-primary" /> Generador de Texto Alternativo para Imágenes</CardTitle>
        <CardDescription>Sube una imagen y nuestra IA generará un texto alternativo descriptivo para la accesibilidad.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Image</Label>
          <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary-foreground" />
        </div>
        {imageDataUri && (
          <div className="relative w-full h-64 rounded-md overflow-hidden border bg-white">
            <Image src={imageDataUri} alt={altText || "Image preview"} fill className="object-contain" />
          </div>
        )}
        {isLoading && <Skeleton className="w-full h-24 rounded-md" />}
        {!isLoading && (altText || imageDataUri) && (
          <div className="space-y-2">
            <Label htmlFor="alt-text-output">Texto Alternativo Generado por IA (Editable)</Label>
            <Textarea
              id="alt-text-output"
              placeholder="AI-generated alt text will appear here..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleGenerateAltText} disabled={!imageDataUri || isLoading || isPublishing}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generando...' : 'Generar Texto Alternativo'}
        </Button>
        <Button onClick={handlePublish} disabled={!altText || isLoading || isPublishing}>
            <Send className="mr-2 h-4 w-4" />
            {isPublishing ? 'Publicando...' : 'Publicar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
