import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('navigation')
@Controller('api/navigation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NavigationController {
  constructor(private navigationService: NavigationService) {}

  @Post('route')
  @ApiOperation({
    summary: 'Calculate shortest route between two stadium points',
  })
  async getRoute(@Body() body: { start: string; end: string }) {
    return this.navigationService.calculateRoute(body.start, body.end);
  }
}
