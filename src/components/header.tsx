"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accessibility, LogIn } from "lucide-react";
import React from 'react';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Accessibility className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">A11yCourseGen AI</span>
        </div>
        <div>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, Educator!</span>
              <Avatar>
                <AvatarImage src="https://placehold.co/100x100.png" alt="Educator" data-ai-hint="person portrait" />
                <AvatarFallback>ED</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Button onClick={() => setIsLoggedIn(true)}>
              <LogIn className="mr-2 h-4 w-4" /> Connect to Classroom
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
