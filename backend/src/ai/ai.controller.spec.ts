import { Test, TestingModule } from '@nestjs/testing';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';

describe('AIController', () => {
  let controller: AIController;
  let service: AIService;

  const mockAIService = {
    getResponse: jest.fn().mockResolvedValue({ text: 'AI response' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [{ provide: AIService, useValue: mockAIService }],
    }).compile();

    controller = module.get<AIController>(AIController);
    service = module.get<AIService>(AIService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should call AIService.getResponse', async () => {
      const req = { user: { id: '1', role: 'ADMIN' } };
      const body = { message: 'hello', history: [], memory: {} };
      const result = await controller.chat(req, body);
      expect(result).toEqual({ text: 'AI response' });
      expect(service.getResponse).toHaveBeenCalledWith(
        'hello',
        req.user,
        [],
        {},
      );
    });
  });
});
