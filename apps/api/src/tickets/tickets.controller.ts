import { Body, Controller, Get, Header, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { Response } from 'express';
import * as QRCode from 'qrcode';
import { TicketsService } from './tickets.service';

class ScanDto {
  @IsString() code!: string;
  @IsString() scannerId!: string;
}

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.tickets.findByCode(code);
  }

  @Get(':code/qr.png')
  @Header('content-type', 'image/png')
  @Header('cache-control', 'private, max-age=3600')
  async qr(@Param('code') code: string, @Res() res: Response) {
    await this.tickets.findByCode(code); // 404 if missing
    const png = await QRCode.toBuffer(code, { errorCorrectionLevel: 'M', width: 320, margin: 1 });
    res.send(png);
  }

  @Post('scan')
  scan(@Body() dto: ScanDto) {
    return this.tickets.scan(dto.code, dto.scannerId);
  }
}
