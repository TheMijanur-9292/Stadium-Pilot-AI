import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async findNearby(venueId?: string) {
    return this.prisma.foodVendor.findMany({
      where: venueId ? { venueId } : undefined,
    });
  }

  async findRecommendations(preferences: {
    halal?: boolean;
    vegetarian?: boolean;
    vegan?: boolean;
    venueId?: string;
  }) {
    const whereClause: any = {};
    if (preferences.venueId) whereClause.venueId = preferences.venueId;
    if (preferences.halal) whereClause.halal = true;
    if (preferences.vegetarian) whereClause.vegetarian = true;
    if (preferences.vegan) whereClause.vegan = true;

    return this.prisma.foodVendor.findMany({
      where: whereClause,
    });
  }
}
