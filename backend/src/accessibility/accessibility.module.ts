import { Module } from '@nestjs/common';
import { AccessibilityController } from './accessibility.controller';

@Module({
  controllers: [AccessibilityController],
})
export class AccessibilityModule {}
