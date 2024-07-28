/*
  Warnings:

  - You are about to drop the column `allowlistedUserId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_allowlistedUserId_fkey";

-- DropIndex
DROP INDEX "User_allowlistedUserId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "allowlistedUserId";

-- CreateTable
CREATE TABLE "TwitterAccount" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "profileImageUrl" VARCHAR(255) NOT NULL DEFAULT '',
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "accessToken" VARCHAR(255) NOT NULL DEFAULT '',
    "refreshToken" VARCHAR(255) NOT NULL DEFAULT '',
    "expiresIn" INTEGER NOT NULL,
    "joined" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allowlistedUserId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "TwitterAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAccount_username_key" ON "TwitterAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAccount_allowlistedUserId_key" ON "TwitterAccount"("allowlistedUserId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "AllowlistedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitterAccount" ADD CONSTRAINT "TwitterAccount_allowlistedUserId_fkey" FOREIGN KEY ("allowlistedUserId") REFERENCES "AllowlistedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
