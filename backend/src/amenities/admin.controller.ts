import { Controller, Post, Patch, Body, Param, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/amenities')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get()
  getAll() {
    return this.prisma.amenity.findMany({ include: { config: true, quotas: true, blockages: true } });
  }

  @Patch(':id/config')
  updateConfig(@Param('id') id: string, @Body() data: any) {
    return this.prisma.amenityConfig.upsert({
      where: { amenityId: id },
      update: data,
      create: { ...data, amenityId: id }
    });
  }

  @Post(':id/quota')
  addQuota(@Param('id') id: string, @Body() data: { limit: number, period: string }) {
    return this.prisma.amenityQuota.create({
      data: { ...data, amenityId: id }
    });
  }

  @Post(':id/blockage')
  addBlockage(@Param('id') id: string, @Body() data: any) {
    return this.prisma.amenityBlockage.create({
      data: { ...data, amenityId: id }
    });
  }
}