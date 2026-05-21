import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { Request } from 'express';
import { EmailVerifiedGuard } from '../auth/email-verified.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';

class TopUpDto {
  @IsInt() @Min(10000) amountKobo!: number;
  @IsOptional() @IsString() callbackUrl?: string;
}

class SubmitKycDto {
  @IsString() bvn!: string;
  @IsString() idNumber!: string;
  @IsOptional() @IsString() idDocumentUrl?: string;
}

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/wallet')
export class WalletController {
  constructor(
    private readonly wallet: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async overview(@Req() req: Request) {
    const userId = req.user!.id;
    const [{ balanceKobo }, transactions] = await Promise.all([
      this.wallet.getBalance(userId),
      this.wallet.listTransactions(userId),
    ]);
    return { balanceKobo, transactions };
  }

  @Post('kyc')
  submitKyc(@Body() dto: SubmitKycDto, @Req() req: Request) {
    return this.wallet.submitKyc(req.user!.id, dto);
  }

  @UseGuards(EmailVerifiedGuard)
  @Post('top-ups')
  async topUp(@Body() dto: TopUpDto, @Req() req: Request) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      select: { email: true },
    });
    return this.wallet.initiateTopUp(req.user!.id, {
      amountKobo: dto.amountKobo,
      callbackUrl: dto.callbackUrl,
      email: user.email,
    });
  }
}
