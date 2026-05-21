import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { DevicePlatform } from '@computicket/db';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PushService } from './push.service';

class RegisterDeviceDto {
  @IsString() @MinLength(20) token!: string;
  @IsEnum(DevicePlatform) platform!: DevicePlatform;
}

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/devices')
export class DevicesController {
  constructor(private readonly push: PushService) {}

  // Idempotent — the mobile client posts on every signin and after each
  // foreground resume (FCM rotates tokens). PushService.upsert keeps
  // the unique constraint clean.
  @Post()
  register(@Req() req: Request, @Body() dto: RegisterDeviceDto) {
    return this.push.register(req.user!.id, dto.token, dto.platform);
  }

  @Delete(':token')
  unregister(@Req() req: Request, @Param('token') token: string) {
    return this.push.unregister(req.user!.id, token);
  }
}
