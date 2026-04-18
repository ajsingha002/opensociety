/*
  Warnings:

  - You are about to drop the column `type` on the `Amenity` table. All the data in the column will be lost.
  - You are about to drop the column `operationalEnd` on the `AmenityConfig` table. All the data in the column will be lost.
  - You are about to drop the column `operationalStart` on the `AmenityConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Amenity" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "AmenityConfig" DROP COLUMN "operationalEnd",
DROP COLUMN "operationalStart",
ADD COLUMN     "penaltyHours" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "AmenityType";

-- CreateTable
CREATE TABLE "AmenityQuota" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "period" TEXT NOT NULL DEFAULT 'DAY',

    CONSTRAINT "AmenityQuota_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AmenityQuota" ADD CONSTRAINT "AmenityQuota_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
