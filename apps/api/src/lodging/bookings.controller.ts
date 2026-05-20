import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AuthService } from '../auth/auth.service';
import { BookingsService } from './bookings.service';

class CreateHotelBookingDto {
  @IsString() hotelSlug!: string;
  @IsEmail() guestEmail!: string;
  @IsOptional() @IsString() guestName?: string;
  @IsDateString() checkIn!: string;
  @IsDateString() checkOut!: string;
  @IsOptional() @IsInt() @Min(1) guests?: number;
  @IsOptional() @IsString() callbackUrl?: string;
}

class CreateFlightBookingDto {
  @IsString() flightId!: string;
  @IsString() passengerName!: string;
  @IsEmail() passengerEmail!: string;
  @IsOptional() @IsString() callbackUrl?: string;
}

@ApiTags('lodging-bookings')
@Controller()
export class BookingsController {
  constructor(
    private readonly bookings: BookingsService,
    private readonly auth: AuthService,
  ) {}

  private async resolveUser(authHeader?: string): Promise<string | undefined> {
    if (!authHeader?.startsWith('Bearer ')) return undefined;
    try {
      const u = await this.auth.verifyToken(authHeader.slice(7).trim());
      return u.id;
    } catch {
      return undefined;
    }
  }

  @Post('hotel-bookings')
  async hotel(@Body() dto: CreateHotelBookingDto, @Headers('authorization') authHeader?: string) {
    const userId = await this.resolveUser(authHeader);
    return this.bookings.createHotelBooking({ ...dto, userId });
  }

  @Post('flight-bookings')
  async flight(@Body() dto: CreateFlightBookingDto, @Headers('authorization') authHeader?: string) {
    const userId = await this.resolveUser(authHeader);
    return this.bookings.createFlightBooking({ ...dto, userId });
  }
}
