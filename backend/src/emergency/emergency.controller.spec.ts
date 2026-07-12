import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';

describe('EmergencyController', () => {
  let controller: EmergencyController;
  let service: EmergencyService;

  const mockEmergencyService = {
    report: jest.fn().mockResolvedValue({ success: true }),
    findAll: jest.fn().mockResolvedValue([]),
    updateIncident: jest.fn().mockResolvedValue({ status: 'RESOLVED' }),
    findNearestHelp: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyController],
      providers: [
        { provide: EmergencyService, useValue: mockEmergencyService },
      ],
    }).compile();

    controller = module.get<EmergencyController>(EmergencyController);
    service = module.get<EmergencyService>(EmergencyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reportIncident', () => {
    it('should call report method', async () => {
      const req = { user: { id: 'u-1' } };
      const body = {
        description: 'leak',
        location: 'Gate A',
        severity: 'HIGH',
      };
      const result = await controller.reportIncident(req, body);
      expect(result.success).toBe(true);
      expect(service.report).toHaveBeenCalledWith('u-1', body);
    });
  });

  describe('getIncidents', () => {
    it('should return all incidents', async () => {
      const result = await controller.getIncidents();
      expect(result).toEqual([]);
    });
  });

  describe('updateIncident', () => {
    it('should call updateIncident method', async () => {
      const result = await controller.updateIncident('inc-1', {
        status: 'RESOLVED',
        comments: 'done',
      });
      expect(result.status).toBe('RESOLVED');
      expect(service.updateIncident).toHaveBeenCalledWith(
        'inc-1',
        'RESOLVED',
        'done',
      );
    });
  });

  describe('getNearestHelp', () => {
    it('should call findNearestHelp method', async () => {
      const result = await controller.getNearestHelp('v-1', 'MEDICAL');
      expect(result).toEqual([]);
      expect(service.findNearestHelp).toHaveBeenCalledWith('v-1', 'MEDICAL');
    });
  });
});
