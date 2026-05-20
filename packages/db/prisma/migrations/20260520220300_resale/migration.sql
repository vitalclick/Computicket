-- CreateEnum
CREATE TYPE "TicketListingStatus" AS ENUM ('LISTED', 'SOLD', 'CANCELLED');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "ownerUserId" TEXT;
-- Backfill ownerUserId from Order.userId where present
UPDATE "Ticket" t SET "ownerUserId" = o."userId" FROM "Order" o WHERE t."orderId" = o.id AND o."userId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Ticket_ownerUserId_idx" ON "Ticket"("ownerUserId");

-- CreateTable
CREATE TABLE "TicketListing" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "askKobo" INTEGER NOT NULL,
    "status" "TicketListingStatus" NOT NULL DEFAULT 'LISTED',
    "buyerId" TEXT,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketListing_status_createdAt_idx" ON "TicketListing"("status", "createdAt");
CREATE INDEX "TicketListing_ticketId_idx" ON "TicketListing"("ticketId");

-- AddForeignKey
ALTER TABLE "TicketListing" ADD CONSTRAINT "TicketListing_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
