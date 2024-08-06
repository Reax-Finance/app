-- CreateTable
CREATE TABLE "DiscordConnect" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,
    "discordId" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "expiresIn" INTEGER NOT NULL,

    CONSTRAINT "DiscordConnect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordConnect_userId_key" ON "DiscordConnect"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordConnect_discordId_key" ON "DiscordConnect"("discordId");

-- AddForeignKey
ALTER TABLE "DiscordConnect" ADD CONSTRAINT "DiscordConnect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllowlistedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
