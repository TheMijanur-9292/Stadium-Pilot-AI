import { Module } from '@nestjs/common';
import { ConcessionsService } from './concessions.service';
import { ConcessionsController } from './concessions.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ConcessionsService],
  controllers: [ConcessionsController],
})
export class ConcessionsModule {}
