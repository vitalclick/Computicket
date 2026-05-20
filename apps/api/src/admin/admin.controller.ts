import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

class SetCommissionDto {
  @IsInt() @Min(0) @Max(5000) bps!: number;
}

class SetKycNotesDto {
  @IsString() notes!: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.platformStats();
  }

  @Get('organizers')
  list() {
    return this.admin.listOrganizers();
  }

  @Post('organizers/:slug/approve')
  approve(@Param('slug') slug: string, @Req() req: Request) {
    return this.admin.approve(slug, req.user!.id);
  }

  @Post('organizers/:slug/suspend')
  suspend(@Param('slug') slug: string) {
    return this.admin.suspend(slug);
  }

  @Patch('organizers/:slug/commission')
  setCommission(@Param('slug') slug: string, @Body() dto: SetCommissionDto) {
    return this.admin.setCommission(slug, dto.bps);
  }

  @Patch('organizers/:slug/kyc-notes')
  setKycNotes(@Param('slug') slug: string, @Body() dto: SetKycNotesDto) {
    return this.admin.setKycNotes(slug, dto.notes);
  }
}
