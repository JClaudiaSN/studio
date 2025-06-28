"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GraduationCap,
  CheckSquare,
  BookOpen,
  Ban,
  AtSign,
  Accessibility,
  Search,
  Bell,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { AltTextGenerator } from '@/components/features/alt-text-generator';
import { ContentStructuringTool } from '@/components/features/content-structuring-tool';
import { AudioSummaryGenerator } from '@/components/features/audio-summary-generator';

const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <GraduationCap className="w-6 h-6 text-primary" />
          </Button>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" passHref>
              <SidebarMenuButton tooltip="Dashboard">
                <Home />
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Compliance">
              <CheckSquare />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Courses" isActive>
              <div className="bg-primary/20 p-1 rounded-full">
                 <BookOpen className="h-4 w-4 text-primary" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Banned Content">
              <Ban />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Mentions">
              <AtSign />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Accessibility Settings">
              <Accessibility />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );

const AppHeader = () => {
    const { data: session, status } = useSession();
  
    return (
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline-block font-semibold">Dashboard</span>
          </Link>
        </div>
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search this course..." className="w-full pl-9" />
            </div>
        </div>
        <div className="flex items-center gap-4">
          {status === "authenticated" && session?.user ? (
            <>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar>
                <AvatarImage src={session.user.image || `https://placehold.co/100x100.png`} alt={session.user.name || "Educator"} data-ai-hint="person portrait"/>
                <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </>
          ) : null }
        </div>
      </header>
    );
};

export default function CoursePage({ params }: { params: { courseId: string } }) {
    const { status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <p>Loading...</p>
            </div>
        )
    }

    if (status !== "authenticated") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground">Please sign in to view this page.</p>
                <Link href="/">
                    <Button>Back to Home</Button>
                </Link>
            </div>
        )
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">Accessibility Tools</h1>
                        <p className="text-muted-foreground">Use these AI-powered tools to create accessible materials for course: {params.courseId}</p>
                    </div>
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                        <AltTextGenerator courseId={params.courseId} />
                        <ContentStructuringTool />
                        <AudioSummaryGenerator courseId={params.courseId} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
