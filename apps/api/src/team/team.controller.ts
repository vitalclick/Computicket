import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import type { Request } from 'express';
import { OrganizerRole } from '@computicket/db';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { TeamService } from './team.service';

class InviteDto {
  @IsEmail() email!: string;
  @IsEnum(OrganizerRole) role!: OrganizerRole;
}

class UpdateRoleDto {
  @IsEnum(OrganizerRole) role!: OrganizerRole;
}

@ApiTags('team')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/members')
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  list(@Param('organizerSlug') slug: string) {
    return this.team.list(slug);
  }

  @Post()
  invite(
    @Param('organizerSlug') slug: string,
    @Body() dto: InviteDto,
    @Req() req: Request,
  ) {
    return this.team.invite(slug, req.user!.id, dto);
  }

  @Patch(':memberId')
  updateRole(
    @Param('organizerSlug') slug: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
  ) {
    return this.team.updateRole(slug, req.user!.id, memberId, dto.role);
  }

  @Delete(':memberId')
  remove(
    @Param('organizerSlug') slug: string,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    return this.team.remove(slug, req.user!.id, memberId);
  }
}
