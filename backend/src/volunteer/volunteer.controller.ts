import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VolunteerService } from './volunteer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('volunteer')
@Controller('api/volunteer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VolunteerController {
  constructor(private volunteerService: VolunteerService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Get assigned tasks for the logged in volunteer' })
  async getMyTasks(@Req() req: { user: { id: string } }) {
    return this.volunteerService.findTasksForUser(req.user.id);
  }

  @Patch('tasks/:id/status')
  @ApiOperation({ summary: 'Update status of an assigned volunteer task' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.volunteerService.updateTaskStatus(id, body.status);
  }

  @Get('tasks/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all volunteer tasks (Organizers/Admins only)' })
  async getAllTasks() {
    return this.volunteerService.findAllTasks();
  }

  @Post('tasks')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @ApiOperation({
    summary: 'Create and assign a new volunteer task (Organizers/Admins only)',
  })
  async createTask(
    @Body()
    body: {
      assigneeId: string;
      title: string;
      description: string;
      shiftStart: Date;
      shiftEnd: Date;
      location: string;
    },
  ) {
    return this.volunteerService.createTask(body);
  }
}
