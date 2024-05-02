-- DropForeignKey
ALTER TABLE "PlayedGameParticipant" DROP CONSTRAINT "PlayedGameParticipant_userId_fkey";

-- AlterTable
ALTER TABLE "PlayedGameParticipant" ADD COLUMN     "username" TEXT NOT NULL DEFAULT 'Anonymous',
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PlayedGameParticipant" ADD CONSTRAINT "PlayedGameParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
