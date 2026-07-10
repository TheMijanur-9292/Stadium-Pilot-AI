import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  async addMessage(conversationId: string, role: string, content: string) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    });
  }
}
