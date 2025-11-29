-- DropForeignKey
ALTER TABLE "public"."WatchSession" DROP CONSTRAINT "WatchSession_videoId_fkey";

-- AlterTable
ALTER TABLE "public"."WatchSession" ADD COLUMN     "movieId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."WatchSession" ADD CONSTRAINT "WatchSession_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
