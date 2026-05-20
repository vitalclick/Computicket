import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DevelopersModule } from '../developers/developers.module';
import { WalletModule } from '../wallet/wallet.module';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  imports: [AuthModule, DevelopersModule, WalletModule],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
