import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(@Body() body: any) {
    const { email, password, fullName, role } = body;
    const passwordHash = await bcrypt.hash(password || 'Password@123', 10);
    const user = await this.usersService.create({
      email,
      passwordHash,
      fullName,
      role: role || Role.FAN,
    });
    const { password: _, ...result } = user;
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user (Admin only)' })
  async update(@Param('id') id: string, @Body() body: any) {
    const { fullName, email, role, password } = body;

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (email && email !== user.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const dataToUpdate: any = {};
    if (fullName !== undefined) dataToUpdate.fullName = fullName;
    if (email !== undefined) dataToUpdate.email = email;
    if (role !== undefined) dataToUpdate.role = role;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    const { password: _, ...result } = updatedUser;
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  async delete(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
