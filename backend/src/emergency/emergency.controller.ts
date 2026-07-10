import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('emergency')
@Controller('api/emergency')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmergencyController {
  constructor(private emergencyService: EmergencyService) {}

  @Post('report')
  @ApiOperation({ summary: 'Submit a new SOS or safety incident report' })
  async reportIncident(
    @Req() req: { user: { id: string } },
    @Body() body: { description: string; location: string; severity: string },
  ) {
    return this.emergencyService.report(req.user.id, body);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Get all safety and emergency incidents' })
  async getIncidents() {
    return this.emergencyService.findAll();
  }

  @Patch('incidents/:id')
  @ApiOperation({ summary: 'Update incident status or comments' })
  async updateIncident(
    @Param('id') id: string,
    @Body() body: { status: string; comments?: string },
  ) {
    return this.emergencyService.updateIncident(id, body.status, body.comments);
  }

  @Get('nearest-help')
  @ApiOperation({ summary: 'Locate nearest first-aid or security points' })
  async getNearestHelp(
    @Query('venueId') venueId?: string,
    @Query('type') type?: string,
  ) {
    return this.emergencyService.findNearestHelp(venueId, type);
  }
}
