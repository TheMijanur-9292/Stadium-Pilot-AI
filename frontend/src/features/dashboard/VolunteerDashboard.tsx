'use client';
import Button from '@/components/Button';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import { Calendar, CheckCircle2, AlertTriangle, MapPin, Compass, Play, Check } from 'lucide-react';
import { useState } from 'react';

export default function VolunteerDashboard() {
  const queryClient = useQueryClient();
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['myTasks'],
    queryFn: () => api.get('/api/volunteer/tasks').then((res) => res.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) =>
      api.patch(`/api/volunteer/tasks/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });

  const handleCheckIn = () => {
    setCheckingIn(true);
    setTimeout(() => {
      setCheckingIn(false);
      setCheckedIn(true);
    }, 1500);
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    let nextStatus = 'IN_PROGRESS';
    if (currentStatus === 'IN_PROGRESS') {
      nextStatus = 'COMPLETED';
    } else if (currentStatus === 'PENDING') {
      nextStatus = 'IN_PROGRESS';
    }
    updateStatusMutation.mutate({ id, status: nextStatus });
  };

  // Supervisor instructions mock
  const announcements = [
    { title: 'Gate B Ingress Bottleneck', body: 'Gate B is experiencing heavy ingress. Direct incoming fans with South Stand tickets to Gates C or A.', time: '15 min ago' },
    { title: 'Concession Wait Times', body: 'Concourse Level 1 food courts are highly congested. Advise fans that Level 2 stands are open with <5m queues.', time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-success-600 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="space-y-1">
          <h2 className="text-xl font-bold md:text-2xl">Volunteer Operations 📋</h2>
          <p className="text-xs text-white/80">
            Thank you for helping support FIFA World Cup 2026. View your shift tasks and updates below.
          </p>
        </div>
        
        <Button
          isLoading={checkingIn}
          onPress={handleCheckIn}
          color={checkedIn ? 'default' : 'secondary'}
          
          className={`font-semibold rounded-full size="sm" ${checkedIn ? 'bg-white text-success-600' : ''}`}
          isDisabled={checkedIn}
          endContent={checkedIn ? <Check size={14} /> : null}
        >
          {checkedIn ? 'Checked In' : 'Gate Check-in'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks Checklist */}
        <Card className="glass-card lg:col-span-2 border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary-500 mb-2">
              <Calendar size={20} />
              <h3 className="font-bold text-sm">Your Duty Checklist</h3>
            </div>

            {tasksLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-default-100 bg-default-50/50 hover:bg-default-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{task.title}</p>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            task.status === 'COMPLETED'
                              ? 'success'
                              : task.status === 'IN_PROGRESS'
                              ? 'warning'
                              : 'default'
                          }
                          className="h-5 text-[9px] font-semibold"
                        >
                          {task.status.replace('_', ' ')}
                        </Chip>
                      </div>
                      <p className="text-xs text-default-500 leading-relaxed">{task.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-default-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {task.location}
                        </span>
                        <span>
                          Shift:{' '}
                          {new Date(task.shiftStart).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(task.shiftEnd).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {task.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        color={task.status === 'IN_PROGRESS' ? 'success' : 'warning'}
                        variant="ghost"
                        className="font-semibold rounded-xl"
                        onPress={() => handleStatusToggle(task.id, task.status)}
                        isLoading={updateStatusMutation.isPending}
                      >
                        {task.status === 'IN_PROGRESS' ? 'Complete Task' : 'Start Task'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-default-400 py-6 text-center">No assigned shifts for today.</p>
            )}
          </CardContent>
        </Card>

        {/* Supervisor Broadcasts */}
        <Card className="glass-card border border-default-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-warning-500 mb-2">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-sm">Supervisor Broadcasts</h3>
            </div>

            <div className="space-y-4">
              {announcements.map((ann, idx) => (
                <div
                  key={idx}
                  className="space-y-1 p-3 rounded-xl border border-default-100 bg-warning-50/20 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-warning-700 dark:text-warning-500">{ann.title}</p>
                    <span className="text-[9px] text-default-400">{ann.time}</span>
                  </div>
                  <p className="text-[11px] text-default-500 leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>

            <Button
              
              href="/ai-assistant"
              variant="ghost"
              color="primary"
              size="sm"
              className="w-full font-semibold rounded-xl mt-2"
            >
              Ask Operations Guidelines
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





