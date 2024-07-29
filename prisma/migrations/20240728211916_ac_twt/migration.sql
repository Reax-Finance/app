-- DropForeignKey
ALTER TABLE "AccessCode" DROP CONSTRAINT "AccessCode_joinedUserId_fkey";

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_joinedUserId_fkey" FOREIGN KEY ("joinedUserId") REFERENCES "AllowlistedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
