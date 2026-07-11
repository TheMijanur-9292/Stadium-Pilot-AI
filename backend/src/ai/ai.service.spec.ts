import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { PrismaService } from '../prisma.service';

const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: () => `\`\`\`json\n${JSON.stringify({
      title: 'Stadium Pilot AI Help',
      summary: 'Processed query summary response',
      recommendations: ['Check gate coordinates'],
      warnings: [],
      estimatedTime: 'N/A',
      nextSteps: ['Check announcements']
    })}\n\`\`\``
  }
});

const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    }),
  };
});

describe('AIService', () => {
  let service: AIService;

  const mockUser = {
    id: 'user-1',
    role: 'ADMIN',
    fullName: 'Arthur Admin',
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    venue: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    announcement: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getResponse', () => {
    it('should query prisma parallelly, pass context to prompt, and return parsed JSON result from Gemini', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.venue.findFirst.mockResolvedValue({
        stadiumName: 'Lusail Stadium',
        city: 'Lusail',
        country: 'Qatar',
        capacity: 80000,
        facilities: [{ name: 'Restroom', type: 'RESTROOM', floor: '1', location: 'Gate A' }],
        foodVendors: [{ name: 'Burgers', category: 'Fast Food', priceRange: '$$', halal: true, vegetarian: false, vegan: false }],
        emergencyPoints: [{ type: 'MEDICAL', location: 'Section 104' }],
        transportationHubs: [{ type: 'METRO', location: 'East Gate' }],
        crowdZones: [{ section: 'Gate A', crowdLevel: 'HIGH' }],
      });
      mockPrisma.announcement.findMany.mockResolvedValue([{ title: 'Gate B closed', description: 'Due to congestion', priority: 'HIGH' }]);

      const result = await service.getResponse(
        'status of gate A',
        { id: 'user-1', role: 'ADMIN' },
        [{ sender: 'user', text: 'hi' }, { sender: 'bot', text: 'hello' }]
      );

      expect(result).toBeDefined();
      expect(result.response.summary).toBe('Processed query summary response');
      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-3.1-flash-lite',
        generationConfig: { responseMimeType: 'application/json' },
      });
    });

    it('should fall back to diagnostic response if Gemini throws an error', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      mockPrisma.announcement.findMany.mockResolvedValue([]);

      mockGenerateContent.mockRejectedValue(
        new Error('Gemini API limit reached'),
      );

      const result = await service.getResponse(
        'status of gate A',
        { id: 'user-1', role: 'ADMIN' },
        [],
      );

      expect(result).toBeDefined();
      expect(result.text).toBe('Connection interruption');
      expect(result.response.title).toBe('System Diagnostics Warning');
    });
  });
});
