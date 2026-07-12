import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn().mockResolvedValue({ access_token: 'token' }),
    register: jest.fn().mockResolvedValue({ access_token: 'token' }),
    forgotPassword: jest.fn().mockResolvedValue({ message: 'sent' }),
    resetPassword: jest.fn().mockResolvedValue({ message: 'success' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', async () => {
      mockAuthService.validateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });
      const loginDto = { email: 'test@example.com', password: 'password' };
      const result = await controller.login(loginDto);
      expect(result.access_token).toBe('token');
    });
  });

  describe('register', () => {
    it('should register and return access token', async () => {
      const body = {
        email: 't@e.com',
        password: 'p',
        fullName: 'name',
        role: 'FAN' as any,
      };
      const result = await controller.register(body);
      expect(result.access_token).toBe('token');
    });
  });

  describe('refreshToken', () => {
    it('should return refreshed token', async () => {
      const result = await controller.refreshToken({ refreshToken: 'ref' });
      expect(result.access_token).toBeDefined();
    });
  });
});
