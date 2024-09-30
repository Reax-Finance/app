/*
  Warnings:

  - You are about to drop the column `isFollowing` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskIdentifier" AS ENUM ('JOIN_SERVER', 'HAS_ROLE', 'FOLLOW', 'LIKE', 'RETWEET', 'POST_TWEET', 'ON_CHAIN_QUERY', 'SUBGRAPH_QUERY', 'API_QUERY', 'XP_COMPLETION', 'FACTION_SELECTION', 'REPEATABLE_SUBGRAPH_QUERY');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isFollowing";

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "quest" TEXT NOT NULL DEFAULT '',
    "ytUrl" VARCHAR(255) NOT NULL DEFAULT '',
    "imageUrl" VARCHAR(255) NOT NULL DEFAULT '',
    "taskIdentifier" "TaskIdentifier" NOT NULL,
    "cta" VARCHAR(255) NOT NULL,
    "redirectUrl" VARCHAR(500) NOT NULL DEFAULT '',
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTask" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "UserTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_name_key" ON "Task"("name");

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
