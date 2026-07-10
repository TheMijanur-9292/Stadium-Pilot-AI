import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('settings')
@Controller('api/settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Post('update')
  @ApiOperation({ summary: 'Update user settings and preferences' })
  async update(
    @Req() req: { user: { id: string } },
    @Body()
    body: { preferredLanguage?: string; accessibilityPreference?: string },
  ) {
    return this.settingsService.updatePreferences(req.user.id, body);
  }
}
