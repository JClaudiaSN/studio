"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateEvaluation, GenerateEvaluationOutput } from '@/ai/flows/evaluation-generation';
import { FileQuestion, Sparkles, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function EvaluationGenerator({ courseId }: { courseId: string }) {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [evaluation, setEvaluation] = useState<GenerateEvaluationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handleGenerateEvaluation = async () => {
    if (!topic) {
      toast({
        title: 'No Topic Provided',
        description: 'Please enter a topic for the evaluation.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setEvaluation(null);
    try {
      const result = await generateEvaluation({ topic, numQuestions });
      setEvaluation(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Evaluation',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!evaluation) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/classroom/courses/${courseId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: evaluation.title, description: evaluation.quizContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish assignment');
      }

      toast({
        title: "Published!",
        description: "The evaluation has been published as an assignment to your course."
      });
      setEvaluation(null);
      setTopic('');
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
        <CardTitle className="flex items-center gap-2"><FileQuestion className="text-primary" /> Evaluation Generation</CardTitle>
        <CardDescription>Generate a quiz or evaluation based on a topic and publish it as an assignment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="evaluation-topic">Topic</Label>
          <Input id="evaluation-topic" placeholder="e.g., Photosynthesis, World War II" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="num-questions">Number of Questions ({numQuestions})</Label>
          <Input id="num-questions" type="range" min="1" max="10" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))} />
        </div>
        
        {isLoading && <Skeleton className="w-full h-48 rounded-md" />}
        {!isLoading && evaluation && (
          <div className="space-y-2">
            <Label htmlFor="evaluation-output">AI-Generated Evaluation (Editable)</Label>
            <Textarea
              id="evaluation-output"
              placeholder="AI-generated quiz will appear here..."
              value={evaluation.quizContent}
              onChange={(e) => {
                if(evaluation) {
                  setEvaluation({...evaluation, quizContent: e.target.value})
                }
              }}
              rows={10}
              className="bg-accent/20 border-accent font-mono text-xs"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleGenerateEvaluation} disabled={!topic || isLoading || isPublishing}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Evaluation'}
        </Button>
        <Button onClick={handlePublish} disabled={!evaluation || isLoading || isPublishing}>
            <Send className="mr-2 h-4 w-4" />
            {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </CardFooter>
    </Card>
  );
}
