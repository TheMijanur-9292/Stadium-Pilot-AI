import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VenueService } from './venue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('venues')
@Controller('api/venues')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VenueController {
  constructor(private venueService: VenueService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all World Cup venues' })
  async getAll() {
    return this.venueService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific venue' })
  async getDetails(@Param('id') id: string) {
    return this.venueService.findOne(id);
  }
}
