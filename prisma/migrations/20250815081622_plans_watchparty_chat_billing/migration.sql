/*
  Warnings:

  - You are about to drop the column `movieId` on the `WatchSession` table. All the data in the column will be lost.
  - Added the required column `content` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `WatchSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoId` to the `WatchSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'PREMIUM', 'VIP');

-- DropForeignKey
ALTER TABLE "public"."WatchSession" DROP CONSTRAINT "WatchSession_movieId_fkey";

-- DropIndex
DROP INDEX "public"."WatchSession_movieId_idx";

-- AlterTable
ALTER TABLE "public"."ChatMessage" ADD COLUMN     "content" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "plan" "public"."Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "public"."WatchSession" DROP COLUMN "movieId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "platform" TEXT NOT NULL,
ADD COLUMN     "videoId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "WatchSession_videoId_idx" ON "public"."WatchSession"("videoId");

-- CreateIndex
CREATE INDEX "WatchSession_hostUserId_idx" ON "public"."WatchSession"("hostUserId");

-- AddForeignKey
ALTER TABLE "public"."WatchSession" ADD CONSTRAINT "WatchSession_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
