import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { BroadcastsService } from './broadcasts.service';

class SendBroadcastDto {
  @IsString() @MinLength(2) subject!: string;
  @IsString() @MinLength(10) body!: string;
}

@ApiTags('broadcasts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/events/:eventSlug/broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcasts: BroadcastsService) {}

  @Get()
  list(
    @Param('organizerSlug') slug: string,
    @Param('eventSlug') eventSlug: string,
  ) {
    return this.broadcasts.list(slug, eventSlug);
  }

  @Post()
  send(
    @Param('organizerSlug') slug: string,
    @Param('eventSlug') eventSlug: string,
    @Body() dto: SendBroadcastDto,
    @Req() req: Request,
  ) {
    return this.broadcasts.send(slug, eventSlug, req.user!.id, dto);
  }
}
