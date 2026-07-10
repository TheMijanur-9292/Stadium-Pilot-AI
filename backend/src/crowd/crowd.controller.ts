import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CrowdService } from './crowd.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('crowd')
@Controller('api/crowd')
export class CrowdController {
  constructor(private crowdService: CrowdService) {}

  @Get('zones')
  @ApiOperation({ summary: 'Get all stadium crowd zones and density metrics' })
  async getZones() {
    return this.crowdService.getZones();
  }

  @Get('sensors')
  @ApiOperation({ summary: 'Get all stadium crowd zones (alias)' })
  async getSensors() {
    return this.crowdService.getZones();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENUE_STAFF, Role.ORGANIZER, Role.ADMIN)
  @Patch('zones/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update crowd zone density' })
  async updateZone(
    @Param('id') id: string,
    @Body() body: { crowdLevel: string },
  ) {
    return this.crowdService.updateZone(id, body.crowdLevel);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENUE_STAFF, Role.ORGANIZER, Role.ADMIN)
  @Patch('sensors/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update crowd zone density (alias)' })
  async updateSensor(
    @Param('id') id: string,
    @Body() body: { currentDensity: string },
  ) {
    return this.crowdService.updateZone(id, body.currentDensity);
  }
}
