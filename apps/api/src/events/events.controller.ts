import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { EventType } from '@computicket/db';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { EventsService } from './events.service';

class TicketTypeDto {
  @IsString() @MinLength(1) name!: string;
  @IsInt() @Min(0) priceKobo!: number;
  @IsInt() @Min(1) capacity!: number;
}

class UpdateEventDto {
  @IsOptional() @IsString() @MinLength(2) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() venue?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
}

class CreateEventDto {
  @IsString() organizerSlug!: string;
  @IsString() @Matches(/^[a-z0-9-]+$/) slug!: string;
  @IsString() @MinLength(2) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() venue!: string;
  @IsString() city!: string;
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => TicketTypeDto)
  ticketTypes!: TicketTypeDto[];
  @IsOptional() @IsEnum(EventType) type?: EventType;
  @IsOptional() @IsString() busRouteId?: string;
}

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizerMemberGuard)
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.events.create(dto);
  }

  @Get()
  list(
    @Query('city') city?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.events.listPublished({
      city,
      cursor,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : undefined,
    });
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('city') city?: string,
    @Query('limit') limit?: string,
  ) {
    return this.events.search({
      q,
      city,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : undefined,
    });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.events.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizerMemberGuard)
  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpdateEventDto) {
    return this.events.update(slug, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizerMemberGuard)
  @Post(':slug/publish')
  publish(@Param('slug') slug: string) {
    return this.events.publish(slug);
  }
}
