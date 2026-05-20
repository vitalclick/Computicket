-- CreateEnum
CREATE TYPE "LodgingBookingStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "HotelBooking" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "userId" TEXT,
    "guestEmail" TEXT NOT NULL,
    "guestName" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "totalKobo" INTEGER NOT NULL,
    "status" "LodgingBookingStatus" NOT NULL DEFAULT 'PENDING',
    "paystackRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FlightBooking" (
    "id" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "userId" TEXT,
    "passengerName" TEXT NOT NULL,
    "passengerEmail" TEXT NOT NULL,
    "pnr" TEXT,
    "priceKobo" INTEGER NOT NULL,
    "status" "LodgingBookingStatus" NOT NULL DEFAULT 'PENDING',
    "paystackRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HotelBooking_paystackRef_key" ON "HotelBooking"("paystackRef");
CREATE INDEX "HotelBooking_hotelId_checkIn_idx" ON "HotelBooking"("hotelId", "checkIn");
CREATE UNIQUE INDEX "FlightBooking_pnr_key" ON "FlightBooking"("pnr");
CREATE UNIQUE INDEX "FlightBooking_paystackRef_key" ON "FlightBooking"("paystackRef");
CREATE INDEX "FlightBooking_flightId_idx" ON "FlightBooking"("flightId");

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
