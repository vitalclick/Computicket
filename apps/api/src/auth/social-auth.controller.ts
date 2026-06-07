import { Body, Controller, Ip, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import type { Request } from 'express';
import { MagicLinkService } from './magic-link.service';
import { SocialAuthService } from './social-auth.service';

class GoogleSigninDto {
  @IsString() @MinLength(10) idToken!: string;
}

class AppleSigninDto {
  @IsString() @MinLength(10) idToken!: string;
  @IsOptional() @IsString() name?: string;
}

class MagicLinkRequestDto {
  @IsEmail() email!: string;
}

class MagicLinkConfirmDto {
  @IsString() @MinLength(8) token!: string;
}

@ApiTags('auth')
@Controller('auth')
export class SocialAuthController {
  constructor(
    private readonly social: SocialAuthService,
    private readonly magic: MagicLinkService,
  ) {}

  // Tight ceiling: every request hits Google's JWK endpoint and our
  // user table. 10/min is room for a typo retry, no more.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('google')
  google(@Body() dto: GoogleSigninDto, @Req() req: Request, @Ip() ip: string) {
    return this.social.signinWithGoogle(dto.idToken, {
      ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('apple')
  apple(@Body() dto: AppleSigninDto, @Req() req: Request, @Ip() ip: string) {
    return this.social.signinWithApple(
      dto.idToken,
      { name: dto.name ?? null },
      { ip, userAgent: req.get('user-agent') ?? undefined },
    );
  }

  // Magic-link request: 3/min per IP keeps the mailer from being abused
  // to spam an inbox. Email enumeration is mitigated separately by the
  // service always returning the same shape.
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('magic-link/request')
  request(
    @Body() dto: MagicLinkRequestDto,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.magic.request(dto.email, {
      ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }

  // Confirm is single-use so the throttling is generous — it's the
  // POST the frontend fires when the user lands on the link.
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('magic-link/confirm')
  confirm(
    @Body() dto: MagicLinkConfirmDto,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.magic.confirm(dto.token, {
      ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }
}
