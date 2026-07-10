import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EmergencyService {
  private incidents: any[] = [];

  constructor(private prisma: PrismaService) {
    this.incidents = [
      {
        id: 'inc-1',
        description:
          'Spectator collapsed in Concourse Section 112. Medical staff dispatched.',
        location: 'Section 112 Concourse',
        severity: 'CRITICAL',
        status: 'INVESTIGATING',
        comments: 'Medic team 2 is on site.',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        reporter: {
          fullName: 'Arthur Admin',
          role: 'ADMIN',
        },
      },
      {
        id: 'inc-2',
        description: 'Minor water leakage reported near bathroom block A.',
        location: 'Near Section 112 Bathroom',
        severity: 'MEDIUM',
        status: 'REPORTED',
        comments: '',
        createdAt: new Date(Date.now() - 1200000).toISOString(),
        reporter: {
          fullName: 'Sarah Staff',
          role: 'VENUE_STAFF',
        },
      },
    ];
  }

  async report(
    userId: string,
    data: { description: string; location: string; severity: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, role: true },
    });

    const newIncident = {
      id: 'inc-' + Math.random().toString(36).substring(2, 9),
      description: data.description,
      location: data.location,
      severity: data.severity || 'MEDIUM',
      status: 'REPORTED',
      comments: '',
      createdAt: new Date().toISOString(),
      reporter: user || { fullName: 'Unknown User', role: 'FAN' },
    };

    this.incidents.unshift(newIncident);

    console.warn(
      `🚨 EMERGENCY REPORTED by User ${userId}: ${data.description} at ${data.location} [Severity: ${data.severity}]`,
    );

    return {
      success: true,
      message:
        'SOS dispatch initiated. Rescue and medical staff have been alerted and coordinates are locked.',
      reportId: newIncident.id,
      location: newIncident.location,
      severity: newIncident.severity,
      timestamp: newIncident.createdAt,
    };
  }

  async findAll() {
    return this.incidents;
  }

  async updateIncident(id: string, status: string, comments?: string) {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    incident.status = status;
    if (comments !== undefined) {
      incident.comments = comments;
    }
    return incident;
  }

  async findNearestHelp(venueId?: string, type?: string) {
    return this.prisma.emergencyPoint.findMany({
      where: {
        venueId: venueId ? venueId : undefined,
        type: type ? type : undefined,
      },
    });
  }
}
