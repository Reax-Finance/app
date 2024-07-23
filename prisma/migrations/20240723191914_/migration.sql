-- CreateTable
CREATE TABLE "WhitelistedUser" (
    "id" VARCHAR(255) NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "username" VARCHAR(255),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "WhitelistedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" VARCHAR(255) NOT NULL,
    "referredUserId" TEXT,
    "whitelistedUserId" TEXT NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowlistedUser" (
    "id" TEXT NOT NULL,
    "whitelistedUserId" TEXT,

    CONSTRAINT "AllowlistedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhitelistedUser_username_key" ON "WhitelistedUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_referredUserId_key" ON "ReferralCode"("referredUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AllowlistedUser_whitelistedUserId_key" ON "AllowlistedUser"("whitelistedUserId");

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "WhitelistedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_whitelistedUserId_fkey" FOREIGN KEY ("whitelistedUserId") REFERENCES "WhitelistedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowlistedUser" ADD CONSTRAINT "AllowlistedUser_whitelistedUserId_fkey" FOREIGN KEY ("whitelistedUserId") REFERENCES "WhitelistedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
