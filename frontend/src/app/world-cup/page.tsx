'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, Chip, Skeleton } from '@heroui/react';
import Input from '@/components/Input';
import { 
  Trophy, 
  Search, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  BookOpen,
  Award,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// A-Z Guide data for the World Cup
const AZ_GUIDE = [
  { letter: 'A', title: 'Accessibility', description: 'Priority parking, wheelchair-accessible entrances, and sensory rooms are available at all stadiums. Support is bookable via the Accessibility tab.' },
  { letter: 'B', title: 'Bags & Security', description: 'Only clear bags matching size requirements (max 12"x6"x12") are allowed inside. Standard security screening applies at all gate entries.' },
  { letter: 'C', title: 'Concessions', description: 'A wide range of international cuisines, local treats, and FIFA sponsor beverages are available. Order ahead using the Food Concessions page.' },
  { letter: 'D', title: 'Digital Tickets', description: 'All tickets are 100% digital. Add your ticket to your phone wallet and scan the QR code at your entrance gate.' },
  { letter: 'E', title: 'Emergency Services', description: 'First-aid stations and security personnel are located in every concourse section. Report incidents instantly through the Emergency Center.' },
  { letter: 'F', title: 'Fan Zones', description: 'Official FIFA Fan Festivals are situated outside the stadium perimeter, featuring giant screens, live music, and sponsor activations.' },
  { letter: 'G', title: 'Gates & Entry', description: 'Gates open 3 hours prior to kickoff. Check the Crowd Intel heatmaps to avoid queue bottlenecks at peak arrival times.' },
  { letter: 'H', title: 'Hospitality', description: 'VIP suites and club-level lounges offer premium food and drinks. Access is permitted only with valid hospitality ticket badges.' },
  { letter: 'I', title: 'Information Desks', description: 'Information desks are staffed by volunteers near Gates A, C, and E to assist with directions, lost & found, and general questions.' },
  { letter: 'J', title: 'Jersey & Merch', description: 'Official tournament merchandise stands are located on the main concourse levels. Mobile payment is preferred.' },
  { letter: 'K', title: 'Kick-off Times', description: 'Verify match timings on this page. All match times automatically adjust to the local stadium timezone.' },
  { letter: 'L', title: 'Lost & Found', description: 'Report lost items at any Information Desk. Items will be held at the main stadium operations center for 48 hours post-match.' },
  { letter: 'M', title: 'Medical Aid', description: 'Red Cross medical stations are marked with red crosses. Certified medical staff are on standby throughout the tournament.' },
  { letter: 'N', title: 'Navigation Maps', description: 'Use our interactive 3D navigation module to get turn-by-turn walking paths to your seat, closest food stall, or restrooms.' },
  { letter: 'O', title: 'Official App', description: 'StadiumPilot AI serves as your digital companion. Ask our AI Assistant any question for real-time answers.' },
  { letter: 'P', title: 'Parking', description: 'Pre-book your stadium parking pass. Shuttle buses run continuously from parking hubs to main gates.' },
  { letter: 'Q', title: 'Queues & Congestion', description: 'Check crowd indicators in real-time. Yellow/Red zones highlight dense areas to help you plan your movements.' },
  { letter: 'R', title: 'Restrooms', description: 'Gender-neutral, family, and accessible restrooms are distributed evenly on all concourses. Use the map to find the nearest empty ones.' },
  { letter: 'S', title: 'Stadium Rules', description: 'No professional cameras, banners larger than 2x1.5m, or outside food/liquids are permitted inside.' },
  { letter: 'T', title: 'Transportation', description: 'Public transport is highly recommended. Special matchday subway lines and shuttle buses are free with a valid ticket.' },
  { letter: 'U', title: 'Update Settings', description: 'Customize your language and accessibility preferences in the Settings page to optimize your tournament experience.' },
  { letter: 'V', title: 'Volunteers', description: 'Over 5,000 volunteers are on-site in bright purple uniforms. Don\'t hesitate to ask them for directions or assistance.' },
  { letter: 'W', title: 'Wi-Fi Access', description: 'Free high-speed stadium Wi-Fi is available. Connect to "#FIFA26_FREE_WIFI" for uninterrupted internet.' },
  { letter: 'X', title: 'X-Ray Scanning', description: 'Airport-style metal detectors and bag scanners are operating at all perimeter entry gates for maximum security.' },
  { letter: 'Y', title: 'Youth Support', description: 'Lost child wristbands can be retrieved at any gate. Designated child safety desks are operated by security services.' },
  { letter: 'Z', title: 'Zones', description: 'Stadiums are split into color-coded seating zones (North, South, East, West). Follow the color signage on your digital ticket.' },
];

export default function WorldCupHub() {
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'guide'>('matches');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all matches from the API
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['allMatches'],
    queryFn: () => api.get('/api/matches').then((res) => res.data),
  });

  // Filter A-Z guide based on search query
  const filteredGuide = AZ_GUIDE.filter(
    (item) => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.letter.toLowerCase() === searchQuery.toLowerCase()
  );

  // Group standings mock data
  const groups = [
    {
      name: 'Group A',
      teams: [
        { rank: 1, name: 'Argentina', played: 3, points: 7, gd: '+4' },
        { rank: 2, name: 'France', played: 3, points: 6, gd: '+3' },
        { rank: 3, name: 'Morocco', played: 3, points: 4, gd: '0' },
        { rank: 4, name: 'USA', played: 3, points: 0, gd: '-7' },
      ]
    },
    {
      name: 'Group B',
      teams: [
        { rank: 1, name: 'England', played: 3, points: 9, gd: '+6' },
        { rank: 2, name: 'Germany', played: 3, points: 4, gd: '+1' },
        { rank: 3, name: 'Japan', played: 3, points: 3, gd: '-2' },
        { rank: 4, name: 'Mexico', played: 3, points: 1, gd: '-5' },
      ]
    }
  ];

  // Top player stats mock
  const stats = {
    topScorers: [
      { name: 'Kylian Mbappé', team: 'France', goals: 6 },
      { name: 'Lionel Messi', team: 'Argentina', goals: 5 },
      { name: 'Harry Kane', team: 'England', goals: 4 },
    ],
    topAssists: [
      { name: 'Antoine Griezmann', team: 'France', assists: 4 },
      { name: 'Lionel Messi', team: 'Argentina', assists: 3 },
      { name: 'Kevin De Bruyne', team: 'Belgium', assists: 3 },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'danger';
      case 'FINISHED': return 'success';
      case 'SCHEDULED': default: return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-slate-900 to-indigo-950 rounded-3xl p-8 md:p-12 text-white shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-72 w-72 rounded-full bg-secondary-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-semibold border border-primary-500/20">
              <Trophy size={14} /> FIFA World Cup 2026 Hub
            </div>
            <h2 className="text-3xl font-extrabold md:text-4xl tracking-tight">
              World Cup A-Z Portal
            </h2>
            <p className="text-sm text-slate-300">
              Your one-stop destination for live tournament fixtures, standings, stats, and the complete stadium visitor directory.
            </p>
          </div>
          <Card className="bg-white/5 border border-white/10 backdrop-blur-md max-w-xs shadow-lg text-white">
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="text-yellow-400 flex-shrink-0" size={24} />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Current Phase</p>
                <p className="text-sm font-extrabold">Knockout Stage (1/4 Finals)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1 bg-default-100/50 backdrop-blur-sm rounded-2xl w-fit border border-default-200/50">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'matches'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
              : 'text-default-600 hover:bg-default-100 hover:text-foreground'
          }`}
        >
          <Calendar size={14} /> Fixtures & Live Scores
        </button>
        <button
          onClick={() => setActiveTab('standings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'standings'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
              : 'text-default-600 hover:bg-default-100 hover:text-foreground'
          }`}
        >
          <TrendingUp size={14} /> Standings & Stats
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'guide'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
              : 'text-default-600 hover:bg-default-100 hover:text-foreground'
          }`}
        >
          <BookOpen size={14} /> A-Z Visitor Directory
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {/* Tab 1: Matches */}
          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {matchesLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <Card key={idx} className="glass-card border border-default-100">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-12 rounded-lg" />
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <Skeleton className="h-6 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-6 w-24 rounded-lg" />
                      </div>
                      <Skeleton className="h-4 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))
              ) : matches && matches.length > 0 ? (
                matches.map((match: any) => (
                  <Card key={match.id} className="glass-card hover-glow border border-default-100 shadow-sm transition-all duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-default-400">
                          <Clock size={12} />
                          <span>{new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={getStatusColor(match.status)}
                          className="font-semibold uppercase tracking-wider text-[10px]"
                        >
                          {match.status}
                        </Chip>
                      </div>

                      {/* Scoreline */}
                      <div className="flex justify-between items-center py-2">
                        <div className="text-center w-1/3 space-y-1">
                          <p className="text-base font-extrabold text-foreground truncate">{match.homeTeam}</p>
                          <p className="text-[10px] text-default-400">Home</p>
                        </div>
                        
                        <div className="text-center w-1/3">
                          <p className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            {match.status === 'SCHEDULED' ? 'VS' : `${match.homeScore} - ${match.awayScore}`}
                          </p>
                          {match.status === 'LIVE' && (
                            <span className="text-[9px] text-danger-500 font-bold bg-danger-50 dark:bg-danger-950/20 px-2 py-0.5 rounded-full mt-1 inline-block animate-pulse">
                              In Play
                            </span>
                          )}
                        </div>

                        <div className="text-center w-1/3 space-y-1">
                          <p className="text-base font-extrabold text-foreground truncate">{match.awayTeam}</p>
                          <p className="text-[10px] text-default-400">Away</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-default-500 border-t border-default-100 pt-3">
                        <MapPin size={13} className="text-primary-500" />
                        <span className="truncate">{match.stadiumName || match.venue}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-sm text-default-400">No matches found.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: Standings & Stats */}
          {activeTab === 'standings' && (
            <motion.div
              key="standings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Standings Grid */}
              <div className="lg:col-span-2 space-y-6">
                {groups.map((group) => (
                  <Card key={group.name} className="glass-card border border-default-100">
                    <CardHeader className="px-6 pt-6 pb-2">
                      <h3 className="font-extrabold text-sm text-foreground">{group.name}</h3>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-2">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-default-100 text-default-400 font-semibold uppercase tracking-wider text-[10px]">
                              <th className="py-2.5 w-10">Pos</th>
                              <th className="py-2.5">Team</th>
                              <th className="py-2.5 text-center w-12">P</th>
                              <th className="py-2.5 text-center w-12">GD</th>
                              <th className="py-2.5 text-center w-12">Pts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.teams.map((t) => (
                              <tr key={t.name} className="border-b border-default-50 last:border-0 hover:bg-default-50/50 transition-all font-medium">
                                <td className="py-3 font-extrabold text-default-500">{t.rank}</td>
                                <td className="py-3 font-bold text-foreground">{t.name}</td>
                                <td className="py-3 text-center text-default-600">{t.played}</td>
                                <td className={`py-3 text-center ${t.gd.startsWith('+') ? 'text-success-600 font-bold' : t.gd.startsWith('-') ? 'text-danger-500' : 'text-default-500'}`}>{t.gd}</td>
                                <td className="py-3 text-center font-extrabold text-primary-500">{t.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Leaderboards */}
              <div className="space-y-6">
                {/* Top Goals */}
                <Card className="glass-card border border-default-100">
                  <CardHeader className="p-6 pb-2 flex items-center gap-2">
                    <Award className="text-yellow-500" size={16} />
                    <h3 className="font-extrabold text-sm">Top Scorers</h3>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                    <div className="space-y-3.5">
                      {stats.topScorers.map((player, idx) => (
                        <div key={player.name} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-foreground">{player.name}</p>
                            <p className="text-[10px] text-default-400">{player.team}</p>
                          </div>
                          <Chip size="sm" color="warning" variant="soft" className="font-extrabold">
                            {player.goals} Goals
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Assists */}
                <Card className="glass-card border border-default-100">
                  <CardHeader className="p-6 pb-2 flex items-center gap-2">
                    <TrendingUp className="text-primary-500" size={16} />
                    <h3 className="font-extrabold text-sm">Top Assists</h3>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                    <div className="space-y-3.5">
                      {stats.topAssists.map((player, idx) => (
                        <div key={player.name} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-foreground">{player.name}</p>
                            <p className="text-[10px] text-default-400">{player.team}</p>
                          </div>
                          <Chip size="sm" color="accent" variant="soft" className="font-extrabold">
                            {player.assists} Assists
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Tab 3: A-Z Guide */}
          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Search Box */}
              <Input
                placeholder="Search the A-Z directory (e.g. food, gates, parking)..."
                startContent={<Search size={16} className="text-default-400 mr-2" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-card max-w-xl"
              />

              {/* A-Z List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuide.length > 0 ? (
                  filteredGuide.map((item) => (
                    <Card key={item.letter} className="glass-card hover-glow border border-default-100 hover:border-primary-500/20 shadow-sm transition-all duration-300">
                      <CardHeader className="p-6 pb-2 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-primary-500/10 text-primary-500 font-extrabold flex items-center justify-center border border-primary-500/20 text-sm">
                          {item.letter}
                        </div>
                        <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-2 text-xs text-default-500 leading-relaxed">
                        {item.description}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-default-400 flex flex-col items-center gap-2">
                    <AlertCircle size={24} />
                    <p className="text-sm">No guide details match your search query.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Assistant Quick Callout */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-secondary-500/10 to-primary-500/10 border border-primary-500/20 rounded-3xl p-6 md:p-8 mt-8">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base md:text-lg flex items-center gap-2 text-foreground">
              <HelpCircle className="text-primary-500" size={20} />
              Need Help with World Cup Guidelines?
            </h3>
            <p className="text-xs text-default-500 max-w-xl">
              Ask StadiumPilot AI anything about match day rules, transit schedules, or stadium details.
            </p>
          </div>
          <a
            href="/ai-assistant"
            className="px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-xs shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex-shrink-0"
          >
            Ask AI Assistant
          </a>
        </div>
      </Card>
    </div>
  </DashboardLayout>
  );
}
