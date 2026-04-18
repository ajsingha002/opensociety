import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

@Injectable()
export class AmenitiesService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.amenity.findMany({
      include: { config: true },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const amenity = await this.prisma.amenity.findUnique({
      where: { id },
      include: { config: true, quotas: true, blockages: true },
    });
    if (!amenity) throw new NotFoundException('Amenity not found');
    return amenity;
  }

  async findUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { amenity: true },
      orderBy: { startTime: 'desc' }
    });
  }

  /**
   * REQ: Get all booked slots for a day 
   * Used for UI button states (Graying out)
   */
  async getBookedSlots(amenityId: string, date: string) {
    const targetDate = new Date(date);
    return this.prisma.booking.findMany({
      where: {
        amenityId,
        status: BookingStatus.CONFIRMED,
        startTime: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate)
        }
      },
      select: { startTime: true, endTime: true }
    });
  }

  async createBooking(userId: string, amenityId: string, requestedStart: Date) {
    const now = new Date();

    // 1. GUARD RAIL: Prevent past bookings
    if (requestedStart.getTime() < (now.getTime() - 60000)) {
      throw new BadRequestException('Cannot book a slot in the past.');
    }

    const user = await this.prisma.amenityUser.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const amenity = await this.prisma.amenity.findUnique({
      where: { id: amenityId },
      include: { config: true, blockages: true, quotas: true },
    });

    if (!amenity || !amenity.config) throw new BadRequestException('Amenity or config missing');

    const { config, quotas, blockages } = amenity;
    const requestedEnd = new Date(requestedStart.getTime() + config.slotDuration * 60000);

    // 2. REQ: User shouldn't have multiple requests for the same exact slot
    const existingSelfCollision = await this.prisma.booking.findFirst({
      where: {
        userId,
        amenityId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        AND: [
          { startTime: { lt: requestedEnd } },
          { endTime: { gt: requestedStart } },
        ],
      },
    });
    if (existingSelfCollision) throw new BadRequestException('You already have an active request for this slot.');

    // 3. NEW REQ: If user has a CONFIRMED booking for the day, they cannot request more (even PENDING)
    const hasConfirmedToday = await this.prisma.booking.findFirst({
      where: {
        userId,
        amenityId,
        status: BookingStatus.CONFIRMED,
        startTime: {
          gte: startOfDay(requestedStart),
          lte: endOfDay(requestedStart)
        }
      }
    });
    if (hasConfirmedToday) {
      throw new BadRequestException('You already have a confirmed booking for this day.');
    }

    // 4. REQ: Limit to 4 total active requests (Confirmed/Pending) per day
    const dailyRequestCount = await this.prisma.booking.count({
      where: {
        userId,
        amenityId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        startTime: {
          gte: startOfDay(requestedStart),
          lte: endOfDay(requestedStart)
        }
      }
    });
    if (dailyRequestCount >= 4) {
      throw new BadRequestException('Daily limit reached (Max 4 active requests).');
    }

    // Penalty check
    if (user.blockedUntil && user.blockedUntil > now) {
      throw new ForbiddenException(`Privileges suspended until ${user.blockedUntil.toDateString()}`);
    }

    // Window validation
    const windowOpen = new Date(requestedStart);
    windowOpen.setDate(windowOpen.getDate() - config.openWindowDays);
    const [h, m] = config.openWindowTime.split(':').map(Number);
    windowOpen.setHours(h, m, 0, 0);
    if (now < windowOpen) throw new BadRequestException(`Booking window opens ${config.openWindowDays} days prior.`);

    // Maintenance blockage check
    const isBlocked = blockages.some((b) => {
      const isDayMatch = b.dayOfWeek === requestedStart.getDay();
      const isDateMatch = b.specificDate?.toDateString() === requestedStart.toDateString();
      if (isDayMatch || isDateMatch) {
        const reqTime = requestedStart.toTimeString().slice(0, 5);
        return reqTime >= b.startTime && reqTime < b.endTime;
      }
      return false;
    });
    if (isBlocked) throw new BadRequestException('Slot blocked for maintenance.');

    // Quota Enforcement (Flat-based)
    for (const quota of quotas) {
      const rangeStart = quota.period === 'WEEK' ? startOfWeek(requestedStart) : startOfDay(requestedStart);
      const rangeEnd = quota.period === 'WEEK' ? endOfWeek(requestedStart) : endOfDay(requestedStart);
      const count = await this.prisma.booking.count({
        where: {
          flatNumber: user.flatNumber,
          amenityId,
          status: BookingStatus.CONFIRMED,
          startTime: { gte: rangeStart, lte: rangeEnd },
        },
      });
      if (count >= quota.limit) throw new BadRequestException(`Quota exceeded (${quota.limit} per ${quota.period})`);
    }

    // Collision check to set status
    const confirmedCollision = await this.prisma.booking.findFirst({
      where: {
        amenityId,
        status: BookingStatus.CONFIRMED,
        AND: [
          { startTime: { lt: requestedEnd } },
          { endTime: { gt: requestedStart } },
        ],
      },
    });

    const newBooking = await this.prisma.booking.create({
      data: {
        userId,
        amenityId,
        startTime: requestedStart,
        endTime: requestedEnd,
        flatNumber: user.flatNumber,
        status: confirmedCollision ? BookingStatus.PENDING : BookingStatus.CONFIRMED,
      },
    });

    // Cleanup other PENDINGs for this day if the new one is CONFIRMED
    if (newBooking.status === BookingStatus.CONFIRMED) {
      await this.prisma.booking.deleteMany({
        where: {
          userId,
          amenityId,
          status: BookingStatus.PENDING,
          id: { not: newBooking.id },
          startTime: { gte: startOfDay(requestedStart), lte: endOfDay(requestedStart) }
        }
      });
    }

    return newBooking;
  }

  async cancelBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { amenity: { include: { config: true } } },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    const now = new Date();

    // Promote logic: Check if was waitlisted originally
    const isPromoted = booking.updatedAt.getTime() - booking.createdAt.getTime() > 2000;
    const hoursDiff = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // REQ: No penalty for promoted bookings
    if (
      !isPromoted &&
      booking.amenity.config &&
      hoursDiff < booking.amenity.config.penaltyHours &&
      booking.status === BookingStatus.CONFIRMED
    ) {
      const pDays = [0, 6].includes(booking.startTime.getDay())
        ? booking.amenity.config.weekendPenaltyDays
        : booking.amenity.config.penaltyDays;

      const blockedUntil = new Date();
      blockedUntil.setDate(blockedUntil.getDate() + pDays);

      await this.prisma.amenityUser.update({
        where: { id: booking.userId },
        data: { blockedUntil }
      });
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    // Promotion logic
    if (booking.status === BookingStatus.CONFIRMED) {
      const nextInLine = await this.prisma.booking.findFirst({
        where: {
          amenityId: booking.amenityId,
          status: BookingStatus.PENDING,
          startTime: booking.startTime,
        },
        orderBy: { createdAt: 'asc' }
      });

      if (nextInLine) {
        await this.prisma.booking.update({
          where: { id: nextInLine.id },
          data: { status: BookingStatus.CONFIRMED }
        });

        // Cleanup: remove newly confirmed user's other pending requests for the day
        await this.prisma.booking.deleteMany({
          where: {
            userId: nextInLine.userId,
            amenityId: booking.amenityId,
            status: BookingStatus.PENDING,
            id: { not: nextInLine.id },
            startTime: { gte: startOfDay(booking.startTime), lte: endOfDay(booking.startTime) }
          }
        });
      }
    }

    return updated;
  }
}