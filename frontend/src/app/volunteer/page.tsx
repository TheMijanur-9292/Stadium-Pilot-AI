'use client';
import Input from '@/components/Input';
import Button from '@/components/Button';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import { Calendar, ClipboardList, MapPin, Plus, User as UserIcon, Send, Clock, Check } from 'lucide-react';
import { useState } from 'react';

export default function VolunteerPortalPage() {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLoc, setTaskLoc] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [creating, setCreating] = useState(false);

  // Queries:
  // If Organizer or Admin, load ALL tasks. If Volunteer, load only MY tasks.
  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: isOrganizer ? ['allTasks'] : ['myTasks'],
    queryFn: () =>
      api.get(isOrganizer ? '/api/volunteer/tasks/all' : '/api/volunteer/tasks').then((res) => res.data),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/volunteer/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      setTaskTitle('');
      setTaskDesc('');
      setTaskLoc('');
      setAssigneeId('');
      setCreating(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) =>
      api.patch(`/api/volunteer/tasks/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: isOrganizer ? ['allTasks'] : ['myTasks'] });
    },
  });

  if (!user) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDesc || !taskLoc || !assigneeId) return;

    createTaskMutation.mutate({
      assigneeId,
      title: taskTitle,
      description: taskDesc,
      location: taskLoc,
      shiftStart: new Date(),
      shiftEnd: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours shift
    });
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

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Tasks List */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-bold text-sm text-default-600 pl-1 uppercase tracking-wider">
              {isOrganizer ? 'Tournament Volunteer Task Register' : 'Your Operations Schedule'}
            </h3>

            {tasksLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task: any) => (
                  <Card key={task.id} className="border border-default-100 bg-content1/50">
                    <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
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
                            className="h-5 text-[8px] font-bold"
                          >
                            {task.status.replace('_', ' ')}
                          </Chip>
                        </div>
                        <p className="text-xs text-default-500 leading-relaxed">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[10px] text-default-400 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-primary-500" />
                            {task.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-primary-500" />
                            Shift:{' '}
                            {new Date(task.shiftStart).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isOrganizer && task.assignee && (
                            <span className="flex items-center gap-1">
                              <UserIcon size={11} className="text-primary-500" />
                              Assigned to: {task.assignee.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isOrganizer && task.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          color={task.status === 'IN_PROGRESS' ? 'success' : 'warning'}
                          variant="ghost"
                          className="font-semibold rounded-xl flex-shrink-0"
                          onPress={() => handleStatusToggle(task.id, task.status)}
                          isLoading={updateStatusMutation.isPending}
                        >
                          {task.status === 'IN_PROGRESS' ? 'Complete' : 'Start Task'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-default-400 bg-default-50 rounded-2xl border border-default-100">
                No tasks cataloged for this workspace.
              </div>
            )}
          </div>

          {/* Supervisor dispatch panel (Organizer and Admin only) */}
          {isOrganizer && (
            <div className="space-y-4 lg:col-span-1">
              <h3 className="font-bold text-sm text-default-600 pl-1 uppercase tracking-wider">Dispatch Task</h3>
              
              <Card className="glass-card border border-default-100 shadow-sm h-fit">
                <CardContent className="p-6">
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <label className="block text-xs font-semibold text-default-600 mb-1">Task Title</label>
<Input
                      
                      placeholder="e.g. VIP Reception Guard"
                      
                      variant="primary"
                      
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground pl-1">Task Description</label>
                      <textarea
                        placeholder="Enter directions for the volunteer..."
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        className="w-full bg-transparent border-2 border-default-200 hover:border-default-400 focus:border-primary-500 rounded-xl px-3 py-2.5 text-xs text-default-700 outline-none transition-all cursor-pointer dark:text-default-300 min-h-20"
                      />
                    </div>
                    <label className="block text-xs font-semibold text-default-600 mb-1">Location Coordinates / Stand</label>
<Input
                      
                      placeholder="e.g. Section 112 Lobby"
                      
                      variant="primary"
                      
                      value={taskLoc}
                      onChange={(e) => setTaskLoc(e.target.value)}
                    />
                    <label className="block text-xs font-semibold text-default-600 mb-1">Assignee Volunteer User ID</label>
<Input
                      
                      placeholder="Enter volunteer UUID"
                      
                      variant="primary"
                      
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                    />

                    {/* Pre-fill default volunteer helper link */}
                    <div className="text-[10px] text-default-400 pl-1">
                      Tip: Enter volunteer UUID from database or use quick copy.
                    </div>

                    <Button
                      type="submit"
                      color="primary"
                      className="w-full font-semibold rounded-xl"
                      isLoading={createTaskMutation.isPending}
                    >
                      Assign Shift Task
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}







