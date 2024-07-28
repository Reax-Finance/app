/*
  Warnings:

  - A unique constraint covering the columns `[allowlistedUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowlistedUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_allowlistedUserId_key" ON "User"("allowlistedUserId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_allowlistedUserId_fkey" FOREIGN KEY ("allowlistedUserId") REFERENCES "AllowlistedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
