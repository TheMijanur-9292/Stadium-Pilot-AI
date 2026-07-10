import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'fan@stadiumpilot.com',
    description: 'User registration email',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'Fan@123',
    description: 'User account password (min 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'user@stadiumpilot.com',
    description: 'Unique email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'Secure@123',
    description: 'Strong account password',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    enum: Role,
    example: Role.FAN,
    description: 'Role assigned: FAN, VOLUNTEER, ORGANIZER, VENUE_STAFF, ADMIN',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
