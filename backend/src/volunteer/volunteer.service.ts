import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface VolunteerTask {
  id: string;
  assigneeId: string;
  title: string;
  description: string;
  status: string;
  shiftStart: string;
  shiftEnd: string;
  location: string;
}

@Injectable()
export class VolunteerService {
  private tasks: VolunteerTask[] = [];

  constructor(private prisma: PrismaService) {
    this.tasks = [
      {
        id: 'task-1',
        assigneeId: 'all',
        title: 'Gate A Access Control',
        description:
          'Help scan fan entry passes and manage queue lines at Gate A entrance concourse.',
        status: 'PENDING',
        shiftStart: new Date(Date.now() - 3600000).toISOString(),
        shiftEnd: new Date(Date.now() + 14400000).toISOString(),
        location: 'Gate A Entry Lobby',
      },
      {
        id: 'task-2',
        assigneeId: 'all',
        title: 'Wheelchair Assistance Lift 3',
        description:
          'Coordinate elevator boarding for accessibility pass holders near Lift 3.',
        status: 'IN_PROGRESS',
        shiftStart: new Date(Date.now() - 7200000).toISOString(),
        shiftEnd: new Date(Date.now() + 7200000).toISOString(),
        location: 'Concourse Section 104',
      },
    ];
  }

  async findTasksForUser(userId: string) {
    return this.tasks.map((t) => ({
      ...t,
      assigneeId: t.assigneeId === 'all' ? userId : t.assigneeId,
    }));
  }

  async findAllTasks() {
    return this.tasks;
  }

  async updateTaskStatus(taskId: string, status: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    task.status = status;
    return task;
  }

  async createTask(data: {
    assigneeId: string;
    title: string;
    description: string;
    shiftStart: Date;
    shiftEnd: Date;
    location: string;
  }) {
    const newTask: VolunteerTask = {
      id: `task-${Date.now()}`,
      assigneeId: data.assigneeId,
      title: data.title,
      description: data.description,
      status: 'PENDING',
      shiftStart: new Date(data.shiftStart).toISOString(),
      shiftEnd: new Date(data.shiftEnd).toISOString(),
      location: data.location,
    };
    this.tasks.push(newTask);
    return newTask;
  }
}
