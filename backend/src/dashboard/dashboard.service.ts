import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getFanSummary() {
    const venues = await this.prisma.venue.findMany({ take: 3 });
    const foodVendors = await this.prisma.foodVendor.findMany({ take: 3 });
    const announcements = await this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    const transportHubs = await this.prisma.transportationHub.findMany({
      take: 3,
    });

    return {
      venues,
      foodVendors,
      announcements,
      transportHubs,
    };
  }

  async getVolunteerSummary() {
    const facilities = await this.prisma.facility.findMany({ take: 3 });
    const announcements = await this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

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
    const totalUsers = await this.prisma.user.count();
    const totalVenues = await this.prisma.venue.count();
    const emergencyPoints = await this.prisma.emergencyPoint.findMany();
    const crowdZones = await this.prisma.crowdZone.findMany();
    const announcements = await this.prisma.announcement.findMany();

    return {
      totalUsers,
      totalVenues,
      emergencyPoints,
      crowdZones,
      announcements,
    };
  }
}
