'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import { Users, Info, Activity, AlertTriangle } from 'lucide-react';

export default function CrowdPage() {
  const { data: sensors, isLoading: sensorsLoading } = useQuery({
    queryKey: ['sensors'],
    queryFn: () => api.get('/api/crowd/sensors').then((res) => res.data),
  });

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'accent';
      case 'LOW':
      default:
        return 'success';
      }
  };

  const getDensityBg = (density: string) => {
    switch (density) {
      case 'CRITICAL':
        return 'bg-danger-500/10 border-danger-500/20';
      case 'HIGH':
        return 'bg-warning-500/10 border-warning-500/20';
      case 'MEDIUM':
        return 'bg-primary-500/10 border-primary-500/20';
      case 'LOW':
      default:
        return 'bg-success-500/10 border-success-500/20';
    }
  };

  // Find sensor density for specific key parts to display in visual map grid
  const getSensorDensity = (locationKeyword: string) => {
    if (!sensors) return 'LOW';
    const found = sensors.find((s: any) => s.section?.toLowerCase().includes(locationKeyword.toLowerCase()));
    return found ? found.crowdLevel : 'LOW';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        
        {/* Alerts for critical congestion */}
        {sensors?.some((s: any) => s.crowdLevel === 'CRITICAL') && (
          <div className="flex items-center gap-3 rounded-xl bg-danger-50 text-danger p-4 text-xs border border-danger-100 animate-pulse">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <div>
              <p className="font-bold">Congestion Warning Alert!</p>
              <p className="text-[10px] text-danger-600 dark:text-danger-400">
                Critical crowd density detected in Level 1 Concourse Section 101. Directing staff to coordinate gate bypass routing.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sensors Data Grid list */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="font-bold text-sm text-default-600 pl-1 uppercase tracking-wider">Concourse Sensors</h3>

            {sensorsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : sensors && sensors.length > 0 ? (
              <div className="space-y-3">
                {sensors.map((sensor: any) => (
                  <Card key={sensor.id} className={`border ${getDensityBg(sensor.crowdLevel)}`}>
                    <CardContent className="p-4 flex flex-row justify-between items-center">
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-foreground">{sensor.section}</p>
                        <p className="text-[9px] text-default-400">
                          Last ping: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        color={getDensityColor(sensor.crowdLevel)}
                        variant="soft"
                        className="font-bold text-[9px] h-5"
                      >
                        {sensor.crowdLevel}
                      </Chip>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-default-400">No sensor nodes reporting metrics.</p>
            )}
          </div>

          {/* Interactive Heatmap Layout */}
          <Card className="glass-card lg:col-span-2 border border-default-100 shadow-sm h-fit">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Visual Concourse Traffic Grid</h3>
                <span className="text-[9px] text-default-400 flex items-center gap-1">
                  <Activity size={10} className="text-primary-500 animate-pulse" />
                  Live update feed
                </span>
              </div>

              {/* Dynamic Grid representing Stadium Sectors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                
                {/* Gate A (North) */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between h-24 ${getDensityBg(getSensorDensity('Gate A'))}`}>
                  <span className="text-[10px] text-default-500 font-semibold uppercase">North Stand Gate A</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground">Gate A</span>
                    <Chip size="sm" variant="soft" color={getDensityColor(getSensorDensity('Gate A'))} className="h-5 text-[9px]">
                      {getSensorDensity('Gate A')}
                    </Chip>
                  </div>
                </div>

                {/* Gate B (East) */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between h-24 ${getDensityBg(getSensorDensity('Gate B'))}`}>
                  <span className="text-[10px] text-default-500 font-semibold uppercase">East Stand Gate B</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground">Gate B</span>
                    <Chip size="sm" variant="soft" color={getDensityColor(getSensorDensity('Gate B'))} className="h-5 text-[9px]">
                      {getSensorDensity('Gate B')}
                    </Chip>
                  </div>
                </div>

                {/* Section 101 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between h-24 ${getDensityBg(getSensorDensity('101'))}`}>
                  <span className="text-[10px] text-default-500 font-semibold uppercase">Concourse Sec 101</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground">Sec 101</span>
                    <Chip size="sm" variant="soft" color={getDensityColor(getSensorDensity('101'))} className="h-5 text-[9px]">
                      {getSensorDensity('101')}
                    </Chip>
                  </div>
                </div>

                {/* Section 224 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between h-24 ${getDensityBg(getSensorDensity('224'))}`}>
                  <span className="text-[10px] text-default-500 font-semibold uppercase">Concourse Sec 224</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground">Sec 224</span>
                    <Chip size="sm" variant="soft" color={getDensityColor(getSensorDensity('224'))} className="h-5 text-[9px]">
                      {getSensorDensity('224')}
                    </Chip>
                  </div>
                </div>

                {/* Food Court */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between h-24 ${getDensityBg(getSensorDensity('Food'))}`}>
                  <span className="text-[10px] text-default-500 font-semibold uppercase">Concessions Plaza</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground">Food Court</span>
                    <Chip size="sm" variant="soft" color={getDensityColor(getSensorDensity('Food'))} className="h-5 text-[9px]">
                      {getSensorDensity('Food')}
                    </Chip>
                  </div>
                </div>

                {/* VIP Lounge */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between h-24 ${getDensityBg(getSensorDensity('VIP'))}`}>
                  <span className="text-[10px] text-default-500 font-semibold uppercase">VIP Hospitality Corridor</span>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground">VIP Lounge</span>
                    <Chip size="sm" variant="soft" color={getDensityColor(getSensorDensity('VIP'))} className="h-5 text-[9px]">
                      {getSensorDensity('VIP')}
                    </Chip>
                  </div>
                </div>

              </div>

              {/* Guide block */}
              <div className="flex gap-2.5 p-4 rounded-xl border border-default-100 bg-default-50 text-xs text-default-500 items-start">
                <Info size={16} className="text-default-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">How to read the concourse grid:</p>
                  <p>
                    Each card represents a crucial stadium sector. Colors show real-time passenger congestion loops. 
                    If any sector turns Red (Critical) or Yellow (High), spectators are advised to check alternative walking directions in the Navigation Assistant.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}



