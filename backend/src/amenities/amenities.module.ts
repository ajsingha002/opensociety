import { Module } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import your existing PrismaModule

@Module({
  imports: [PrismaModule],
  providers: [AmenitiesService],
  controllers: [AmenitiesController, AdminController],
})
export class AmenitiesModule {}