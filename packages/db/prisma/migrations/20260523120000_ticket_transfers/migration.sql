-- One-time ticket transfer tokens. The plaintext token is shown only at
-- creation; the database stores sha256 hash so a DB read can't claim
-- pending transfers.
CREATE TABLE "TicketTransfer" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "claimedByUserId" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketTransfer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TicketTransfer_tokenHash_key" ON "TicketTransfer"("tokenHash");
CREATE INDEX "TicketTransfer_ticketId_claimedAt_idx" ON "TicketTransfer"("ticketId", "claimedAt");
CREATE INDEX "TicketTransfer_fromUserId_idx" ON "TicketTransfer"("fromUserId");

ALTER TABLE "TicketTransfer"
  ADD CONSTRAINT "TicketTransfer_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
