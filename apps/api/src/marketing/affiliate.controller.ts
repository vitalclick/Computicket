import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { AffiliateService } from './affiliate.service';

class CreateLinkDto {
  @IsString() @Matches(/^[A-Za-z0-9-]{2,32}$/) code!: string;
  @IsString() @MinLength(1) name!: string;
}

@ApiTags('affiliate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/affiliate-links')
export class AffiliateController {
  constructor(private readonly aff: AffiliateService) {}

  @Get()
  list(@Param('organizerSlug') slug: string) {
    return this.aff.list(slug);
  }

  @Post()
  create(@Param('organizerSlug') slug: string, @Body() dto: CreateLinkDto) {
    return this.aff.create(slug, dto);
  }

  @Delete(':id')
  deactivate(@Param('organizerSlug') slug: string, @Param('id') id: string) {
    return this.aff.deactivate(slug, id);
  }
}
