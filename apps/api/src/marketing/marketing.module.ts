import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { BroadcastsController } from './broadcasts.controller';
import { BroadcastsService } from './broadcasts.service';

@Module({
  imports: [AuthModule],
  controllers: [AffiliateController, BroadcastsController],
  providers: [AffiliateService, BroadcastsService],
  exports: [AffiliateService],
})
export class MarketingModule {}
