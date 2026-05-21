import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { StreamingService } from './streaming.service';

class SetStreamDto {
  @IsOptional() @IsString() streamUrl?: string;
  @IsOptional() @IsBoolean() isLive?: boolean;
}

@ApiTags('streaming')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/events/:slug/stream')
export class StreamingDashboardController {
  constructor(private readonly streaming: StreamingService) {}

  @Post()
  set(
    @Param('organizerSlug') organizerSlug: string,
    @Param('slug') slug: string,
    @Body() dto: SetStreamDto,
  ) {
    return this.streaming.setStream(organizerSlug, slug, dto);
  }
}

@ApiTags('streaming')
@Controller('tickets')
export class StreamingController {
  constructor(private readonly streaming: StreamingService) {}

  @Get(':code/playback')
  playback(@Param('code') code: string) {
    return this.streaming.playback(code);
  }
}
