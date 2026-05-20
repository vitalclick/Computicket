import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeysController, PublicApiController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { WebhookEndpointsController } from './webhook-endpoints.controller';
import { WebhookEndpointsService } from './webhook-endpoints.service';
import { WebhookDispatcher } from './webhook-dispatcher.service';
import { WebhookRetryService } from './webhook-retry.service';
import { WebhookDeliveriesController } from './webhook-deliveries.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    ApiKeysController,
    WebhookEndpointsController,
    PublicApiController,
    WebhookDeliveriesController,
  ],
  providers: [
    ApiKeysService,
    ApiKeyGuard,
    WebhookEndpointsService,
    WebhookDispatcher,
    WebhookRetryService,
  ],
  exports: [WebhookDispatcher],
})
export class DevelopersModule {}
