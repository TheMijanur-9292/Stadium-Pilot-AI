import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pass'),
}));

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: 'u-1',
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'hashed-password',
    role: 'FAN',
  };

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue(mockUser),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const result = await controller.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should hash and create user', async () => {
      const result = await controller.create({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'FAN',
      });
      expect(result.id).toBe(mockUser.id);
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await controller.update('u-1', {
        fullName: 'Updated Name',
      });
      expect(result.id).toBe(mockUser.id);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      const result = await controller.delete('u-1');
      expect(result).toEqual(mockUser);
    });
  });
});
