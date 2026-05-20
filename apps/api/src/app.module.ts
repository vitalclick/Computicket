import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from './payments/payments.module';
import { HealthModule } from './health/health.module';
import { OrganizersModule } from './organizers/organizers.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PaymentsModule,
    HealthModule,
    OrganizersModule,
    EventsModule,
    OrdersModule,
    TicketsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
