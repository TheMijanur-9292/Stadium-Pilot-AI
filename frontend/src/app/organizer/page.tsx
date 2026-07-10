'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Button, Chip, Skeleton } from '@heroui/react';
import { ShieldAlert, RefreshCw, Trophy, Calendar, Power, Wifi, Droplet, Users, Award, ShieldAlert as AlertIcon, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerPage() {
  const { user } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['allMatches'],
    queryFn: () => api.get('/api/matches').then((res) => res.data),
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.get('/api/emergency/incidents').then((res) => res.data),
  });

  const { data: sensors } = useQuery({
    queryKey: ['sensors'],
    queryFn: () => api.get('/api/crowd/sensors').then((res) => res.data),
  });

  if (!mounted || !user) return null;

  const unresolvedIncidents = incidents?.filter((i: any) => i.status !== 'RESOLVED') || [];
  const criticalSensors = sensors?.filter((s: any) => s.crowdLevel === 'CRITICAL') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary-500">
                <Users size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Attendance Analytics</span>
              </div>
              <p className="text-3xl font-extrabold text-foreground">82,450 / 82,500</p>
              <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary-500 h-full rounded-full transition-all duration-300" style={{ width: '99.8%' }}></div>
              </div>
              <p className="text-[10px] text-default-400">MetLife Stadium capacity filled at 99.8%</p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-danger-500">
                <AlertIcon size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Unresolved Security Incidents</span>
              </div>
              <p className="text-3xl font-extrabold text-danger-600 dark:text-danger-500">{unresolvedIncidents.length}</p>
              <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-danger-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${unresolvedIncidents.length > 0 ? 30 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-default-400">Dispatch alerts currently active in concourse</p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-warning-500">
                <ShieldAlert size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Critical Congestion Sectors</span>
              </div>
              <p className="text-3xl font-extrabold text-warning-600 dark:text-warning-500">{criticalSensors.length}</p>
              <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-warning-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${criticalSensors.length > 0 ? 50 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-default-400">Sensor segments alerting critical congestion</p>
            </CardContent>
          </Card>
        </div>

        {/* Utilities infrastructure & Match lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matches lists */}
          <Card className="glass-card lg:col-span-2 border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary-500 mb-2">
                <Trophy size={20} />
                <h3 className="font-bold text-sm">FIFA World Cup 2026 Tournament Schedule</h3>
              </div>

              {matchesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : matches && matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match: any) => (
                    <div
                      key={match.id}
                      className="flex justify-between items-center p-4 rounded-xl border border-default-100 bg-default-50/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs">
                            {match.homeTeam} vs {match.awayTeam}
                          </p>
                          <Chip
                            size="sm"
                            color={match.status === 'LIVE' ? 'danger' : 'default'}
                            variant="soft"
                            className="font-bold text-[8px] h-5"
                          >
                            {match.status}
                          </Chip>
                        </div>
                        <p className="text-[10px] text-default-400">Venue: {match.stadiumName}</p>
                        <p className="text-[9px] text-default-400">
                          Date: {new Date(match.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="text-center font-extrabold text-sm text-primary-500 bg-default-100 px-3 py-1.5 rounded-lg">
                        {match.homeScore} - {match.awayScore}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-default-400">No matches found.</p>
              )}
            </CardContent>
          </Card>

          {/* Infrastructure Health Panel */}
          <Card className="glass-card border border-default-100 shadow-sm h-fit">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-secondary-500 mb-2">
                <Activity size={20} />
                <h3 className="font-bold text-sm">Venue Infrastructure Health</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-default-600">
                      <Power size={14} className="text-success-500" />
                      Main Substation Power Grid
                    </span>
                    <span className="font-bold text-success-600">STABLE (96%)</span>
                  </div>
                  <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-success-500 h-full rounded-full transition-all duration-300" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-default-600">
                      <Wifi size={14} className="text-success-500" />
                      Concourse Wi-Fi Load
                    </span>
                    <span className="font-bold text-success-600">850 Mbps</span>
                  </div>
                  <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-success-500 h-full rounded-full transition-all duration-300" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-default-600">
                      <Droplet size={14} className="text-success-500" />
                      Water Storage Capacity
                    </span>
                    <span className="font-bold text-success-600">92%</span>
                  </div>
                  <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-success-500 h-full rounded-full transition-all duration-300" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}



