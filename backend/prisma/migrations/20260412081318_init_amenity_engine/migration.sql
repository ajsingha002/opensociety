/*
  Warnings:

  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `Amenity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flatNumber` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'PENDING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AmenityType" AS ENUM ('GAME', 'CRECHE', 'GUEST_ROOM');

-- AlterTable
ALTER TABLE "Amenity" ADD COLUMN     "type" "AmenityType" NOT NULL;

-- AlterTable
ALTER TABLE "AmenityUser" ADD COLUMN     "blockedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "flatNumber" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED';

-- CreateTable
CREATE TABLE "AmenityConfig" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "openWindowDays" INTEGER NOT NULL DEFAULT 1,
    "openWindowTime" TEXT NOT NULL DEFAULT '19:00',
    "operationalStart" TEXT NOT NULL DEFAULT '10:00',
    "operationalEnd" TEXT NOT NULL DEFAULT '22:00',
    "penaltyDays" INTEGER NOT NULL DEFAULT 2,
    "weekendPenaltyDays" INTEGER NOT NULL DEFAULT 14,

    CONSTRAINT "AmenityConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmenityBlockage" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "specificDate" TIMESTAMP(3),
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "AmenityBlockage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AmenityConfig_amenityId_key" ON "AmenityConfig"("amenityId");

-- AddForeignKey
ALTER TABLE "AmenityConfig" ADD CONSTRAINT "AmenityConfig_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenityBlockage" ADD CONSTRAINT "AmenityBlockage_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
