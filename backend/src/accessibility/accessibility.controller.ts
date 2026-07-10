import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('accessibility')
@Controller('api/accessibility')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccessibilityController {
  @Get('rules')
  @ApiOperation({ summary: 'Get accessibility layout requirements' })
  async getRules() {
    return {
      wheelchairAccessibleGates: ['Gate A', 'Gate C'],
      audioAssistanceSectors: ['Section 110', 'Section 112', 'Section 114'],
      guidelines: [
        'Keep wheelchair paths clear of temporary concessions.',
        'Ensure visual assistance descriptors are calibrated on stadium guide boards.',
      ],
    };
  }
}
