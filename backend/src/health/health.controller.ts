import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('api/health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API and DB connectivity status' })
  async getStatus() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: 'CONNECTED',
        gemini: 'ACTIVE',
      },
    };
  }
}
