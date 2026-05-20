import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { VouchersService } from './vouchers.service';

class IssueBatchDto {
  @IsString() @MinLength(1) name!: string;
  @IsInt() @Min(10000) denominationKobo!: number;
  @IsInt() @Min(1) count!: number;
  @IsOptional() @IsDateString() expiresAt?: string;
}

class RedeemDto {
  @IsString() code!: string;
}

@ApiTags('vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/voucher-batches')
export class VouchersController {
  constructor(private readonly vouchers: VouchersService) {}

  @Get()
  list(@Param('organizerSlug') slug: string) {
    return this.vouchers.listBatches(slug);
  }

  @Post()
  issue(@Param('organizerSlug') slug: string, @Body() dto: IssueBatchDto) {
    return this.vouchers.issueBatch(slug, dto);
  }

  @Get(':batchId/codes')
  codes(@Param('organizerSlug') slug: string, @Param('batchId') batchId: string) {
    return this.vouchers.listCodes(slug, batchId);
  }
}

@ApiTags('vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/vouchers')
export class VoucherRedemptionController {
  constructor(private readonly vouchers: VouchersService) {}

  @Post('redeem')
  redeem(@Body() dto: RedeemDto, @Req() req: Request) {
    return this.vouchers.redeem(req.user!.id, dto.code);
  }
}
