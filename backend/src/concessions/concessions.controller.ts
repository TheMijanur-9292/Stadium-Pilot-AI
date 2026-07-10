import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConcessionsService } from './concessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('concessions')
@Controller('api/food')
export class ConcessionsController {
  constructor(private concessionsService: ConcessionsService) {}

  @Get('vendors')
  @ApiOperation({ summary: 'Get all food vendors and their menu items' })
  async getVendors() {
    return this.concessionsService.findVendors();
  }

  @Get('vendors/:id/menu')
  @ApiOperation({ summary: 'Get menu items of a specific vendor' })
  async getMenu(@Param('id') id: string) {
    return this.concessionsService.findMenu(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('order')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Place a food order (returns simulated wait time & queue details)',
  })
  async placeOrder(
    @Body()
    body: {
      vendorId: string;
      items: { itemId: string; quantity: number }[];
    },
  ) {
    return this.concessionsService.createOrder(body);
  }
}
