import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getFanSummary() {
    const [venues, foodVendors, announcements, transportHubs] = await Promise.all([
      this.prisma.venue.findMany({ take: 3 }),
      this.prisma.foodVendor.findMany({ take: 3 }),
      this.prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      this.prisma.transportationHub.findMany({ take: 3 }),
    ]);

    return {
      venues,
      foodVendors,
      announcements,
      transportHubs,
    };
  }

  async getVolunteerSummary() {
    const [facilities, announcements] = await Promise.all([
      this.prisma.facility.findMany({ take: 3 }),
      this.prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    // Simulating volunteer shift assignments matching the volunteer persona
    return {
      shiftDetails: {
        title: 'Gate B Entry Helper',
        time: '18:00 - 22:00',
        location: 'MetLife Stadium - Gate B',
      },
      facilities,
      announcements,
    };
  }

  async getOrganizerSummary() {
    const [totalUsers, totalVenues, emergencyPoints, crowdZones, announcements] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.venue.count(),
      this.prisma.emergencyPoint.findMany(),
      this.prisma.crowdZone.findMany(),
      this.prisma.announcement.findMany(),
    ]);

    return {
      totalUsers,
      totalVenues,
      emergencyPoints,
      crowdZones,
      announcements,
    };
  }
}
