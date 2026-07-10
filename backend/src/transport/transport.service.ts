import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  async findOptions(venueId?: string) {
    return this.prisma.transportationHub.findMany({
      where: venueId ? { venueId } : undefined,
    });
  }
}
