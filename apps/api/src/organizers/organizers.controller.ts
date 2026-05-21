import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import type { Request } from 'express';
import { EmailVerifiedGuard } from '../auth/email-verified.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizersService } from './organizers.service';

class CreateOrganizerDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @Matches(/^[a-z0-9-]+$/) slug!: string;
  @IsOptional() @IsString() description?: string;
}

@ApiTags('organizers')
@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizers: OrganizersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post()
  create(@Body() dto: CreateOrganizerDto, @Req() req: Request) {
    return this.organizers.create({ ...dto, ownerUserId: req.user!.id });
  }

  @Get()
  list() {
    return this.organizers.list();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.organizers.findBySlug(slug);
  }
}
