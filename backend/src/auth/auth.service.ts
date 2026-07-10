import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        accessibilityPreference: user.accessibilityPreference,
        avatar: user.avatar,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
  }) {
    if (!data.email || !data.password || !data.fullName || !data.role) {
      throw new BadRequestException('All signup fields are required');
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role,
    });

    return this.login(user);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with that email does not exist');
    }
    return {
      message:
        'Password reset link sent to registered email address (simulated)',
      resetToken: 'simulated-reset-token-xyz-123',
    };
  }

  async resetPassword(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with that email does not exist');
    }
    const passwordHash = await bcrypt.hash(pass, 10);
    await this.usersService.updatePassword(email, passwordHash);
    return {
      message: 'Password has been reset successfully',
    };
  }
}
