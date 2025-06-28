"use client"
import React, { useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
  MoreHorizontal,
  FileText,
  Users,
  Settings,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { CourseList } from '@/components/features/course-list';

const AppSidebar = () => (
  <Sidebar>
    <SidebarHeader>
      <Button variant="ghost" size="icon" className="h-10 w-10">
        <GraduationCap className="w-6 h-6 text-primary" />
      </Button>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Dashboard" isActive>
            <div className="bg-primary/20 p-1 rounded-full">
               <GraduationCap className="h-4 w-4 text-primary" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Compliance">
            <CheckSquare />
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Courses">
            <BookOpen />
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
        <h1 className="text-xl font-semibold text-muted-foreground">dashboard</h1>
      </div>
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="w-full pl-9" />
          </div>
      </div>
      <div className="flex items-center gap-4">
        {status === "authenticated" ? (
          <>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Avatar>
              <AvatarImage src={session.user?.image || `https://placehold.co/100x100.png`} alt={session.user?.name || "Educator"} data-ai-hint="person portrait"/>
              <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </>
        ) : (
          <Button variant="primary" onClick={() => signIn('google')}>
            Sync with Google Classroom
          </Button>
        )}
      </div>
    </header>
  );
};

const PendingReviewsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Course Accessibility</CardTitle>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="w-4 h-4"/> 5 Tasks</span>
                </div>
                <CardDescription>Normed 130 etto</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={80} className="h-2 mb-4" />
                <div className="flex justify-around">
                    <Button variant="ghost" size="icon"><Users className="text-muted-foreground"/></Button>
                    <Button variant="ghost" size="icon"><FileText className="text-muted-foreground"/></Button>
                    <Button variant="ghost" size="icon"><Settings className="text-muted-foreground"/></Button>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Accessibility</CardTitle>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="w-4 h-4"/> 1 Task</span>
                </div>
                <CardDescription>Aionedt tocnro</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={40} className="h-2 mb-4 [&>div]:bg-orange-400" />
                <div className="flex justify-end gap-2">
                    <Button variant="outline">View Details</Button>
                    <Button variant="primary">Adjust Settings</Button>
                </div>
            </CardContent>
        </Card>
    </div>
);


const AccessibilityPreferencesCard = () => {
    const [fontSize, setFontSize] = useState([16]);
    const [lineHeight, setLineHeight] = useState([1.5]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Accessibility Preferences</CardTitle>
                <CardDescription>Educators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="font-medium">Font Size</label>
                    <Slider value={fontSize} onValueChange={setFontSize} max={32} min={12} step={1} />
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="font-style-switch" className="font-medium">Sans-serif Font</label>
                    <Switch id="font-style-switch" defaultChecked/>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="hotkeys-switch" className="font-medium">Hotkeys</label>
                    <Switch id="hotkeys-switch" />
                </div>
                <div className="space-y-2">
                    <label className="font-medium">Line Height</label>
                    <Slider value={lineHeight} onValueChange={setLineHeight} max={2.5} min={1} step={0.1} />
                </div>
            </CardContent>
        </Card>
    );
};

const AssistantCard = () => (
    <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Real-time Transcription</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal /></Button>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 justify-between">
            <div>
                 <div className="space-y-2 mb-6">
                    <h3 className="font-medium">Color Contrast</h3>
                    <div className="flex gap-2">
                        <Input placeholder="Color contrast"/>
                        <Button>Test Page</Button>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                     <div className="flex items-center gap-3">
                         <Switch id="audio-desc" />
                         <label htmlFor="audio-desc">Audio Descriptions</label>
                     </div>
                </div>
            </div>
            <Button variant="link" className="self-end p-0 h-auto">
                Go to settings <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
        </CardContent>
    </Card>
)

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8">
          {status === "authenticated" ? (
            <>
              <h1 className="text-2xl font-bold mb-6">Google Classroom</h1>
              <div className="grid gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-2 space-y-6">
                      <CourseList />
                      <h2 className="font-bold text-lg">Pending Reviews</h2>
                      <PendingReviewsSection />
                  </div>
                  <div className="space-y-6">
                      <AccessibilityPreferencesCard />
                      <AssistantCard />
                  </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-center">
                <h2 className="text-2xl font-bold">Welcome to A11yCourseGen AI</h2>
                <p className="text-muted-foreground">Please sign in with your Google account to sync with Google Classroom and start creating accessible course materials.</p>
                <Button onClick={() => signIn('google')}>
                    <LogIn className="mr-2 h-4 w-4" /> Sign In with Google
                </Button>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
