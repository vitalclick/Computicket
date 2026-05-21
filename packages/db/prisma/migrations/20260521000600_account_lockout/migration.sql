-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "failedSigninCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3);
