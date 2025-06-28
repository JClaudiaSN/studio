import { Header } from "@/components/header";
import { AltTextGenerator } from "@/components/features/alt-text-generator";
import { AudioSummaryGenerator } from "@/components/features/audio-summary-generator";
import { ContentStructuringTool } from "@/components/features/content-structuring-tool";
import { Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/20 p-3 rounded-full">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">A11yCourseGen AI Dashboard</h1>
              <p className="text-muted-foreground">Your intelligent assistant for creating accessible courses.</p>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <AltTextGenerator />
              <ContentStructuringTool />
            </div>
            <div className="flex flex-col gap-8">
              <AudioSummaryGenerator />
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 px-8 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} A11yCourseGen AI. All rights reserved.
      </footer>
    </div>
  );
}
