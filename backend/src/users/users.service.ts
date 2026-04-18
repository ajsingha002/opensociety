// backend/src/users/users.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService
  ) { }

  async register(dto: CreateUserDto) {
    const existingUser = await this.prisma.amenityUser.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username },
          { phoneNumber: dto.phoneNumber }
        ]
      },
    });

    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new BadRequestException('An account with this username already exists');
      }
      if (existingUser.email === dto.email) {
        throw new BadRequestException('An account with this email already exists');
      }
      if (existingUser.phoneNumber === dto.phoneNumber) {
        throw new BadRequestException('An account with this phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.amenityUser.create({
        data: {
          ...dto,
          dob: new Date(dto.dob),
          password: hashedPassword,
          flatNumber: Number(dto.flatNumber),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.cause?.constraint?.fields?.[0]?.replace(/"/g, '') || error.meta?.target?.[0];
        const fieldMessages: Record<string, string> = {
          phoneNumber: 'An account with this phone number already exists',
          email: 'An account with this email already exists',
          username: 'An account with this username already exists',
        };
        throw new BadRequestException(fieldMessages[field] ?? 'An account with these details already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.amenityUser.findFirst({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const tokenData = await this.authService.generateToken(user);

    return {
      ...tokenData,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        wing: user.wing,
        flatNumber: user.flatNumber
      }
    };
  }

  async updateProfile(userId: string, dto: Partial<CreateUserDto>) {
    const user = await this.prisma.amenityUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const updateData: any = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.dob) {
      updateData.dob = new Date(dto.dob);
    }

    if (dto.flatNumber) {
      updateData.flatNumber = Number(dto.flatNumber);
    }

    return this.prisma.amenityUser.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async findOne(id: string) {
    return this.prisma.amenityUser.findUnique({
      where: { id }
    });
  }
}