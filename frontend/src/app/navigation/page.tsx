'use client';
import Button from '@/components/Button';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Chip } from '@heroui/react';
import { Compass, MapPin, Eye, ArrowRight, EyeOff, Accessibility, Info } from 'lucide-react';

export default function NavigationPage() {
  const [startGate, setStartGate] = useState('Gate B (East)');
  const [targetSection, setTargetSection] = useState('Section 224');
  const [showPath, setShowPath] = useState(false);
  const [useAccessible, setUseAccessible] = useState(false);

  const gateCoords: Record<string, { x: string; y: string }> = {
    'Gate A (North)': { x: '50%', y: '8%' },
    'Gate B (East)': { x: '92%', y: '50%' },
    'Gate C (South)': { x: '50%', y: '92%' },
    'Gate D (West)': { x: '8%', y: '50%' },
    'VIP Entrance': { x: '24%', y: '78%' }
  };

  const sectionCoords: Record<string, { x: string; y: string }> = {
    'Section 101': { x: '70%', y: '25%' },
    'Section 104': { x: '80%', y: '48%' },
    'Section 112': { x: '68%', y: '75%' },
    'Section 204': { x: '20%', y: '50%' },
    'Section 224': { x: '30%', y: '25%' }
  };

  const startCoord = gateCoords[startGate] || gateCoords['Gate B (East)'];
  const sectionCoord = sectionCoords[targetSection] || sectionCoords['Section 224'];

  const gates = ['Gate A (North)', 'Gate B (East)', 'Gate C (South)', 'Gate D (West)', 'VIP Entrance'];
  const sections = ['Section 101', 'Section 104', 'Section 112', 'Section 204', 'Section 224'];

  const getRouteDirections = () => {
    const isLevel2 = targetSection.includes('2');
    
    if (useAccessible) {
      return [
        `Enter through ${startGate.split(' ')[0]}.`,
        'Locate the dedicated wheelchair accessible ramp on the right.',
        'Proceed along the Main Concourse towards elevator shaft 3.',
        isLevel2 
          ? 'Take Elevator 3 to Concourse Level 2.' 
          : 'Continue straight along the Level 1 corridor (tactile paving guides active).',
        `Locate ${targetSection} situated adjacent to Concourse Restroom 4 (wheelchair friendly).`,
        'Escort staff stationed at seat entrance to assist with seating lift.'
      ];
    }

    return [
      `Enter through ${startGate.split(' ')[0]}.`,
      'Walk 45 meters straight along the Main Concourse Level 1.',
      isLevel2 
        ? 'Take Escalator C on the left to reach Concourse Level 2.'
        : 'Continue straight past Concourse Section 102.',
      isLevel2
        ? `Walk past Stadia Burgers to find ${targetSection} on your right.`
        : `Walk past Green Corner to find ${targetSection} on your left.`,
      'Scan ticket barcode at seat gate turnstile.'
    ];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Panel */}
          <Card className="glass-card border border-default-100 shadow-sm h-fit">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-primary-500">
                <Compass size={20} />
                <h3 className="font-bold text-sm">Path Finder</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground pl-1">Starting Point (Entrance Gate)</label>
                  <select
                    value={startGate}
                    onChange={(e) => {
                      setStartGate(e.target.value);
                      setShowPath(false);
                    }}
                    className="w-full bg-transparent border-2 border-default-200 hover:border-default-400 focus:border-primary-500 rounded-xl px-3 py-2.5 text-xs text-default-700 outline-none transition-all cursor-pointer dark:text-default-300"
                  >
                    {gates.map((g) => (
                      <option key={g} value={g} className="bg-white text-black dark:bg-zinc-900 dark:text-white">{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground pl-1">Destination Seat Section</label>
                  <select
                    value={targetSection}
                    onChange={(e) => {
                      setTargetSection(e.target.value);
                      setShowPath(false);
                    }}
                    className="w-full bg-transparent border-2 border-default-200 hover:border-default-400 focus:border-primary-500 rounded-xl px-3 py-2.5 text-xs text-default-700 outline-none transition-all cursor-pointer dark:text-default-300"
                  >
                    {sections.map((s) => (
                      <option key={s} value={s} className="bg-white text-black dark:bg-zinc-900 dark:text-white">{s}</option>
                    ))}
                  </select>
                </div>

                {/* Accessibility Toggle */}
                <div
                  onClick={() => {
                    setUseAccessible(!useAccessible);
                    setShowPath(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    useAccessible 
                      ? 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-950/20 dark:border-primary-900 dark:text-primary-400' 
                      : 'border-default-100 hover:bg-default-50 text-default-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Accessibility size={16} />
                    <span className="text-xs font-semibold">Accessible Routing</span>
                  </div>
                  <Chip size="sm" variant="soft" color={useAccessible ? 'accent' : 'default'} className="text-[10px]">
                    {useAccessible ? 'On' : 'Off'}
                  </Chip>
                </div>

                <Button
                  color="primary"
                  className="w-full font-semibold rounded-xl"
                  onPress={() => setShowPath(true)}
                  endContent={showPath ? <EyeOff size={14} /> : <Eye size={14} />}
                >
                  {showPath ? 'Clear Path' : 'Calculate Route'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Map Visualizer */}
          <Card className="glass-card lg:col-span-2 border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-sm">Stadium Level 1 / 2 Floor Plan</h3>
              
              {/* Graphical Stadium Grid Ring */}
              <div className="relative border-4 border-default-100 rounded-full aspect-square max-w-[340px] mx-auto flex items-center justify-center bg-default-50/50 p-8 shadow-inner group">
                <div className="absolute inset-0 rounded-full border border-dashed border-default-200 animate-spin-slow"></div>
                
                {/* Soccer Pitch representation */}
                <div className="w-[180px] h-[110px] bg-success-600 border-2 border-white/80 rounded-sm relative flex items-center justify-center shadow-lg">
                  {/* Center Line and Circle */}
                  <div className="h-full w-0.5 bg-white/60 absolute left-1/2"></div>
                  <div className="w-12 h-12 border-2 border-white/60 rounded-full absolute"></div>
                </div>

                {/* Gates Highlights */}
                <div className="absolute top-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-default-100 text-default-600">Gate A</div>
                <div className="absolute right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-default-100 text-default-600">Gate B</div>
                <div className="absolute bottom-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-default-100 text-default-600">Gate C</div>
                <div className="absolute left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-default-100 text-default-600">Gate D</div>

                {/* Path Connection Line */}
                {showPath && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <style>{`
                      @keyframes dash {
                        to {
                          stroke-dashoffset: -20;
                        }
                      }
                      .animate-dash {
                        animation: dash 1s linear infinite;
                      }
                    `}</style>
                    <line 
                      x1={startCoord.x} 
                      y1={startCoord.y} 
                      x2={sectionCoord.x} 
                      y2={sectionCoord.y} 
                      stroke="#3b82f6" 
                      strokeWidth="3" 
                      strokeDasharray="6,6"
                      className="animate-dash"
                    />
                  </svg>
                )}

                {/* Start Gate Marker */}
                {showPath && (
                  <div 
                    className="absolute transition-all duration-500 z-20"
                    style={{
                      left: startCoord.x,
                      top: startCoord.y,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <MapPin className="text-success-500 fill-success-500" size={24} />
                    <Chip size="sm" color="success" className="text-[9px] h-4 absolute left-6 top-1">
                      Start
                    </Chip>
                  </div>
                )}

                {/* Target Section Node Marker */}
                {showPath && (
                  <div 
                    className="absolute animate-bounce transition-all duration-500 z-20" 
                    style={{
                      left: sectionCoord.x,
                      top: sectionCoord.y,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <MapPin className="text-danger-500 fill-danger-500" size={24} />
                    <Chip size="sm" color="danger" className="text-[9px] h-4 absolute left-6 top-1">
                      {targetSection}
                    </Chip>
                  </div>
                )}
              </div>

              {/* Step-by-Step Directions */}
              {showPath ? (
                <div className="space-y-3 border-t border-default-100 pt-4">
                  <h4 className="font-bold text-xs flex items-center gap-1.5 text-primary-500">
                    <Compass size={14} />
                    Walking Instructions ({useAccessible ? 'Accessible Route' : 'Standard Route'})
                  </h4>
                  <div className="space-y-2.5">
                    {getRouteDirections().map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start text-xs leading-relaxed">
                        <span className="font-extrabold text-primary-500 bg-primary-50 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] dark:bg-primary-950/20 dark:text-primary-400">
                          {idx + 1}
                        </span>
                        <p className="text-default-600 pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 p-4 rounded-xl border border-default-100 bg-default-50 text-xs text-default-500 items-center justify-center">
                  <Info size={16} className="text-default-400" />
                  <span>Choose starting gate and destination to render instructions.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}





