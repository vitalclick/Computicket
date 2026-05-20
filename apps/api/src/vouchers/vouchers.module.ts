import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { VouchersController, VoucherRedemptionController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [AuthModule, WalletModule],
  controllers: [VouchersController, VoucherRedemptionController],
  providers: [VouchersService],
})
export class VouchersModule {}
