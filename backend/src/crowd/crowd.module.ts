import { Module } from '@nestjs/common';
import { CrowdService } from './crowd.service';
import { CrowdController } from './crowd.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CrowdService],
  controllers: [CrowdController],
})
export class CrowdModule {}
