'use client';
import Input from '@/components/Input';
import Button from '@/components/Button';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import { ShieldAlert, AlertOctagon, MapPin, Send, Check, Phone, ShieldClose, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function EmergencyPage() {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [isOpen, setIsOpen] = useState(false);
  const [panicLoading, setPanicLoading] = useState(false);

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.get('/api/emergency/incidents').then((res) => res.data),
  });

  const createIncidentMutation = useMutation({
    mutationFn: (data: { description: string; location: string; severity: string }) =>
      api.post('/api/emergency/report', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setDesc('');
      setLocation('');
      setSeverity('MEDIUM');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: string; comments?: string }) =>
      api.patch(`/api/emergency/incidents/${data.id}`, { status: data.status, comments: data.comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  if (!user) return null;

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !location) return;
    createIncidentMutation.mutate({ description: desc, location, severity });
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'REPORTED' ? 'INVESTIGATING' : 'RESOLVED';
    const comments = nextStatus === 'RESOLVED' ? 'Resolved by staff dispatcher.' : 'Personnel dispatched to stand.';
    updateStatusMutation.mutate({ id, status: nextStatus, comments });
  };

  const handleTriggerPanic = () => {
    setPanicLoading(true);
    // Simulate high-priority GPS alarm transmission
    setTimeout(() => {
      setPanicLoading(false);
      createIncidentMutation.mutate({
        description: '*** PANIC ALARM TRIGGERED *** User requested immediate medical/security assistance. Broadcast GPS location sent.',
        location: 'Concourse Level 1 Gate B (Simulated GPS Coordinates)',
        severity: 'CRITICAL',
      });
      setIsOpen(true);
    }, 1500);
  };

  const isStaff = user.role === 'VENUE_STAFF' || user.role === 'ORGANIZER' || user.role === 'ADMIN';

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        
        {/* Panic Button Call-out */}
        <Card className="bg-gradient-to-r from-danger-700 to-red-500 text-white rounded-2xl border-none shadow-xl">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                <AlertOctagon size={28} className="animate-pulse text-red-100" />
                Emergency Panic SOS Trigger
              </h2>
              <p className="text-xs text-red-100 max-w-xl">
                If you feel unsafe or detect a medical/fire emergency, press the SOS button. 
                This transmits your profile information and real-time location logs straight to dispatch personnel.
              </p>
            </div>
            
            <Button
              color="default"
              
              className="bg-white text-danger font-extrabold px-8 py-6 rounded-full hover:scale-105 transition-transform"
              onPress={handleTriggerPanic}
              isLoading={panicLoading}
              endContent={<Phone size={16} />}
            >
              TRIGGER SOS
            </Button>
          </CardContent>
        </Card>

        {/* Layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Incidents logs */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-bold text-sm text-default-600 pl-1 uppercase tracking-wider">Incidents Register</h3>

            {incidentsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : incidents && incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.map((inc: any) => (
                  <Card
                    key={inc.id}
                    className={`border ${
                      inc.status === 'RESOLVED' 
                        ? 'border-default-100 bg-content1/30 opacity-70' 
                        : inc.severity === 'CRITICAL' 
                        ? 'border-danger-300 bg-danger-50/10' 
                        : 'border-default-100 bg-content1/50'
                    }`}
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip
                            size="sm"
                            color={inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? 'danger' : 'warning'}
                            className="font-bold text-[8px] h-5"
                          >
                            {inc.severity}
                          </Chip>
                          <Chip size="sm" variant="soft" color="default" className="text-[8px] h-5 font-semibold">
                            {inc.status}
                          </Chip>
                          <p className="font-semibold text-xs text-foreground truncate">{inc.location}</p>
                        </div>
                        <p className="text-xs text-default-600 leading-relaxed">{inc.description}</p>
                        {inc.comments && (
                          <p className="text-[10px] text-default-400 bg-default-100/50 p-2 rounded-lg italic">
                            Log Comments: {inc.comments}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1 text-[9px] text-default-400">
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} />
                            {inc.location}
                          </span>
                          <span>• Reported by: {inc.reporter.name}</span>
                          <span>• {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {isStaff && inc.status !== 'RESOLVED' && (
                        <Button
                          size="sm"
                          color={inc.status === 'REPORTED' ? 'warning' : 'success'}
                          variant="ghost"
                          className="font-semibold rounded-xl flex-shrink-0"
                          onPress={() => handleStatusToggle(inc.id, inc.status)}
                          isLoading={updateStatusMutation.isPending}
                        >
                          {inc.status === 'REPORTED' ? 'Dispatch Crew' : 'Resolve Incident'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-default-400 py-6 text-center">No active reports. All systems green.</p>
            )}
          </div>

          {/* Normal Report Form */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="font-bold text-sm text-default-600 pl-1 uppercase tracking-wider">File Safe Report</h3>
            
            <Card className="glass-card border border-default-100 shadow-sm h-fit">
              <CardContent className="p-6">
                <form onSubmit={handleReportIncident} className="space-y-4">
                  <label className="block text-xs font-semibold text-default-600 mb-1">Incident Location / Sector</label>
<Input
                    
                    placeholder="e.g. Block 102 Concourse corridor"
                    
                    variant="primary"
                    
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground pl-1">Description of Incident</label>
                    <textarea
                      placeholder="Explain what is happening (e.g. water spill, debris, ticket scan failure...)"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="w-full bg-transparent border-2 border-default-200 hover:border-default-400 focus:border-primary-500 rounded-xl px-3 py-2.5 text-xs text-default-700 outline-none transition-all cursor-pointer dark:text-default-300 min-h-20"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground pl-1">Severity Category</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full bg-transparent border-2 border-default-200 hover:border-default-400 focus:border-primary-500 rounded-xl px-3 py-2 text-xs text-default-700 outline-none transition-all cursor-pointer dark:text-default-300"
                    >
                      <option value="LOW" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Low (spills, clean-up request)</option>
                      <option value="MEDIUM" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Medium (queue delays, minor issues)</option>
                      <option value="HIGH" className="bg-white text-black dark:bg-zinc-900 dark:text-white">High (lost child, ticket failures)</option>
                      <option value="CRITICAL" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Critical (medical, security hazard)</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full font-semibold rounded-xl"
                    isLoading={createIncidentMutation.isPending}
                    endContent={<Send size={12} />}
                  >
                    Send Incident Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SOS Trigger Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-background border border-default-200 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 animate-scale-in relative">
            <div className="flex flex-col gap-1 items-center pt-8">
              <div className="p-3 bg-danger-50 rounded-full text-danger mb-2 animate-bounce">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-lg font-bold text-foreground">SOS Signal Transmitted</h3>
            </div>
            <div className="px-4 text-center text-xs text-default-600 dark:text-default-400 leading-relaxed">
              Emergency dispatchers have received your distress signal along with simulated GPS coordinates. 
              Safety crew leads have been notified and dispatched to your stand sector. 
              Please stay where you are or follow signs to the nearest escape gates if instructed.
            </div>
            <div className="pb-4 pt-2">
              <Button color="danger"  className="w-full font-semibold" onPress={() => setIsOpen(false)}>
                Acknowledge & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}







