/*
  Warnings:

  - You are about to drop the column `plays` on the `Map` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Map" DROP COLUMN "plays";

-- CreateTable
CREATE TABLE "PlayedGame" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wavesSurvived" INTEGER NOT NULL,

    CONSTRAINT "PlayedGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayedGameParticipant" (
    "id" TEXT NOT NULL,
    "playedGameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "waveSurvived" INTEGER NOT NULL,
    "damageDealt" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayedGameParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayedGameParticipant" ADD CONSTRAINT "PlayedGameParticipant_playedGameId_fkey" FOREIGN KEY ("playedGameId") REFERENCES "PlayedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayedGameParticipant" ADD CONSTRAINT "PlayedGameParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
