import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma.service';

describe('ConversationService', () => {
  let service: ConversationService;
  let prisma: PrismaService;

  const mockPrisma = {
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call prisma.conversation.create', async () => {
      mockPrisma.conversation.create.mockResolvedValue({
        id: 'c-1',
        title: 'Test Chat',
      });
      const result = await service.create('user-1', 'Test Chat');
      expect(result).toEqual({ id: 'c-1', title: 'Test Chat' });
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', title: 'Test Chat' },
      });
    });
  });

  describe('findAll', () => {
    it('should call prisma.conversation.findMany', async () => {
      mockPrisma.conversation.findMany.mockResolvedValue([]);
      const result = await service.findAll('user-1');
      expect(result).toEqual([]);
      expect(prisma.conversation.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call prisma.conversation.findUnique', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue({
        id: 'c-1',
        messages: [],
      });
      const result = await service.findOne('c-1');
      expect(result).toEqual({ id: 'c-1', messages: [] });
    });
  });

  describe('remove', () => {
    it('should call prisma.conversation.delete', async () => {
      mockPrisma.conversation.delete.mockResolvedValue({ id: 'c-1' });
      const result = await service.remove('c-1');
      expect(result).toEqual({ id: 'c-1' });
    });
  });

  describe('addMessage', () => {
    it('should call prisma.message.create', async () => {
      mockPrisma.message.create.mockResolvedValue({ id: 'm-1' });
      const result = await service.addMessage('c-1', 'user', 'hello');
      expect(result).toEqual({ id: 'm-1' });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: { conversationId: 'c-1', role: 'user', content: 'hello' },
      });
    });
  });
});
