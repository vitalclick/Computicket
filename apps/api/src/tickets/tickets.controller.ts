import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TicketsService } from './tickets.service';

class ScanDto {
  @IsString() code!: string;
  @IsString() scannerId!: string;
}

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Post('scan')
  scan(@Body() dto: ScanDto) {
    return this.tickets.scan(dto.code, dto.scannerId);
  }
}
