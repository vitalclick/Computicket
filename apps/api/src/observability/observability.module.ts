import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ErrorTrackingService } from './error-tracking.service';
import { HttpExceptionFilter } from './http-exception.filter';
import { RequestIdMiddleware } from './request-id.middleware';

@Global()
@Module({
  providers: [
    ErrorTrackingService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
  exports: [ErrorTrackingService],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
