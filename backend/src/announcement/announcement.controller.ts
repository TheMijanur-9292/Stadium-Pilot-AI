import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('announcements')
@Controller('api/announcements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnnouncementController {
  constructor(private announcementService: AnnouncementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active announcements' })
  async getAll() {
    return this.announcementService.findAll();
  }
}
