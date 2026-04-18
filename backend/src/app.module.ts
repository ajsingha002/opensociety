import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js'; // Import the new module
import { UsersModule } from './users/users.module.js';
import { AmenitiesModule } from './amenities/amenities.module';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule, // Add it here
    UsersModule, AmenitiesModule,
  ],
  controllers: [],
  providers: [], // Keep this empty if there are no app-wide services
})
export class AppModule {}