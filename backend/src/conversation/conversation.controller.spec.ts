import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { AIService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';

describe('ConversationController', () => {
  let controller: ConversationController;

  const mockConversation = {
    id: 'c-1',
    messages: [{ role: 'user', content: 'hello' }],
  };

  const mockConversationService = {
    findOne: jest.fn(),
    create: jest.fn(),
    addMessage: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    remove: jest.fn(),
  };

  const mockAIService = {
    getResponse: jest.fn().mockResolvedValue({ response: 'ok', text: 'ok' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        { provide: ConversationService, useValue: mockConversationService },
        { provide: AIService, useValue: mockAIService },
      ],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('askAi', () => {
    it('should query existing conversation and invoke AI service', async () => {
      mockConversationService.findOne.mockResolvedValue(mockConversation);
      const req = { user: { id: 'u-1' } };
      const body = { message: 'hello', conversationId: 'c-1' };

      const result = await controller.askAi(req, body);
      expect(result.conversationId).toBe('c-1');
    });

    it('should create new conversation if id is not provided', async () => {
      mockConversationService.create.mockResolvedValue({ id: 'c-new' });
      const req = { user: { id: 'u-1' } };
      const body = { message: 'hello' };

      const result = await controller.askAi(req, body);
      expect(result.conversationId).toBe('c-new');
    });
  });

  describe('getConversations', () => {
    it('should call findAll', async () => {
      const req = { user: { id: 'u-1' } };
      const result = await controller.getConversations(req);
      expect(result).toEqual([]);
    });
  });

  describe('getConversation', () => {
    it('should return conversation with parsed messages', async () => {
      mockConversationService.findOne.mockResolvedValue(mockConversation);
      const result = await controller.getConversation('c-1');
      expect(result.id).toBe('c-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockConversationService.findOne.mockResolvedValue(null);
      await expect(controller.getConversation('c-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      const result = await controller.deleteConversation('c-1');
      expect(result.success).toBe(true);
    });
  });
});
