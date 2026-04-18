import { PrismaClient, ResidenceStatus, Wing } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Starting Standalone Seed (Postgres Adapter) ---');

  // 1. Cleanup existing data (order matters for foreign keys)
  console.log('Cleaning database...');
  await prisma.booking.deleteMany();
  await prisma.amenityBlockage.deleteMany();
  await prisma.amenityQuota.deleteMany();
  await prisma.amenityConfig.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.amenityUser.deleteMany();

  // 2. Seed Amenities with Config and Quotas
  console.log('Seeding amenities...');
  const amenitiesData = [
    {
      name: 'Badminton Court',
      description: 'Indoor wooden flooring court',
      config: {
        slotDuration: 30,
        openWindowDays: 1,
        openWindowTime: '19:00',
        penaltyHours: 4,
        penaltyDays: 1,
        weekendPenaltyDays: 2,
      },
      quotas: [
        { period: 'DAY', limit: 1 },
        { period: 'WEEK', limit: 4 },
      ]
    },
    {
      name: 'Gymnasium',
      description: 'Fully equipped strength and cardio zone',
      config: {
        slotDuration: 90,
        openWindowDays: 7,
        openWindowTime: '00:00',
        penaltyHours: 1,
        penaltyDays: 1,
        weekendPenaltyDays: 1,
      },
      quotas: [{ period: 'DAY', limit: 1 }]
    },
    {
      name: 'Swimming Pool',
      description: 'Standard size pool with lifeguard on duty',
      config: {
        slotDuration: 60,
        openWindowDays: 1,
        openWindowTime: '18:00',
        penaltyHours: 2,
        penaltyDays: 1,
        weekendPenaltyDays: 2,
      },
      blockages: [
        { 
          reason: 'Daily Cleaning', 
          startTime: '13:00', 
          endTime: '15:00', 
          dayOfWeek: null 
        }
      ]
    }
  ];

  for (const item of amenitiesData) {
    await prisma.amenity.create({
      data: {
        name: item.name,
        description: item.description,
        config: { create: item.config },
        quotas: { create: item.quotas || [] },
        blockages: { create: item.blockages || [] }
      }
    });
  }

  // 3. Create initial Admin/Test User
  // Note: flatNumber is passed as a Number, wing as an Enum
  console.log('Creating test user...');
  await prisma.amenityUser.create({
    data: {
      id: 'test-user-id-123',
      username: 'argha_maker',
      firstName: 'Arghajyoti',
      lastName: 'Singha',
      dob: new Date('1995-01-01'),
      residenceStatus: ResidenceStatus.RESIDING_OWNER,
      wing: Wing.A,
      flatNumber: 402, 
      email: 'argha.dev@example.com',
      phoneNumber: '9876543210',
      password: 'hashed_password_example', // In real use, use bcrypt.hashSync
    }
  });

  console.log('--- Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Crucial: Close both Prisma and the pg Pool to prevent terminal hang
    await prisma.$disconnect();
    await pool.end();
    console.log('Database connections closed.');
  });