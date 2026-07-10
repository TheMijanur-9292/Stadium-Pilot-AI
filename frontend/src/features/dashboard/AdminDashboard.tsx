'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Utensils,
  Megaphone,
  Activity,
  Power,
  Wifi,
  Droplet,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useState } from 'react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [localAnnouncements, setLocalAnnouncements] = useState<any[]>(() => [
    {
      id: 'ann-1',
      title: 'Weather Advisory',
      description: 'Heavy rain is expected. Retractable roof is closing.',
      priority: 'HIGH',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ann-2',
      title: 'Gate Opening Status',
      description: 'All public access gates are now open. Welcome fans!',
      priority: 'LOW',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Queries
  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.get('/api/emergency/incidents').then((res) => res.data),
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get('/api/food/vendors').then((res) => res.data),
  });

  // Mutate Incident Status
  const incidentMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) =>
      api.patch(`/api/emergency/incidents/${data.id}`, { status: data.status }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  const handleResolveIncident = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'RESOLVED' ? 'INVESTIGATING' : 'RESOLVED';
    incidentMutation.mutate({ id, status: nextStatus });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) return;

    const newAnn = {
      id: 'ann-' + Math.random().toString(36).substring(2, 9),
      title: announcementTitle,
      description: announcementText,
      priority,
      createdAt: new Date().toISOString()
    };

    setLocalAnnouncements((prev) => [newAnn, ...prev]);
    setAnnouncementTitle('');
    setAnnouncementText('');
    setSuccessMsg('Announcement successfully broadcast to all stadium display units.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const activeIncidents = incidents?.filter((i: any) => i.status !== 'RESOLVED') || [];
  const activeIncidentsCount = activeIncidents.length;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold md:text-2xl tracking-tight flex items-center gap-2">
            Stadium Executive & Operations Console 🏟️
          </h2>
          <p className="text-xs text-indigo-200 max-w-2xl">
            Real-time ticketing revenue, crowd safety dispatch, concession wait times, and infrastructure status loops.
          </p>
        </div>
        <Chip size="sm" color="accent" variant="secondary" className="bg-indigo-600 font-bold px-3 py-1">
          Live Matches Active
        </Chip>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Occupancy Card */}
        <Card className="glass-card border border-default-100 shadow-sm hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-default-400 font-semibold uppercase tracking-wider">Stadium Occupancy</span>
              <Users size={16} className="text-indigo-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-foreground tracking-tight">82,450</p>
              <p className="text-[10px] text-default-400">95.8% Venue Capacity filled</p>
            </div>
            <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: '95.8%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Revenue Card */}
        <Card className="glass-card border border-default-100 shadow-sm hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-default-400 font-semibold uppercase tracking-wider">Event Revenue</span>
              <DollarSign size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-500 tracking-tight">$4,093,000</p>
              <p className="text-[10px] text-default-400">Ticketing: $3.45M | Food: $642K</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
              <TrendingUp size={12} />
              <span>+14.2% from target forecast</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Emergency Incidents */}
        <Card className="glass-card border border-default-100 shadow-sm hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-default-400 font-semibold uppercase tracking-wider">Safety Incidents</span>
              <ShieldAlert size={16} className="text-danger-500" />
            </div>
            <div className="space-y-1">
              <p className={`text-3xl font-extrabold tracking-tight ${activeIncidentsCount > 0 ? 'text-danger-600 dark:text-danger-500' : 'text-foreground'}`}>
                {activeIncidentsCount}
              </p>
              <p className="text-[10px] text-default-400">
                {activeIncidentsCount > 0 ? 'Urgent dispatch alerts pending' : 'All stadium sections clear'}
              </p>
            </div>
            <Chip
              size="sm"
              color={activeIncidentsCount > 0 ? 'danger' : 'success'}
              variant="soft"
              className="font-bold text-[9px] h-5"
            >
              {activeIncidentsCount > 0 ? 'Dispatch Action Required' : 'Command Center Stable'}
            </Chip>
          </CardContent>
        </Card>

        {/* Concessions Average wait time */}
        <Card className="glass-card border border-default-100 shadow-sm hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-default-400 font-semibold uppercase tracking-wider">Concessions Load</span>
              <Utensils size={16} className="text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-foreground tracking-tight">8.3 Min</p>
              <p className="text-[10px] text-default-400">Average concessions wait time</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold">
              <Clock size={12} />
              <span>Peak game-interval load</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Incident Dispatch Feed */}
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-danger-500">
                  <ShieldAlert size={20} />
                  <h3 className="font-bold text-sm">Emergency Dispatch Command</h3>
                </div>
                {incidentsLoading && <span className="text-xs text-default-400 animate-pulse">Loading logs...</span>}
              </div>

              {incidentsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : incidents && incidents.length > 0 ? (
                <div className="space-y-3">
                  {incidents.map((incident: any) => (
                    <div
                      key={incident.id}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border transition-colors ${
                        incident.status === 'RESOLVED'
                          ? 'bg-default-50/50 border-default-100 opacity-60'
                          : 'bg-danger-50/30 border-danger-100 dark:bg-danger-950/10 dark:border-danger-900/30'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-lg">
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            color={
                              incident.severity === 'CRITICAL'
                                ? 'danger'
                                : incident.severity === 'HIGH'
                                ? 'warning'
                                : 'default'
                            }
                            variant="secondary"
                            className="font-bold text-[9px] h-5"
                          >
                            {incident.severity}
                          </Chip>
                          <span className="text-[10px] text-default-400 font-medium">
                            Located at: <strong className="text-default-700 dark:text-default-300">{incident.location}</strong>
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-medium leading-relaxed">
                          {incident.description}
                        </p>
                        {incident.comments && (
                          <p className="text-[10px] text-default-500 italic bg-default-100 dark:bg-default-800/40 px-2 py-0.5 rounded w-fit">
                            Note: {incident.comments}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        color={incident.status === 'RESOLVED' ? 'default' : 'danger'}
                        variant={incident.status === 'RESOLVED' ? 'ghost' : 'ghost'}
                        className="font-semibold text-xs rounded-xl flex-shrink-0 self-end sm:self-center"
                        onPress={() => handleResolveIncident(incident.id, incident.status)}
                        isLoading={incidentMutation.isPending && incidentMutation.variables?.id === incident.id}
                      >
                        {incident.status === 'RESOLVED' ? (
                          <span className="flex items-center gap-1 text-default-500">
                            <CheckCircle size={14} /> Reopen Alert
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            Resolve & Clear
                          </span>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-default-200 rounded-xl">
                  <CheckCircle size={28} className="text-success-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">Zero Active Emergency Dispatch Alerts</p>
                  <p className="text-[10px] text-default-400 mt-0.5">All stadium sensors and command nodes are green.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Concessions Performance Overview */}
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-500">
                <Utensils size={20} />
                <h3 className="font-bold text-sm">Concessions Revenue & Wait Times</h3>
              </div>

              {vendorsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ) : vendors && vendors.length > 0 ? (
                <div className="space-y-4">
                  {vendors.map((vendor: any) => {
                    let mockSales = '$184,300';
                    if (vendor.name.includes('Taco')) mockSales = '$249,500';
                    else if (vendor.name.includes('Green')) mockSales = '$92,100';

                    return (
                      <div
                        key={vendor.id}
                        className="flex justify-between items-center p-3 rounded-xl border border-default-50 hover:bg-default-50/50 transition-colors text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">{vendor.name}</p>
                          <p className="text-[10px] text-default-400">{vendor.location} ({vendor.category})</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-extrabold text-foreground">{mockSales}</p>
                            <p className="text-[9px] text-default-400 font-semibold uppercase">Sales Today</p>
                          </div>
                          <Chip
                            size="sm"
                            color={vendor.waitTimeMinutes > 10 ? 'warning' : 'success'}
                            variant="soft"
                            className="font-bold h-6"
                          >
                            {vendor.waitTimeMinutes} min wait
                          </Chip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-default-400">No active concession vendors found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Global Broadcast Console */}
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-500">
                <Megaphone size={20} />
                <h3 className="font-bold text-sm">Stadium Alert Broadcast</h3>
              </div>
              <p className="text-[10px] text-default-400 leading-normal">
                Post an announcement to be broadcasted instantly to all public displays, digital banners, and spectator apps.
              </p>

              {successMsg && (
                <div className="p-3 bg-success-50 text-success rounded-xl text-[10px] font-semibold flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-3.5">
                <Input
                  label="Announcement Title"
                  placeholder="e.g. Roof Closing Advisory"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-default-600">
                    Message Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed instructions for attendees..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-default-200 bg-default-50/50 dark:bg-default-800/20 text-foreground placeholder-default-400 focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-default-600">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                          priority === p
                            ? p === 'CRITICAL'
                              ? 'bg-danger-500 text-white border-danger-500'
                              : p === 'HIGH'
                              ? 'bg-warning-500 text-white border-warning-500'
                              : p === 'MEDIUM'
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-default-500 text-white border-default-500'
                            : 'border-default-200 bg-transparent text-default-600 hover:bg-default-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  color="primary"
                  className="w-full font-semibold rounded-xl mt-1"
                  endContent={<ArrowRight size={14} />}
                >
                  Broadcast Alert
                </Button>
              </form>

              {/* Active Bulletins Feed */}
              <div className="pt-4 border-t border-default-100 space-y-3">
                <p className="text-[10px] text-default-400 font-bold uppercase tracking-wider">Active Bulletins</p>
                <div className="space-y-2">
                  {localAnnouncements.map((ann) => (
                    <div key={ann.id} className="p-3 bg-default-50/60 rounded-xl border border-default-100 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[11px] text-foreground">{ann.title}</span>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            ann.priority === 'CRITICAL'
                              ? 'danger'
                              : ann.priority === 'HIGH'
                              ? 'warning'
                              : ann.priority === 'MEDIUM'
                              ? 'accent'
                              : 'default'
                          }
                          className="text-[8px] font-extrabold h-4.5"
                        >
                          {ann.priority}
                        </Chip>
                      </div>
                      <p className="text-[10px] text-default-500 leading-normal">{ann.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Health loop */}
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-500 mb-1">
                <Activity size={20} />
                <h3 className="font-bold text-sm">Stadium Utilities Load</h3>
              </div>

              <div className="space-y-4">
                {/* Power Grid */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-default-600 font-medium">
                      <Power size={13} className="text-success-500" />
                      Power Grid Supply
                    </span>
                    <span className="font-bold text-success-600">STABLE (96%)</span>
                  </div>
                  <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-success-500 h-full rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                {/* Wi-Fi */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-default-600 font-medium">
                      <Wifi size={13} className="text-success-500" />
                      Concourse Wi-Fi Load
                    </span>
                    <span className="font-bold text-success-600">NOMINAL (78%)</span>
                  </div>
                  <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-success-500 h-full rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>

                {/* Water Reservoir */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-default-600 font-medium">
                      <Droplet size={13} className="text-success-500" />
                      Water Loop Supply
                    </span>
                    <span className="font-bold text-success-600">OPTIMAL (92%)</span>
                  </div>
                  <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-success-500 h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
