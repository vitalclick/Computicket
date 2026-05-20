import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  overview(@Param('organizerSlug') slug: string) {
    return this.dashboard.organizerOverview(slug);
  }

  @Get('events/:eventSlug/orders')
  listEventOrders(
    @Param('organizerSlug') organizerSlug: string,
    @Param('eventSlug') eventSlug: string,
  ) {
    return this.dashboard.listEventOrders(organizerSlug, eventSlug);
  }
}
