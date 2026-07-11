import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyService } from './emergency.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EmergencyService', () => {
  let service: EmergencyService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    emergencyPoint: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<EmergencyService>(EmergencyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('report', () => {
    it('should create and store an emergency incident', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        fullName: 'Arthur Admin',
        role: 'ADMIN',
      });

      const result = await service.report('user-1', {
        description: 'Water leak',
        location: 'Bathroom Gate A',
        severity: 'MEDIUM',
      });

      expect(result.success).toBe(true);
      expect(result.reportId).toBeDefined();
      expect(result.location).toBe('Bathroom Gate A');

      const list = await service.findAll();
      expect(list.some((i) => i.id === result.reportId)).toBe(true);
    });
  });

  describe('updateIncident', () => {
    it('should update status and comments of an incident', async () => {
      const list = await service.findAll();
      const firstIncident = list[0];

      const result = await service.updateIncident(
        firstIncident.id,
        'RESOLVED',
        'Issue fixed.',
      );
      expect(result.status).toBe('RESOLVED');
      expect(result.comments).toBe('Issue fixed.');
    });

    it('should throw NotFoundException if incident not found', async () => {
      await expect(
        service.updateIncident('invalid-id', 'RESOLVED'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findNearestHelp', () => {
    it('should query prisma.emergencyPoint.findMany', async () => {
      mockPrisma.emergencyPoint.findMany.mockResolvedValue([
        { id: 'ep-1', location: 'Gate A' },
      ]);

      const result = await service.findNearestHelp('v-1', 'MEDICAL');
      expect(result).toEqual([{ id: 'ep-1', location: 'Gate A' }]);
      expect(prisma.emergencyPoint.findMany).toHaveBeenCalledWith({
        where: { venueId: 'v-1', type: 'MEDICAL' },
      });
    });
  });
});
