import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    fullName: 'Test User',
    role: Role.FAN,
    preferredLanguage: 'English',
    accessibilityPreference: 'None',
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user info (without password) if email and password match', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.password).toBeUndefined();
    });

    it('should return null if password compare fails', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should sign payload and return JWT token along with user details', async () => {
      const result = await service.login(mockUser);
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          role: mockUser.role,
          preferredLanguage: mockUser.preferredLanguage,
          accessibilityPreference: mockUser.accessibilityPreference,
          avatar: mockUser.avatar,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });

  describe('register', () => {
    it('should hash password, create user, and log them in', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: Role.FAN,
      });

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        fullName: 'Test User',
        role: Role.FAN,
      });
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('should throw BadRequestException if fields are missing', async () => {
      await expect(
        service.register({
          email: '',
          password: 'password',
          fullName: 'Test User',
          role: Role.FAN,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should return simulated reset token if user exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      const result = await service.forgotPassword('test@example.com');
      expect(result).toHaveProperty('resetToken');
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.forgotPassword('notfound@example.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should update password if user exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.updatePassword = jest.fn().mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password-new');

      const result = await service.resetPassword('test@example.com', 'newpass123');
      expect(result.message).toBe('Password has been reset successfully');
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.resetPassword('notfound@example.com', 'pass')).rejects.toThrow(BadRequestException);
    });
  });
});
