"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { contentStructuringSuggestions } from '@/ai/flows/content-structuring-suggestions';
import { FileText, Sparkles, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ContentStructuringTool() {
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (!content) {
      toast({
        title: 'No Content Provided',
        description: 'Please enter some course content to analyze.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSuggestions('');
    try {
      const result = await contentStructuringSuggestions({ content });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Getting Suggestions',
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
      description: "The structured content has been published to your course."
    })
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="text-primary" /> Content Structuring Suggestions</CardTitle>
        <CardDescription>Optimize your text content for screen readers with AI-powered structural improvements.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-content">Your Course Content</Label>
          <Textarea
            id="course-content"
            placeholder="Paste your course content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>
        {isLoading && <Skeleton className="w-full h-32 rounded-md" />}
        {!isLoading && suggestions && (
          <div className="space-y-2">
            <Label htmlFor="ai-suggestions">AI Suggestions (Editable)</Label>
            <Textarea
              id="ai-suggestions"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              rows={6}
              className="bg-accent/20 border-accent"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleGetSuggestions} disabled={!content || isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Analyzing...' : 'Get Suggestions'}
        </Button>
        <Button onClick={handlePublish} disabled={!suggestions}>
            <Send className="mr-2 h-4 w-4" /> Publish
        </Button>
      </CardFooter>
    </Card>
  );
}
