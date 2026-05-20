import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
  ) {}

  async createHotelBooking(input: {
    hotelSlug: string;
    guestEmail: string;
    guestName?: string;
    checkIn: string;
    checkOut: string;
    guests?: number;
    callbackUrl?: string;
    userId?: string;
  }) {
    const hotel = await this.prisma.hotel.findUnique({ where: { slug: input.hotelSlug } });
    if (!hotel || !hotel.active) throw new NotFoundException('Hotel not found');
    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);
    if (!(checkOut > checkIn)) throw new BadRequestException('checkOut must be after checkIn');
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 3600_000));
    if (nights < 1) throw new BadRequestException('Minimum 1 night');

    const totalKobo = hotel.pricePerNightKobo * nights;
    const reference = `hotel_${randomBytes(8).toString('hex')}`;

    const booking = await this.prisma.hotelBooking.create({
      data: {
        hotelId: hotel.id,
        userId: input.userId,
        guestEmail: input.guestEmail,
        guestName: input.guestName,
        checkIn,
        checkOut,
        guests: input.guests ?? 1,
        totalKobo,
        paystackRef: reference,
      },
    });

    const paystack = await this.paystack.initialize({
      email: input.guestEmail,
      amountKobo: totalKobo,
      reference,
      callbackUrl: input.callbackUrl,
      metadata: { hotelBookingId: booking.id, kind: 'hotel_booking' },
    });

    return {
      booking: { ...booking, nights },
      paystack: {
        reference: paystack.reference,
        authorizationUrl: paystack.authorizationUrl,
      },
    };
  }

  async createFlightBooking(input: {
    flightId: string;
    passengerName: string;
    passengerEmail: string;
    callbackUrl?: string;
    userId?: string;
  }) {
    const flight = await this.prisma.flight.findUnique({ where: { id: input.flightId } });
    if (!flight || !flight.active) throw new NotFoundException('Flight not found');
    if (flight.sold >= flight.capacity) throw new BadRequestException('Flight is full');

    // Atomic seat claim: increment sold only if capacity permits.
    const claimed = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "Flight" SET sold = sold + 1 WHERE id = ${flight.id} AND sold < capacity
    `);
    if (claimed === 0) throw new BadRequestException('Flight is full');

    const reference = `flight_${randomBytes(8).toString('hex')}`;
    const booking = await this.prisma.flightBooking.create({
      data: {
        flightId: flight.id,
        userId: input.userId,
        passengerName: input.passengerName,
        passengerEmail: input.passengerEmail,
        priceKobo: flight.priceKobo,
        paystackRef: reference,
      },
    });

    const paystack = await this.paystack.initialize({
      email: input.passengerEmail,
      amountKobo: flight.priceKobo,
      reference,
      callbackUrl: input.callbackUrl,
      metadata: { flightBookingId: booking.id, kind: 'flight_booking' },
    });

    return { booking, paystack };
  }

  /**
   * Webhook hooks. Idempotent: PENDING -> PAID, generate PNR for flights.
   */
  async finaliseByReference(reference: string, amountKobo: number) {
    if (reference.startsWith('hotel_')) {
      const claim = await this.prisma.hotelBooking.updateMany({
        where: { paystackRef: reference, status: 'PENDING' },
        data: { status: 'PAID', paidAt: new Date() },
      });
      return { kind: 'hotel' as const, finalised: claim.count > 0 };
    }
    if (reference.startsWith('flight_')) {
      const pnr = `PNR-${randomBytes(6).toString('base64url').toUpperCase().slice(0, 8)}`;
      const claim = await this.prisma.flightBooking.updateMany({
        where: { paystackRef: reference, status: 'PENDING' },
        data: { status: 'PAID', paidAt: new Date(), pnr },
      });
      return { kind: 'flight' as const, finalised: claim.count > 0 };
    }
    return { kind: null, finalised: false };
  }

  /**
   * True if the reference belongs to a hotel/flight booking and not an
   * event order. The Paystack webhook router uses this to fork.
   */
  async referenceIsLodging(reference: string): Promise<boolean> {
    return reference.startsWith('hotel_') || reference.startsWith('flight_');
  }
}
