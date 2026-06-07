import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { SessionsController } from './sessions.controller';
import { SocialAuthController } from './social-auth.controller';
import { AuthService } from './auth.service';
import { MagicLinkService } from './magic-link.service';
import { SocialAuthService } from './social-auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OrganizerMemberGuard } from './organizer-member.guard';
import { AdminGuard } from './admin.guard';
import { EmailVerifiedGuard } from './email-verified.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? 'dev_unsafe_change_me',
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
      }),
    }),
  ],
  controllers: [AuthController, SessionsController, SocialAuthController],
  providers: [
    AuthService,
    MagicLinkService,
    SocialAuthService,
    JwtAuthGuard,
    OrganizerMemberGuard,
    AdminGuard,
    EmailVerifiedGuard,
  ],
  exports: [
    AuthService,
    MagicLinkService,
    SocialAuthService,
    JwtAuthGuard,
    OrganizerMemberGuard,
    AdminGuard,
    EmailVerifiedGuard,
    JwtModule,
  ],
})
export class AuthModule {}
