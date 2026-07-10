import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AIService } from '../ai/ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('api/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
    private aiService: AIService,
  ) {}

  @Post('ask-ai')
  @ApiOperation({ summary: 'Send a message to the operations copilot' })
  async askAi(
    @Req() req: { user: any },
    @Body()
    body: {
      message: string;
      conversationId?: string;
      page?: string;
      venueId?: string;
    },
  ) {
    let conversationId = body.conversationId;
    let history: any[] = [];

    if (conversationId) {
      const conv = await this.conversationService.findOne(conversationId);
      if (!conv) {
        throw new NotFoundException('Conversation not found');
      }
      history = conv.messages.map((m) => ({
        sender: m.role === 'user' ? 'user' : 'bot',
        text: m.content,
      }));
    } else {
      // Create new conversation
      const newConv = await this.conversationService.create(
        req.user.id,
        body.message.substring(0, 30) || 'New Conversation',
      );
      conversationId = newConv.id;
    }

    // Call AI Service
    const aiResponse = await this.aiService.getResponse(
      body.message,
      req.user,
      history,
      null,
      body.page,
      body.venueId,
    );

    // Save user message
    await this.conversationService.addMessage(
      conversationId,
      'user',
      body.message,
    );

    // Save AI response (we save the response text or stringified JSON)
    const contentToStore =
      typeof aiResponse.response === 'object'
        ? JSON.stringify(aiResponse.response)
        : aiResponse.text;
    await this.conversationService.addMessage(
      conversationId,
      'bot',
      contentToStore,
    );

    return {
      conversationId,
      ...aiResponse,
    };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the user' })
  async getConversations(@Req() req: { user: { id: string } }) {
    return this.conversationService.findAll(req.user.id);
  }

  @Get('conversation/:id')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  async getConversation(@Param('id') id: string) {
    const conv = await this.conversationService.findOne(id);
    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }
    return {
      ...conv,
      messages: conv.messages.map((m) => {
        let contentParsed = m.content;
        try {
          if (m.content.startsWith('{')) {
            contentParsed = JSON.parse(m.content);
          }
        } catch {}
        return {
          ...m,
          contentParsed,
        };
      }),
    };
  }

  @Delete('conversation/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  async deleteConversation(@Param('id') id: string) {
    await this.conversationService.remove(id);
    return { success: true };
  }
}
