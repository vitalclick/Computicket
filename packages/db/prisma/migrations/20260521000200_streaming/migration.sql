-- AlterTable
ALTER TABLE "Event"
  ADD COLUMN "streamUrl" TEXT,
  ADD COLUMN "isLive" BOOLEAN NOT NULL DEFAULT false;
