import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';

/**
 * Sends unhandled errors to Sentry when SENTRY_DSN is configured. Without
 * a DSN, falls back to structured Nest logs — so dev still sees errors,
 * and production gets a real tracker without code changes.
 */
@Injectable()
export class ErrorTrackingService implements OnModuleInit {
  private readonly logger = new Logger(ErrorTrackingService.name);
  private enabled = false;

  onModuleInit() {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) {
      this.logger.log('SENTRY_DSN unset — error tracking will log to stdout only.');
      return;
    }
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      release: process.env.SENTRY_RELEASE,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0'),
    });
    this.enabled = true;
    this.logger.log('Sentry error tracking initialised');
  }

  capture(err: unknown, context?: Record<string, unknown>): string | undefined {
    if (this.enabled) {
      return Sentry.captureException(err, { extra: context });
    }
    this.logger.error(
      `[err] ${err instanceof Error ? err.stack ?? err.message : String(err)}`,
      context ? JSON.stringify(context) : undefined,
    );
    return undefined;
  }

  setUser(user: { id: string; email?: string } | null) {
    if (!this.enabled) return;
    Sentry.setUser(user ?? null);
  }
}
