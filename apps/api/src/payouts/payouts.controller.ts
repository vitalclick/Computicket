import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { PayoutsService } from './payouts.service';

class SetBankDetailsDto {
  @IsString() bankCode!: string;
  @IsString() @Matches(/^\d{10}$/, { message: 'accountNumber must be 10 digits' })
  accountNumber!: string;
}

@ApiTags('payouts')
@Controller()
export class PayoutsController {
  constructor(private readonly payouts: PayoutsService) {}

  @Get('payouts/banks')
  listBanks() {
    return this.payouts.listBanks();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizerMemberGuard)
  @Get('dashboard/organizers/:organizerSlug/payouts')
  get(@Param('organizerSlug') slug: string) {
    return this.payouts.get(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizerMemberGuard)
  @Post('dashboard/organizers/:organizerSlug/payouts')
  set(@Param('organizerSlug') slug: string, @Body() dto: SetBankDetailsDto) {
    return this.payouts.setBankDetails(slug, dto);
  }
}
