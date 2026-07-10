import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('food')
@Controller('api/food')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodController {
  constructor(private foodService: FoodService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby food vendors' })
  async getNearby(@Query('venueId') venueId?: string) {
    return this.foodService.findNearby(venueId);
  }

  @Get('recommendations')
  @ApiOperation({
    summary: 'Get food recommendations based on dietary preferences',
  })
  async getRecommendations(
    @Query('halal') halal?: string,
    @Query('vegetarian') vegetarian?: string,
    @Query('vegan') vegan?: string,
    @Query('venueId') venueId?: string,
  ) {
    return this.foodService.findRecommendations({
      halal: halal === 'true',
      vegetarian: vegetarian === 'true',
      vegan: vegan === 'true',
      venueId,
    });
  }
}
