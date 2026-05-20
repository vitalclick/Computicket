import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { AddOnsService } from './add-ons.service';

class CreateAddOnDto {
  @IsString() eventSlug!: string;
  @IsString() @MinLength(1) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsInt() @Min(0) priceKobo!: number;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
}

@ApiTags('add-ons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/add-ons')
export class AddOnsController {
  constructor(private readonly addOns: AddOnsService) {}

  @Get()
  list(@Param('organizerSlug') slug: string) {
    return this.addOns.listForOrganizer(slug);
  }

  @Post()
  create(@Param('organizerSlug') slug: string, @Body() dto: CreateAddOnDto) {
    return this.addOns.create(slug, dto);
  }

  @Delete(':id')
  deactivate(@Param('organizerSlug') slug: string, @Param('id') id: string) {
    return this.addOns.deactivate(slug, id);
  }
}

@ApiTags('add-ons')
@Controller('events/:eventSlug/add-ons')
export class PublicAddOnsController {
  constructor(private readonly addOns: AddOnsService) {}

  @Get()
  list(@Param('eventSlug') eventSlug: string) {
    return this.addOns.listForEvent(eventSlug);
  }
}
