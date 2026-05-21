import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupportService } from './support.service';

class ChatTurnDto {
  @IsIn(['user', 'assistant']) role!: 'user' | 'assistant';
  @IsString() @MaxLength(4000) content!: string;
}

class SupportMessageDto {
  @IsString() @MaxLength(2000) message!: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];
}

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post()
  send(@Req() req: Request, @Body() dto: SupportMessageDto) {
    return this.support.handleMessage(req.user!.id, dto.message, dto.history ?? []);
  }
}
