/*
  Warnings:

  - You are about to drop the column `whitelistedUserId` on the `AllowlistedUser` table. All the data in the column will be lost.
  - You are about to drop the `ReferralCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhitelistedUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `AllowlistedUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AllowlistedUser" DROP CONSTRAINT "AllowlistedUser_whitelistedUserId_fkey";

-- DropForeignKey
ALTER TABLE "ReferralCode" DROP CONSTRAINT "ReferralCode_referredUserId_fkey";

-- DropForeignKey
ALTER TABLE "ReferralCode" DROP CONSTRAINT "ReferralCode_whitelistedUserId_fkey";

-- DropIndex
DROP INDEX "AllowlistedUser_whitelistedUserId_key";

-- AlterTable
ALTER TABLE "AllowlistedUser" DROP COLUMN "whitelistedUserId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "ReferralCode";

-- DropTable
DROP TABLE "WhitelistedUser";

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(255) NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "username" VARCHAR(255),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessCode" (
    "id" VARCHAR(255) NOT NULL,
    "joinedUserId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_joinedUserId_key" ON "AccessCode"("joinedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AllowlistedUser_userId_key" ON "AllowlistedUser"("userId");

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_joinedUserId_fkey" FOREIGN KEY ("joinedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowlistedUser" ADD CONSTRAINT "AllowlistedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
