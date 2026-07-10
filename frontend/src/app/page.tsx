'use client';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';

import { useStore } from '@/store/useStore';
import {
  Card,
  CardContent,
  Chip,
} from '@heroui/react';
import {
  Zap,
  MapPin,
  Utensils,
  Shield,
  Activity,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  Smile,
  ShieldAlert,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { theme, toggleTheme, user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const features = [
    {
      icon: Compass,
      title: 'Navigation Assistant',
      desc: 'Interactive, accessibility-first stadium layout mapping to find seats, gates, and concessions without hassle.',
    },
    {
      icon: Sparkles,
      title: 'Role-Contextual AI',
      desc: 'Smart assistant powered by Gemini that understands if you are a fan, volunteer, staff member, or organizer.',
    },
    {
      icon: Users,
      title: 'Crowd Intelligence',
      desc: 'Real-time density sensors mapping traffic hot-spots and queue lines to bypass congestion corridors.',
    },
    {
      icon: Utensils,
      title: 'Smart Concessions',
      desc: 'Browse concession menus, filter by dietary requirements, order in advance, and receive live wait time notifications.',
    },
    {
      icon: ShieldAlert,
      title: 'Emergency Center',
      desc: 'Instant incident reporting, panic SOS triggers, and direct dispatch coordination to guarantee stadium safety.',
    },
    {
      icon: Calendar,
      title: 'Operations Dashboard',
      desc: 'Full-scale coordination module for organizers to assign volunteer duties, watch match statuses, and monitor logs.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="glass-nav sticky top-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              StadiumPilot AI
            </span>
            <Chip size="sm" variant="soft" color="accent" className="text-[10px] font-semibold">
              WC 2026
            </Chip>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-default-600">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onPress={toggleTheme}
              className="text-xs"
              size="sm"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>

            {user ? (
              <Button
                
                href="/dashboard"
                color="primary"
                radius="full"
                size="sm"
                className="font-medium shadow-md shadow-primary-500/20"
              >
                Go to Dashboard
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  
                  href="/login"
                  variant="ghost"
                  size="sm"
                  className="font-medium"
                >
                  Log In
                </Button>
                <Button
                  
                  href="/register"
                  color="primary"
                  radius="full"
                  size="sm"
                  className="font-medium shadow-md shadow-primary-500/20"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-secondary-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <div className="max-w-4xl space-y-6">
          <Chip
            variant="soft"
            color="default"
            className="px-3"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-secondary-500" />
              Empowering FIFA World Cup 2026
            </span>
          </Chip>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            AI-Powered Smart Stadium &{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Tournament Operations
            </span>
          </h1>

          <p className="text-lg text-default-600 max-w-2xl mx-auto">
            A complete intelligent platform for fans, volunteers, venue staff, and organizers. 
            Elevating game-day convenience, logistics, and emergency readiness in real time.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              
              href="/register"
              color="primary"
              size="lg"
              radius="full"
              className="font-semibold shadow-lg shadow-primary-500/20"
              endContent={<ArrowRight size={16} />}
            >
              Get Started for Free
            </Button>
            <Button
              
              href="/login"
              variant="primary"
              size="lg"
              radius="full"
              className="font-semibold"
            >
              Access Platform Demo
            </Button>
          </div>
        </div>

        {/* Dashboard Preview Screenshot */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-default-100 bg-content1/20 p-2 shadow-2xl backdrop-blur-sm relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-secondary-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Image
            src="/dashboard_mockup.png"
            alt="StadiumPilot AI Dashboard Mockup"
            width={1200}
            height={675}
            className="rounded-xl border border-default-100 shadow-lg object-cover"
            priority
          />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-content1/50 border-y border-default-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered for Every Operational Layer
            </h2>
            <p className="text-default-600 max-w-2xl mx-auto">
              StadiumPilot AI isn’t just another chatbot. It’s an intelligent operations console 
              specifically tailored for fans, volunteers, concession stands, and supervisors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="glass-card hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="p-3 w-fit rounded-2xl bg-primary-500/10 text-primary-500">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-default-500 leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / Stats Section */}
      <section id="stats" className="py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tournament-Grade Logistics at Scale
              </h2>
              <p className="text-default-600 leading-relaxed">
                The FIFA World Cup 2026 will be the largest tournament in history, spanning three countries and hosting 48 teams. 
                StadiumPilot AI acts as the connective nervous system, utilizing real-time sensor loops and Generative AI 
                to coordinate crowd routing, food order queues, volunteer shifts, and security dispatch.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-1 h-fit rounded-full bg-success-500/20 text-success-500 mt-1">
                    <Zap size={14} />
                  </div>
                  <p className="text-sm text-default-600">
                    <span className="font-semibold text-foreground">Zero-Lag Dispatches:</span> Direct task routing to nearest volunteers.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="p-1 h-fit rounded-full bg-success-500/20 text-success-500 mt-1">
                    <Zap size={14} />
                  </div>
                  <p className="text-sm text-default-600">
                    <span className="font-semibold text-foreground">Dynamic Wait Estimation:</span> Algorithms predicting food court wait times.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="p-1 h-fit rounded-full bg-success-500/20 text-success-500 mt-1">
                    <Zap size={14} />
                  </div>
                  <p className="text-sm text-default-600">
                    <span className="font-semibold text-foreground">SOS Direct Link:</span> Priority alarm triggers routed straight to venue staff.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Block */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center border border-default-100 bg-content1/50">
                <p className="text-4xl font-extrabold text-primary-500">16</p>
                <p className="text-sm text-default-500 mt-2 font-medium">Host Cities</p>
              </Card>
              <Card className="p-6 text-center border border-default-100 bg-content1/50">
                <p className="text-4xl font-extrabold text-secondary-500">48</p>
                <p className="text-sm text-default-500 mt-2 font-medium">Teams</p>
              </Card>
              <Card className="p-6 text-center border border-default-100 bg-content1/50">
                <p className="text-4xl font-extrabold text-secondary-500">104</p>
                <p className="text-sm text-default-500 mt-2 font-medium">Matches</p>
              </Card>
              <Card className="p-6 text-center border border-default-100 bg-content1/50">
                <p className="text-4xl font-extrabold text-primary-500">3.2M+</p>
                <p className="text-sm text-default-500 mt-2 font-medium">Live Fans</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-content1/50 border-t border-default-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">What Operations Leaders Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border border-default-100 bg-background/50">
              <CardContent className="p-0 space-y-4">
                <p className="text-sm italic text-default-600 leading-relaxed">
                  "StadiumPilot AI transformed how we run operations at MetLife. Having crowd density metrics integrated with our volunteer dispatcher slashed response times for security incidents by 40%."
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name="Marcus Vance" color="accent" />
                  <div>
                    <p className="text-sm font-semibold">Marcus Vance</p>
                    <p className="text-xs text-default-500">Venue Director, MetLife Stadium</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border border-default-100 bg-background/50">
              <CardContent className="p-0 space-y-4">
                <p className="text-sm italic text-default-600 leading-relaxed">
                  "As a volunteer, I used to feel lost in the crowd. With this app, my task checklist was updated live, and I could report spills or ticket queue bottlenecks immediately. Absolute game-changer."
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name="Elena Rostova" color="success" />
                  <div>
                    <p className="text-sm font-semibold">Elena Rostova</p>
                    <p className="text-xs text-default-500">Volunteer Lead, Vancouver BC Place</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border border-default-100 bg-background/50">
              <CardContent className="p-0 space-y-4">
                <p className="text-sm italic text-default-600 leading-relaxed">
                  "Pre-ordering food while watching the live score ticker was amazing. I bypassed a huge queue and got vegan tacos in under 4 minutes. Accessibility mapping made finding elevators a breeze!"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name="Frankie Fan" color="default" />
                  <div>
                    <p className="text-sm font-semibold">Frankie Fan</p>
                    <p className="text-xs text-default-500">Tournament Spectator, England Fan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="group bg-content1 border border-default-100 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex justify-between items-center font-bold text-sm cursor-pointer list-none text-foreground select-none">
              <span>How does the AI understand different user roles?</span>
              <span className="transition-transform duration-300 group-open:rotate-180 text-default-400">
                <ChevronDown size={16} />
              </span>
            </summary>
            <p className="mt-4 text-xs text-default-600 leading-relaxed dark:text-default-400">
              The platform reads your authenticated user profile JWT. Depending on whether your role is Fan, Volunteer, Venue Staff, or Organizer, StadiumPilot AI automatically adjusts its UI widgets and feeds specific prompts to the Gemini model to provide highly contextual operations guidelines.
            </p>
          </details>

          <details className="group bg-content1 border border-default-100 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex justify-between items-center font-bold text-sm cursor-pointer list-none text-foreground select-none">
              <span>Is this application optimized for mobile screens?</span>
              <span className="transition-transform duration-300 group-open:rotate-180 text-default-400">
                <ChevronDown size={16} />
              </span>
            </summary>
            <p className="mt-4 text-xs text-default-600 leading-relaxed dark:text-default-400">
              Yes! StadiumPilot AI is designed mobile-first. It includes a fully responsive design, touch-friendly layouts, and keyboard accessibility, allowing users inside the stadium to operate the app on their phone or tablet.
            </p>
          </details>

          <details className="group bg-content1 border border-default-100 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex justify-between items-center font-bold text-sm cursor-pointer list-none text-foreground select-none">
              <span>How are concession queue wait times calculated?</span>
              <span className="transition-transform duration-300 group-open:rotate-180 text-default-400">
                <ChevronDown size={16} />
              </span>
            </summary>
            <p className="mt-4 text-xs text-default-600 leading-relaxed dark:text-default-400">
              Concession wait times are simulated by compiling a vendor's baseline preparation speed combined with the current volume of active cart orders, multiplying estimated prep times by order quantities in real-time.
            </p>
          </details>

          <details className="group bg-content1 border border-default-100 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex justify-between items-center font-bold text-sm cursor-pointer list-none text-foreground select-none">
              <span>Does the platform support offline mode?</span>
              <span className="transition-transform duration-300 group-open:rotate-180 text-default-400">
                <ChevronDown size={16} />
              </span>
            </summary>
            <p className="mt-4 text-xs text-default-600 leading-relaxed dark:text-default-400">
              StadiumPilot AI caches critical details locally (like tickets and maps) via local storage so that even if stadium connectivity is weak, fans can access their entry QR codes.
            </p>
          </details>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <Card className="glass-card p-8 md:p-16 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary-500/10 rounded-full blur-2xl"></div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Take Flight?
          </h2>
          <p className="text-default-600 max-w-xl mx-auto text-sm sm:text-base">
            Join the platform designed to pilot World Cup 2026 venue operations and fan experience. Secure, intelligent, and real-time.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              
              href="/register"
              color="primary"
              size="lg"
              radius="full"
              className="font-semibold"
            >
              Sign Up Now
            </Button>
            <Button
              
              href="/login"
              variant="primary"
              size="lg"
              radius="full"
              className="font-semibold text-foreground"
            >
              Platform Login
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-default-100 py-12 px-6 bg-content1/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-lg font-bold text-foreground">StadiumPilot AI</p>
            <p className="text-xs text-default-500">
              Smart Stadium & Tournament Operations Platform for FIFA World Cup 2026.
            </p>
          </div>

          <div className="flex gap-6 text-sm text-default-500">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#stats" className="hover:text-foreground">Stats</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link href="/about" className="hover:text-foreground">About</Link>
          </div>

          <p className="text-xs text-default-400">
            &copy; {new Date().getFullYear()} StadiumPilot AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}






