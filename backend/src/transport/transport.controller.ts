import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TransportService } from './transport.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('transport')
@Controller('api/transport')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransportController {
  constructor(private transportService: TransportService) {}

  @Get('options')
  @ApiOperation({ summary: 'Get transport options and schedules' })
  async getOptions(@Query('venueId') venueId?: string) {
    return this.transportService.findOptions(venueId);
  }
}
