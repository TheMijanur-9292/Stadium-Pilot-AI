'use client';
import Button from '@/components/Button';

import { useStore } from '@/store/useStore';
import { Card, CardContent, Chip } from '@heroui/react';
import { Award, Compass, ShieldCheck, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { theme, toggleTheme } = useStore();

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl -z-10"></div>

      <header className="glass-nav w-full">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              StadiumPilot AI
            </span>
          </Link>
          <Button variant="ghost" onPress={toggleTheme} size="sm">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-12 animate-fade-in">
        <div className="space-y-4 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline">
            <ArrowLeft size={12} />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            About StadiumPilot AI
          </h1>
          <p className="text-sm sm:text-base text-default-600 max-w-2xl mx-auto">
            A secure, role-contextual operations platform tailored to optimize spectator safety, concessions, and volunteer scheduling for the FIFA World Cup 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass-card border border-default-100">
            <CardContent className="p-6 space-y-3">
              <div className="p-2 w-fit rounded-xl bg-primary-500/10 text-primary-500">
                <Compass size={20} />
              </div>
              <h3 className="font-bold text-sm">Contextual Operations AI</h3>
              <p className="text-xs text-default-500 leading-relaxed">
                By leveraging Google Gemini models and parsing token payloads, StadiumPilot AI yields distinct operational guidelines tailored specifically to the user's role—ensuring fans, security, and coordinators get the right data at the right time.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-default-100">
            <CardContent className="p-6 space-y-3">
              <div className="p-2 w-fit rounded-xl bg-success-500/10 text-success-500">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-sm">Integrated Safety & Concessions</h3>
              <p className="text-xs text-default-500 leading-relaxed">
                StadiumPilot AI links crowd congestion maps with concessions queues and emergency reporting. If a high congestion bottleneck is flagged, pre-order queues adjust prep times, and visual maps route pedestrian traffic away from blockages.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="border-t border-default-100 pt-10 text-center space-y-4">
          <p className="text-xs text-default-400">
            Developed for the Hack2Skill PromptWars Challenge.
          </p>
          <div className="flex justify-center gap-2">
            <Chip size="sm" variant="soft" color="accent" className="font-semibold">NEXT.JS 15</Chip>
            <Chip size="sm" variant="soft" color="default" className="font-semibold">NESTJS</Chip>
            <Chip size="sm" variant="soft" color="success" className="font-semibold">PRISMA 7</Chip>
            <Chip size="sm" variant="soft" color="warning" className="font-semibold">GEMINI AI</Chip>
          </div>
        </div>
      </main>

      <footer className="border-t border-default-100 py-6 text-center text-xs text-default-400">
        &copy; {new Date().getFullYear()} StadiumPilot AI. All rights reserved.
      </footer>
    </div>
  );
}





