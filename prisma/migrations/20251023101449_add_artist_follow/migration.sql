/*
  Warnings:

  - You are about to drop the column `bio` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Artist` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropIndex
DROP INDEX "public"."Artist_name_idx";

-- AlterTable
ALTER TABLE "public"."Artist" DROP COLUMN "bio",
DROP COLUMN "externalId",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "youtubeChannel" TEXT;

-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "artistId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "subscriptionEnd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."_ArtistFollowers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistFollowers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArtistFollowers_B_index" ON "public"."_ArtistFollowers"("B");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movie" ADD CONSTRAINT "Movie_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArtistFollowers" ADD CONSTRAINT "_ArtistFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArtistFollowers" ADD CONSTRAINT "_ArtistFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
