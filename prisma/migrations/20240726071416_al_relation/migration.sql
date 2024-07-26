/*
  Warnings:

  - You are about to drop the column `userId` on the `AllowlistedUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AllowlistedUser" DROP CONSTRAINT "AllowlistedUser_userId_fkey";

-- DropIndex
DROP INDEX "AllowlistedUser_userId_key";

-- AlterTable
ALTER TABLE "AllowlistedUser" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "AllowlistedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
