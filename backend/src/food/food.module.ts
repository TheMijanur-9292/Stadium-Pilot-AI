import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FoodController],
  providers: [FoodService, PrismaService],
  exports: [FoodService],
})
export class FoodModule {}
