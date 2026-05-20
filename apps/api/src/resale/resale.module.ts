import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { ResaleController } from './resale.controller';
import { ResaleService } from './resale.service';

@Module({
  imports: [AuthModule, WalletModule],
  controllers: [ResaleController],
  providers: [ResaleService],
})
export class ResaleModule {}
