import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CrowdService {
  constructor(private prisma: PrismaService) {}

  async getZones() {
    return this.prisma.crowdZone.findMany({
      orderBy: { section: 'asc' },
    });
  }

  async updateZone(id: string, crowdLevel: string) {
    const zone = await this.prisma.crowdZone.findUnique({
      where: { id },
    });

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    return this.prisma.crowdZone.update({
      where: { id },
      data: { crowdLevel },
    });
  }
}
