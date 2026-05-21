import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { HotelsService } from './hotels.service';

class CreateHotelDto {
  @IsString() @Matches(/^[a-z0-9-]+$/) slug!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() city!: string;
  @IsString() address!: string;
  @IsInt() @Min(0) pricePerNightKobo!: number;
  @IsInt() @Min(1) capacity!: number;
}

@ApiTags('hotels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/hotels')
export class HotelsController {
  constructor(private readonly hotels: HotelsService) {}

  @Get()
  list(@Param('organizerSlug') slug: string) {
    return this.hotels.listForOrganizer(slug);
  }

  @Post()
  create(@Param('organizerSlug') slug: string, @Body() dto: CreateHotelDto) {
    return this.hotels.create(slug, dto);
  }
}

@ApiTags('hotels')
@Controller('hotels')
export class PublicHotelsController {
  constructor(private readonly hotels: HotelsService) {}

  @Get()
  search(
    @Query('city') city?: string,
    @Query('destinationCode') destinationCode?: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
  ) {
    return this.hotels.search({ city, destinationCode, checkIn, checkOut });
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.hotels.findBySlug(slug);
  }
}
