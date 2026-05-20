import { Module } from '@nestjs/common';
import { TicketsModule } from '../tickets/tickets.module';
import { DevelopersModule } from '../developers/developers.module';
import { RefundsModule } from '../refunds/refunds.module';
import { WalletModule } from '../wallet/wallet.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [TicketsModule, DevelopersModule, RefundsModule, WalletModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
