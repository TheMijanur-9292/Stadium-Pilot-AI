'use client';
import Input from '@/components/Input';
import Button from '@/components/Button';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import { ShieldAlert, Users, Ticket, Check, RefreshCw, Send } from 'lucide-react';
import { useState } from 'react';

export default function VenueStaffDashboard() {
  const queryClient = useQueryClient();
  const [scanId, setScanId] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.get('/api/emergency/incidents').then((res) => res.data),
  });

  const { data: sensors, isLoading: sensorsLoading } = useQuery({
    queryKey: ['sensors'],
    queryFn: () => api.get('/api/crowd/sensors').then((res) => res.data),
  });

  const updateIncidentMutation = useMutation({
    mutationFn: (data: { id: string; status: string; comments?: string }) =>
      api.patch(`/api/emergency/incidents/${data.id}`, { status: data.status, comments: data.comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  const updateSensorMutation = useMutation({
    mutationFn: (data: { id: string; crowdLevel: string }) =>
      api.patch(`/api/crowd/zones/${data.id}`, { crowdLevel: data.crowdLevel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
    },
  });

  const handleScanTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanId) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const response = await api.post(`/api/tickets/${scanId}/scan`);
      setScanResult({ success: true, ticket: response.data });
      setScanId('');
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Failed to validate ticket. ID may be invalid.',
      });
    } finally {
      setScanLoading(false);
    }
  };

  const handleResolveIncident = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'REPORTED' ? 'INVESTIGATING' : 'RESOLVED';
    const comments = nextStatus === 'RESOLVED' ? 'Resolved by dispatch staff.' : 'Dispatch team sent to location.';
    updateIncidentMutation.mutate({ id, status: nextStatus, comments });
  };

  const handleSensorDensityToggle = (id: string, crowdLevel: string) => {
    let nextDensity = 'LOW';
    if (crowdLevel === 'LOW') nextDensity = 'MEDIUM';
    else if (crowdLevel === 'MEDIUM') nextDensity = 'HIGH';
    else if (crowdLevel === 'HIGH') nextDensity = 'CRITICAL';

    updateSensorMutation.mutate({ id, crowdLevel: nextDensity });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-warning-600 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold md:text-2xl">Operations Dispatch & Concourse Control 📡</h2>
        <p className="text-xs text-white/80 mt-1">
          Monitor crowd flows, handle incident reports, and scan entrance tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Dispatch Queue */}
        <Card className="glass-card lg:col-span-2 border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-danger-500 mb-2">
              <ShieldAlert size={20} />
              <h3 className="font-bold text-sm">Active Incidents Queue</h3>
            </div>

            {incidentsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : incidents && incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.map((incident: any) => (
                  <div
                    key={incident.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-default-100 bg-default-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'danger' : 'warning'}
                          className="font-bold text-[8px] h-5"
                          variant="soft"
                        >
                          {incident.severity}
                        </Chip>
                        <p className="font-semibold text-xs">{incident.location}</p>
                      </div>
                      <p className="text-xs text-default-600 leading-relaxed">{incident.description}</p>
                      {incident.comments && (
                        <p className="text-[10px] text-default-400 bg-default-100/50 p-2 rounded-lg italic">
                          Logs: {incident.comments}
                        </p>
                      )}
                      <p className="text-[9px] text-default-400">
                        Reported by: {incident.reporter.fullName} ({incident.reporter.role.toLowerCase()})
                      </p>
                    </div>

                    {incident.status !== 'RESOLVED' && (
                      <Button
                        size="sm"
                        color={incident.status === 'REPORTED' ? 'warning' : 'success'}
                        variant="ghost"
                        className="font-semibold rounded-xl whitespace-nowrap"
                        onPress={() => handleResolveIncident(incident.id, incident.status)}
                        isLoading={updateIncidentMutation.isPending}
                      >
                        {incident.status === 'REPORTED' ? 'Dispatch Help' : 'Mark Resolved'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-default-400 py-6 text-center">No active incidents reported. All clear.</p>
            )}
          </CardContent>
        </Card>

        {/* Ticket Scanner Simulation */}
        <Card className="glass-card border border-default-100 shadow-sm h-fit">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary-500 mb-2">
              <Ticket size={20} />
              <h3 className="font-bold text-sm">Gate Ticket Scanner</h3>
            </div>

            <form onSubmit={handleScanTicket} className="space-y-3">
              <label className="block text-xs font-semibold text-default-600 mb-1">Ticket UUID (Simulate QR Scan)</label>
<Input
                
                placeholder="Enter ticket ID"
                
                variant="primary"
                
                value={scanId}
                onChange={(e) => setScanId(e.target.value)}
              />
              <Button
                type="submit"
                color="primary"
                size="sm"
                className="w-full font-semibold rounded-xl"
                isLoading={scanLoading}
                endContent={<Send size={12} />}
              >
                Scan Ticket
              </Button>
            </form>

            {scanResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  scanResult.success
                    ? 'bg-success-50/50 border-success-100 text-success-800 dark:text-success-500'
                    : 'bg-danger-50/50 border-danger-100 text-danger-800'
                }`}
              >
                {scanResult.success ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <Check size={14} />
                      <span>Ticket Validated!</span>
                    </div>
                    <p className="text-[10px] text-default-600 dark:text-default-400">
                      Holder: {scanResult.ticket.user.fullName || scanResult.ticket.user.name}
                    </p>
                    <p className="text-[10px] text-default-600 dark:text-default-400">
                      Match: {scanResult.ticket.match.homeTeam} vs {scanResult.ticket.match.awayTeam}
                    </p>
                    <p className="text-[10px] text-default-600 dark:text-default-400">
                      Seat: Sect {scanResult.ticket.seatSection}, Row {scanResult.ticket.seatRow}, Seat {scanResult.ticket.seatNumber}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold">{scanResult.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crowd Density Control Overrides */}
        <Card className="glass-card col-span-1 lg:col-span-3 border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-warning-500">
              <Users size={20} />
              <h3 className="font-bold text-sm">Smart Crowd Sensor Calibration</h3>
            </div>
            
            <p className="text-xs text-default-500">
              Below are the smart sensor nodes positioned around the stadium concourse. Click a sensor tag to cycle through simulated density levels (Low → Medium → High → Critical) to trigger alarms and route bypass warnings.
            </p>

            {sensorsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sensors?.map((sensor: any) => (
                  <div
                    key={sensor.id}
                    className="flex justify-between items-center p-3 rounded-xl border border-default-100 bg-default-50/50 hover:bg-default-100/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-xs text-foreground">{sensor.section}</p>
                      <p className="text-[9px] text-default-400">Node ID: {sensor.id.slice(0, 8)}...</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      color={
                        sensor.crowdLevel === 'CRITICAL'
                          ? 'danger'
                          : sensor.crowdLevel === 'HIGH'
                          ? 'warning'
                          : sensor.crowdLevel === 'MEDIUM'
                          ? 'primary'
                          : 'success'
                      }
                      className="font-bold text-[10px] h-8 rounded-lg"
                      onPress={() => handleSensorDensityToggle(sensor.id, sensor.crowdLevel)}
                      isLoading={updateSensorMutation.isPending}
                    >
                      {sensor.crowdLevel}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







