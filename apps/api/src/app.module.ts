import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from './payments/payments.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { OrganizersModule } from './organizers/organizers.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RefundsModule } from './refunds/refunds.module';
import { PayoutsModule } from './payouts/payouts.module';
import { DevelopersModule } from './developers/developers.module';
import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { TeamModule } from './team/team.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { BusesModule } from './buses/buses.module';
import { WalletModule } from './wallet/wallet.module';
import { SeatingModule } from './seating/seating.module';
import { AddOnsModule } from './add-ons/add-ons.module';
import { MarketingModule } from './marketing/marketing.module';
import { LodgingModule } from './lodging/lodging.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { ResaleModule } from './resale/resale.module';
import { AgentsModule } from './agents/agents.module';
import { CorporateModule } from './corporate/corporate.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    PaymentsModule,
    MailModule,
    AuthModule,
    HealthModule,
    OrganizersModule,
    EventsModule,
    OrdersModule,
    TicketsModule,
    WebhooksModule,
    DashboardModule,
    RefundsModule,
    PayoutsModule,
    DevelopersModule,
    AccountModule,
    AdminModule,
    TeamModule,
    PromoCodesModule,
    BusesModule,
    WalletModule,
    SeatingModule,
    AddOnsModule,
    MarketingModule,
    LodgingModule,
    LoyaltyModule,
    VouchersModule,
    ResaleModule,
    AgentsModule,
    CorporateModule,
  ],
})
export class AppModule {}
