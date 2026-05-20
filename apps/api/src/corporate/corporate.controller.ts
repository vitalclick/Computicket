import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CorporateService } from './corporate.service';

class CreateAccountDto {
  @IsString() name!: string;
  @IsEmail() billingEmail!: string;
  @IsEmail() adminEmail!: string;
  @IsOptional() @IsInt() @Min(0) creditLimitKobo?: number;
}

class AddMemberDto {
  @IsEmail() email!: string;
  @IsOptional() @IsEnum(['ADMIN', 'MEMBER']) role?: 'ADMIN' | 'MEMBER';
  @IsOptional() @IsInt() @Min(0) perOrderLimitKobo?: number;
}

@ApiTags('corporate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/corporate-accounts')
export class CorporateAdminController {
  constructor(private readonly corp: CorporateService) {}

  @Get()
  list() {
    return this.corp.list();
  }

  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.corp.create(dto);
  }
}

@ApiTags('corporate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('corporate-accounts')
export class CorporateController {
  constructor(private readonly corp: CorporateService) {}

  @Get('mine')
  mine(@Req() req: Request) {
    return this.corp.listMyAccounts(req.user!.id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @Req() req: Request) {
    return this.corp.addMember(id, req.user!.id, dto);
  }

  @Get(':id/invoice')
  invoice(@Param('id') id: string, @Req() req: Request) {
    return this.corp.getInvoice(id, req.user!.id);
  }

  @Post(':id/settle')
  settle(@Param('id') id: string, @Req() req: Request) {
    return this.corp.settle(id, req.user!.id);
  }
}
