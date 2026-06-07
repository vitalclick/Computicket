import { Body, Controller, Delete, Get, Header, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import type { Request, Response } from 'express';
import * as QRCode from 'qrcode';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TicketTransfersService } from './ticket-transfers.service';
import { TicketsService } from './tickets.service';

class ScanDto {
  @IsString() code!: string;
}

class CreateTransferDto {
  @IsOptional() @IsEmail() recipientEmail?: string;
}

class ClaimTransferDto {
  @IsString() token!: string;
}

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly tickets: TicketsService,
    private readonly transfers: TicketTransfersService,
  ) {}

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.tickets.findByCode(code);
  }

  @Get(':code/qr.png')
  @Header('content-type', 'image/png')
  @Header('cache-control', 'private, max-age=3600')
  async qr(@Param('code') code: string, @Res() res: Response) {
    await this.tickets.findByCode(code);
    const png = await QRCode.toBuffer(code, { errorCorrectionLevel: 'M', width: 320, margin: 1 });
    res.send(png);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('scan')
  scan(@Body() dto: ScanDto, @Req() req: Request) {
    return this.tickets.scan(dto.code, req.user!.id);
  }

  // -------- Transfers --------

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':code/transfer')
  createTransfer(
    @Param('code') code: string,
    @Body() dto: CreateTransferDto,
    @Req() req: Request,
  ) {
    return this.transfers.create(req.user!.id, code, dto.recipientEmail);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':code/transfer')
  cancelTransfer(@Param('code') code: string, @Req() req: Request) {
    return this.transfers.cancel(req.user!.id, code);
  }

  // Describe a transfer by token — public so the recipient can see what
  // they're claiming before signing in.
  @Get('transfer/:token')
  describeTransfer(@Param('token') token: string) {
    return this.transfers.describe(token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('transfer/claim')
  claimTransfer(@Body() dto: ClaimTransferDto, @Req() req: Request) {
    return this.transfers.claim(req.user!.id, dto.token);
  }
}
