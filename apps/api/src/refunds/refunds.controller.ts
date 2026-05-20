import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { RefundsService } from './refunds.service';

@ApiTags('refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/orders/:orderId/refund')
export class RefundsController {
  constructor(private readonly refunds: RefundsService) {}

  @Post()
  refund(@Param('orderId') orderId: string) {
    return this.refunds.refund(orderId);
  }
}
