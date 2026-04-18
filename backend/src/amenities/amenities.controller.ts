import { Controller, Post, Body, Param, Query, Req, UseGuards, Delete, Get } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('amenities')
export class AmenitiesController {
  constructor(private amenitiesService: AmenitiesService) { }

  @Get()
  async findAll() {
    return this.amenitiesService.findAll();
  }

  // 1. MOVE THIS UP (Static route)
  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  async getMyBookings(@Req() req: any) {
    return this.amenitiesService.findUserBookings(req.user.sub);
  }

  // 2. MOVE THIS DOWN (Dynamic route)
  // This will now only catch requests that aren't 'my-bookings'
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.amenitiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/booked-slots')
  async getBookedSlots(@Param('id') id: string, @Query('date') date: string) {
    return this.amenitiesService.getBookedSlots(id, date);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/book')
  async book(@Param('id') id: string, @Body('startTime') startTime: string, @Req() req: any) {
    return this.amenitiesService.createBooking(req.user.sub, id, new Date(startTime));
  }

  @UseGuards(JwtAuthGuard) // Added guard for safety
  @Delete('booking/:id')
  async cancel(@Param('id') id: string) {
    return this.amenitiesService.cancelBooking(id);
  }
}