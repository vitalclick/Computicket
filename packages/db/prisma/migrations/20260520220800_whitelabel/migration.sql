-- AlterTable
ALTER TABLE "Organizer"
  ADD COLUMN "customDomain" TEXT,
  ADD COLUMN "brandColor" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_customDomain_key" ON "Organizer"("customDomain");
