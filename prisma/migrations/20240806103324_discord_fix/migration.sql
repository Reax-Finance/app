/*
  Warnings:

  - A unique constraint covering the columns `[allowlistedUserId]` on the table `DiscordConnect` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `allowlistedUserId` to the `DiscordConnect` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DiscordConnect" DROP CONSTRAINT "DiscordConnect_userId_fkey";

-- AlterTable
ALTER TABLE "DiscordConnect" ADD COLUMN     "allowlistedUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DiscordConnect_allowlistedUserId_key" ON "DiscordConnect"("allowlistedUserId");

-- AddForeignKey
ALTER TABLE "DiscordConnect" ADD CONSTRAINT "DiscordConnect_allowlistedUserId_fkey" FOREIGN KEY ("allowlistedUserId") REFERENCES "AllowlistedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
