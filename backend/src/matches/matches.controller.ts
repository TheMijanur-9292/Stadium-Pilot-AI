import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('matches')
@Controller('api')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get('matches')
  @ApiOperation({ summary: 'Get all tournament matches' })
  async getMatches() {
    return this.matchesService.findAll();
  }

  @Get('matches/live')
  @ApiOperation({ summary: 'Get current live match' })
  async getLiveMatch() {
    return this.matchesService.findLive();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tickets for logged in user' })
  async getTickets(@Req() req: { user: { id: string } }) {
    return this.matchesService.findTicketsForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENUE_STAFF, Role.ADMIN)
  @Post('tickets/:id/scan')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Scan/Validate a ticket (Venue Staff and Admins only)',
  })
  async scanTicket(@Param('id') id: string) {
    return this.matchesService.scanTicket(id);
  }
}
