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
  ],
})
export class AppModule {}
