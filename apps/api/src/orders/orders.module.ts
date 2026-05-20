import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { WalletModule } from '../wallet/wallet.module';
import { TicketsModule } from '../tickets/tickets.module';
import { SeatingModule } from '../seating/seating.module';
import { MarketingModule } from '../marketing/marketing.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { AgentsModule } from '../agents/agents.module';
import { CorporateModule } from '../corporate/corporate.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderExpiryService } from './order-expiry.service';

@Module({
  imports: [
    AuthModule, PromoCodesModule, WalletModule, TicketsModule, SeatingModule,
    MarketingModule, LoyaltyModule, AgentsModule, CorporateModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderExpiryService],
  exports: [OrdersService, OrderExpiryService],
})
export class OrdersModule {}
