import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { WhitelabelService } from './whitelabel.service';

class SetDomainDto {
  @IsString() customDomain!: string;
  @IsOptional() @IsString() brandColor?: string;
}

@ApiTags('whitelabel')
@Controller('whitelabel')
export class WhitelabelController {
  constructor(private readonly wl: WhitelabelService) {}

  @Get('by-slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.wl.forSlug(slug);
  }

  @Get('resolve')
  resolve(@Query('host') host: string) {
    return this.wl.resolveByHost(host);
  }
}

@ApiTags('whitelabel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/custom-domain')
export class WhitelabelDashboardController {
  constructor(private readonly wl: WhitelabelService) {}

  @Post()
  set(@Param('organizerSlug') slug: string, @Body() dto: SetDomainDto) {
    return this.wl.setCustomDomain(slug, dto);
  }
}
