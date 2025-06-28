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

export function AudioSummaryGenerator() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
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
        description: 'Please upload a chart/diagram and provide a description.',
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
        title: 'Error Generating Audio',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    toast({
      title: "Published!",
      description: "The audio summary has been published to your course."
    })
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mic className="text-primary" /> Audio Summary Creation</CardTitle>
        <CardDescription>Generate audio summaries for charts, diagrams, and other visual content.</CardDescription>
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
          <Label htmlFor="chart-description">Description & Key Insights</Label>
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
            <Label>Generated Audio Summary</Label>
            <audio src={audioDataUri} controls className="w-full mt-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleGenerateSummary} disabled={!imageDataUri || !description || isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Audio'}
        </Button>
        <Button onClick={handlePublish} disabled={!audioDataUri}>
            <Send className="mr-2 h-4 w-4" /> Publish
        </Button>
      </CardFooter>
    </Card>
  );
}
