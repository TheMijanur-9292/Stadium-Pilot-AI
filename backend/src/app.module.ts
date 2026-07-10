import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AIModule } from './ai/ai.module';
import { ConversationModule } from './conversation/conversation.module';
import { VenueModule } from './venue/venue.module';
import { FoodModule } from './food/food.module';
import { TransportModule } from './transport/transport.module';
import { EmergencyModule } from './emergency/emergency.module';
import { AccessibilityModule } from './accessibility/accessibility.module';
import { CrowdModule } from './crowd/crowd.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { HealthModule } from './health/health.module';
import { NavigationModule } from './navigation/navigation.module';
import { VolunteerModule } from './volunteer/volunteer.module';
import { MatchesModule } from './matches/matches.module';
import { ConcessionsModule } from './concessions/concessions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AIModule,
    ConversationModule,
    VenueModule,
    FoodModule,
    TransportModule,
    EmergencyModule,
    AccessibilityModule,
    CrowdModule,
    AnnouncementModule,
    DashboardModule,
    SettingsModule,
    HealthModule,
    NavigationModule,
    VolunteerModule,
    MatchesModule,
    ConcessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
