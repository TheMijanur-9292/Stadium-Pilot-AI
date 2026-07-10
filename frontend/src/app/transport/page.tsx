'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Button, Chip } from '@heroui/react';
import { Bus, MapPin, Compass, Info, Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function TransportPage() {
  const [selectedLot, setSelectedLot] = useState('Lot A');
  const [loadingMap, setLoadingMap] = useState(false);

  // Transit schedules
  const schedules = [
    { type: 'Express Shuttle B', route: 'MetLife Parking -> Lot K Terminal', time: '3 mins', delay: 'None', status: 'On Time' },
    { type: 'NJ Transit Train', route: 'Secaucus Junction -> Stadium Platform', time: '5 mins', delay: '2 min delay', status: 'Delayed' },
    { type: 'Subway Line 4', route: 'Stadium Station -> Downtown Crossing', time: '8 mins', delay: 'None', status: 'On Time' },
    { type: 'Ride-Share Shuttle', route: 'Gate C Drop-off -> Outer Ring Expressway', time: '12 mins', delay: 'None', status: 'On Time' },
  ];

  // Parking slots mockup data
  const parkingLots = [
    { name: 'Lot A (North)', capacity: '85%', occupancy: 85, color: 'danger', spotsLeft: 120 },
    { name: 'Lot B (East)', capacity: '45%', occupancy: 45, color: 'primary', spotsLeft: 440 },
    { name: 'Lot C (South)', capacity: '20%', occupancy: 20, color: 'success', spotsLeft: 640 },
    { name: 'VIP Lot 1', capacity: '90%', occupancy: 90, color: 'danger', spotsLeft: 15 },
  ];

  // Grid represent of Lot slots
  const renderLotGrid = () => {
    // Generate 24 slots, seed occupied states based on Lot selection
    const slots = [];
    const seed = selectedLot === 'Lot A (North)' || selectedLot === 'VIP Lot 1' ? 0.85 : selectedLot === 'Lot B (East)' ? 0.45 : 0.20;
    
    for (let i = 1; i <= 24; i++) {
      const isOccupied = Math.random() < seed;
      slots.push({ id: i, occupied: isOccupied });
    }

    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`h-10 rounded-lg border flex items-center justify-center text-[8px] font-mono font-bold transition-all ${
              slot.occupied 
                ? 'bg-danger-500/10 border-danger-500/30 text-danger-600 dark:text-danger-400' 
                : 'bg-success-500/10 border-success-500/30 text-success-600 dark:text-success-400 cursor-pointer hover:bg-success-500/20'
            }`}
          >
            {slot.occupied ? 'OCC' : `P-${slot.id}`}
          </div>
        ))}
      </div>
    );
  };

  const handleSelectLot = (lotName: string) => {
    setLoadingMap(true);
    setTimeout(() => {
      setSelectedLot(lotName);
      setLoadingMap(false);
    }, 400);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Parking lots list */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="font-bold text-sm text-default-600 pl-1 uppercase tracking-wider">Smart Parking Monitor</h3>

            <div className="space-y-3">
              {parkingLots.map((lot) => {
                const isActive = lot.name === selectedLot;
                return (
                  <Card
                    key={lot.name}
                    onClick={() => handleSelectLot(lot.name)}
                    className={`cursor-pointer border hover:border-primary-300 transition-all ${
                      isActive ? 'border-primary-500 bg-primary-50/10' : 'border-default-100 bg-content1/50'
                    }`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <p className="font-bold text-foreground">{lot.name}</p>
                        <Chip size="sm" color={lot.color as any} variant="soft" className="font-bold text-[9px] h-5">
                          {lot.capacity} Full
                        </Chip>
                      </div>
                      <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            lot.color === 'danger'
                              ? 'bg-danger-500'
                              : lot.color === 'success'
                              ? 'bg-success-500'
                              : 'bg-primary-500'
                          }`}
                          style={{ width: `${lot.occupancy}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-default-400 font-medium">{lot.spotsLeft} vacant spots remaining</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Visual Parking slots grid */}
          <Card className="glass-card lg:col-span-2 border border-default-100 shadow-sm h-fit">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">Interactive Grid: {selectedLot}</h3>
                <span className="text-[10px] text-default-400 bg-default-100 px-2 py-0.5 rounded-full font-medium">
                  Select a green spot to navigate
                </span>
              </div>

              {loadingMap ? (
                <div className="space-y-4 h-36 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-primary-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {renderLotGrid()}

                  <div className="flex flex-wrap gap-4 text-[10px] text-default-500 border-t border-default-100 pt-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-success-500/20 border border-success-500/30"></span>
                      Available Spot
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-danger-500/20 border border-danger-500/30"></span>
                      Occupied Spot
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bus transit schedule lists */}
          <Card className="glass-card col-span-1 lg:col-span-3 border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary-500 mb-2">
                <Bus size={20} />
                <h3 className="font-bold text-sm">Concourse Shuttle & Subway Schedules</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schedules.map((sch, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-xl border border-default-100 bg-default-50/50 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{sch.type}</p>
                      <p className="text-[10px] text-default-400">{sch.route}</p>
                      <p className="text-[9px] text-warning-600 mt-0.5">{sch.delay}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full dark:text-primary-400 dark:bg-primary-950/20">
                        {sch.time}
                      </span>
                      <p className="text-[8px] text-default-400">Next Departure</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}



