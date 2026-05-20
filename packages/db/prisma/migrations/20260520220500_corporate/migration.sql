-- CreateEnum
CREATE TYPE "CorporateRole" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "corporateAccountId" TEXT,
  ADD COLUMN "corporateSettledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CorporateAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "creditLimitKobo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorporateAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CorporateMember" (
    "id" TEXT NOT NULL,
    "corporateAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CorporateRole" NOT NULL DEFAULT 'MEMBER',
    "perOrderLimitKobo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorporateMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorporateMember_corporateAccountId_userId_key" ON "CorporateMember"("corporateAccountId", "userId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES "CorporateAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CorporateMember" ADD CONSTRAINT "CorporateMember_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES "CorporateAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CorporateMember" ADD CONSTRAINT "CorporateMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
