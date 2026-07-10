import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async updatePreferences(
    userId: string,
    data: { preferredLanguage?: string; accessibilityPreference?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredLanguage: data.preferredLanguage,
        accessibilityPreference: data.accessibilityPreference,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        preferredLanguage: true,
        accessibilityPreference: true,
        avatar: true,
      },
    });
  }
}
