'use client';
import Button from '@/components/Button';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardContent, Chip, Skeleton, CardHeader } from '@heroui/react';
import { Play, Ticket, Utensils, Bus, ShieldAlert, ArrowRight, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

export default function FanDashboard() {
  const { data: liveMatch, isLoading: matchLoading } = useQuery({
    queryKey: ['liveMatch'],
    queryFn: () => api.get('/api/matches/live').then((res) => res.data),
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get('/api/tickets').then((res) => res.data),
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get('/api/food/vendors').then((res) => res.data),
  });

  const { data: sensors, isLoading: sensorsLoading } = useQuery({
    queryKey: ['sensors'],
    queryFn: () => api.get('/api/crowd/sensors').then((res) => res.data),
  });

  // Transit mock schedule data
  const transitLines = [
    { mode: 'Shuttle Bus B', time: '3 min', route: 'MetLife Parking -> Lot K' },
    { mode: 'Subway Line 4', time: '7 min', route: 'Stadium Station -> Downtown Transit' },
    { mode: 'Ride-Share Loop', time: '11 min', route: 'Gate C Zone -> Gate B Outer Concourse' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="space-y-1">
          <h2 className="text-xl font-bold md:text-2xl">Enjoy Game Day! ⚽</h2>
          <p className="text-xs text-white/80">
            Find your seat, order hot food, check gate queues, or chat with StadiumPilot AI.
          </p>
        </div>
        <Button
          
          href="/ai-assistant"
          color="default"
          
          className="bg-white text-primary-600 font-semibold"
          radius="full"
          size="sm"
        >
          Ask AI Assistant
        </Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Live Match Ticker */}
        <Card className="glass-card col-span-1 lg:col-span-2 border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-default-500 uppercase tracking-wider">Live Match</span>
              <Chip size="sm" color="danger" variant="soft" className="animate-pulse font-semibold">
                LIVE
              </Chip>
            </div>

            {matchLoading ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-8 w-1/2 rounded-lg" />
              </div>
            ) : liveMatch ? (
              <div className="flex items-center justify-between py-2">
                <div className="text-center w-1/3">
                  <p className="text-xl font-extrabold">{liveMatch.homeTeam}</p>
                  <p className="text-xs text-default-400 mt-1">Home</p>
                </div>
                <div className="text-center w-1/3">
                  <p className="text-3xl font-extrabold tracking-widest bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    {liveMatch.homeScore} - {liveMatch.awayScore}
                  </p>
                  <p className="text-[10px] text-default-400 mt-1 bg-default-100 w-fit mx-auto px-2 py-0.5 rounded-full">
                    Second Half
                  </p>
                </div>
                <div className="text-center w-1/3">
                  <p className="text-xl font-extrabold">{liveMatch.awayTeam}</p>
                  <p className="text-xs text-default-400 mt-1">Away</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-default-400">
                No match is currently live.
              </div>
            )}

            {liveMatch && (
              <div className="flex items-center gap-2 text-xs text-default-500 bg-default-50 p-3 rounded-xl border border-default-100">
                <MapPin size={14} className="text-primary-500" />
                <span>Venue: {liveMatch.stadiumName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket QR Widget */}
        <Card className="glass-card border border-default-100 shadow-sm">
          <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-4 text-primary-500">
                <Ticket size={20} />
                <h3 className="font-bold text-sm">Your Ticket</h3>
              </div>
              
              {ticketsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-foreground">
                    {tickets[0].match.homeTeam} vs {tickets[0].match.awayTeam}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center bg-default-50 rounded-xl p-3 border border-default-100">
                    <div>
                      <p className="text-[10px] text-default-400">Section</p>
                      <p className="text-sm font-bold text-primary-500">{tickets[0].seatSection}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-default-400">Row</p>
                      <p className="text-sm font-bold text-foreground">{tickets[0].seatRow}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-default-400">Seat</p>
                      <p className="text-sm font-bold text-foreground">{tickets[0].seatNumber}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-default-400 py-4">No active tickets registered.</p>
              )}
            </div>

            {tickets && tickets.length > 0 && (
              <Button
                
                href="/navigation"
                variant="ghost"
                color="primary"
                size="sm"
                className="w-full font-semibold rounded-xl"
                endContent={<ArrowRight size={14} />}
              >
                Find Entrance Gate
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Concessions Queue Times */}
        <Card className="glass-card border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-secondary-500">
              <Utensils size={20} />
              <h3 className="font-bold text-sm">Concessions Queues</h3>
            </div>

            {vendorsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
            ) : vendors && vendors.length > 0 ? (
              <div className="space-y-3">
                {vendors.slice(0, 3).map((vendor: any) => (
                  <div key={vendor.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{vendor.name}</p>
                      <p className="text-[10px] text-default-400">{vendor.location}</p>
                    </div>
                    <Chip
                      size="sm"
                      color={vendor.waitTimeMinutes > 10 ? 'warning' : 'success'}
                      variant="soft"
                      className="font-medium"
                    >
                      {vendor.waitTimeMinutes} min wait
                    </Chip>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-default-400">No open vendors found.</p>
            )}

            <Button
              
              href="/food"
              variant="ghost"
              color="primary"
              size="sm"
              className="w-full font-semibold rounded-xl"
            >
              Order Food & Beverage
            </Button>
          </CardContent>
        </Card>

        {/* Crowd Warnings / Sensors */}
        <Card className="glass-card border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-warning-500">
              <Users size={20} />
              <h3 className="font-bold text-sm">Crowd Dynamics</h3>
            </div>

            {sensorsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
            ) : sensors && sensors.length > 0 ? (
              <div className="space-y-3">
                {sensors.slice(0, 3).map((sensor: any) => (
                  <div key={sensor.id} className="flex justify-between items-center text-xs">
                    <span className="text-default-600 truncate mr-2">{sensor.section}</span>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        sensor.crowdLevel === 'CRITICAL'
                          ? 'danger'
                          : sensor.crowdLevel === 'HIGH'
                          ? 'warning'
                          : 'success'
                      }
                      className="font-medium h-5"
                    >
                      {(sensor.crowdLevel || 'low').toLowerCase()}
                    </Chip>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-default-400">No sensor nodes reporting.</p>
            )}

            <Button
              
              href="/crowd"
              variant="ghost"
              color="primary"
              size="sm"
              className="w-full font-semibold rounded-xl"
            >
              View Crowd Heatmaps
            </Button>
          </CardContent>
        </Card>

        {/* Transit Timings */}
        <Card className="glass-card border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-success-500">
              <Bus size={20} />
              <h3 className="font-bold text-sm">Transit Schedules</h3>
            </div>

            <div className="space-y-3">
              {transitLines.map((line, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{line.mode}</p>
                    <p className="text-[10px] text-default-400">{line.route}</p>
                  </div>
                  <span className="font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full dark:text-success-400 dark:bg-success-950/20">
                    {line.time}
                  </span>
                </div>
              ))}
            </div>

            <Button
              
              href="/transport"
              variant="ghost"
              color="primary"
              size="sm"
              className="w-full font-semibold rounded-xl"
            >
              Transit & Parking Planner
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





