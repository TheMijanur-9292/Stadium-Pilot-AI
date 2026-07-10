import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [AIModule, PrismaModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
