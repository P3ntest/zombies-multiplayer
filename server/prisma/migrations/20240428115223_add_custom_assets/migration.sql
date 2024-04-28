-- AlterTable
ALTER TABLE "Map" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "CustomAsset" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,

    CONSTRAINT "CustomAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomAsset" ADD CONSTRAINT "CustomAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
