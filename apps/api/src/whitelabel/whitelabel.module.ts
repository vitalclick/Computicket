import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WhitelabelController, WhitelabelDashboardController } from './whitelabel.controller';
import { WhitelabelService } from './whitelabel.service';

@Module({
  imports: [AuthModule],
  controllers: [WhitelabelController, WhitelabelDashboardController],
  providers: [WhitelabelService],
})
export class WhitelabelModule {}
