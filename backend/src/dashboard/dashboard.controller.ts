import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('fan-summary')
  @ApiOperation({ summary: 'Get summary for fan dashboard' })
  async getFanSummary() {
    return this.dashboardService.getFanSummary();
  }

  @Get('volunteer-summary')
  @UseGuards(RolesGuard)
  @Roles(Role.VOLUNTEER, Role.ADMIN)
  @ApiOperation({ summary: 'Get summary for volunteer dashboard' })
  async getVolunteerSummary() {
    return this.dashboardService.getVolunteerSummary();
  }

  @Get('organizer-summary')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @ApiOperation({ summary: 'Get summary for organizer dashboard' })
  async getOrganizerSummary() {
    return this.dashboardService.getOrganizerSummary();
  }
}
