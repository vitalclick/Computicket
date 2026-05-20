import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { EventsService } from './events.service';

class TicketTypeDto {
  @IsString() @MinLength(1) name!: string;
  @IsInt() @Min(0) priceKobo!: number;
  @IsInt() @Min(1) capacity!: number;
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
}

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

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

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.events.findBySlug(slug);
  }

  @Post(':slug/publish')
  publish(@Param('slug') slug: string) {
    return this.events.publish(slug);
  }
}
