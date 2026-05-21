import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { SessionsController } from './sessions.controller';
import { AuthService } from './auth.service';
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
  controllers: [AuthController, SessionsController],
  providers: [AuthService, JwtAuthGuard, OrganizerMemberGuard, AdminGuard, EmailVerifiedGuard],
  exports: [AuthService, JwtAuthGuard, OrganizerMemberGuard, AdminGuard, EmailVerifiedGuard, JwtModule],
})
export class AuthModule {}
