import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VenueService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.venue.findMany({
      include: {
        facilities: true,
        crowdZones: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.venue.findUnique({
      where: { id },
      include: {
        facilities: true,
        foodVendors: true,
        emergencyPoints: true,
        transportationHubs: true,
        crowdZones: true,
      },
    });
  }
}
