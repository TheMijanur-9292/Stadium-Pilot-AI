import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('ai')
@Controller('api/ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Ask the contextual AI assistant a question' })
  async chat(
    @Req() req: { user: any },
    @Body() body: { message: string; history?: any[]; memory?: any },
  ) {
    return this.aiService.getResponse(
      body.message,
      req.user,
      body.history,
      body.memory,
    );
  }
}
