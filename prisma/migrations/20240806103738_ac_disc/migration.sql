/*
  Warnings:

  - You are about to drop the column `userId` on the `DiscordConnect` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DiscordConnect_userId_key";

-- AlterTable
ALTER TABLE "DiscordConnect" DROP COLUMN "userId";
