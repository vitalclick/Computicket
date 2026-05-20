import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResaleService } from './resale.service';

class CreateListingDto {
  @IsString() ticketCode!: string;
  @IsInt() @Min(10000) askKobo!: number;
}

@ApiTags('resale')
@Controller('resale')
export class ResaleController {
  constructor(private readonly resale: ResaleService) {}

  // Public marketplace
  @Get()
  marketplace() {
    return this.resale.listMarketplace();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@Req() req: Request) {
    return this.resale.listMine(req.user!.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateListingDto, @Req() req: Request) {
    return this.resale.createListing(req.user!.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(@Param('id') id: string, @Req() req: Request) {
    return this.resale.cancelListing(req.user!.id, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/buy')
  buy(@Param('id') id: string, @Req() req: Request) {
    return this.resale.buyListing(req.user!.id, id);
  }
}
