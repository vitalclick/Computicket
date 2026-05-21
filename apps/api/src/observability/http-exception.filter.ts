import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorTrackingService } from './error-tracking.service';

/**
 * Last-resort exception handler. Known HttpExceptions pass through with
 * their declared status; unknown errors map to 500 with a generic body
 * (no internals leaked) but are forwarded to error tracking so we know
 * something blew up.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly tracker: ErrorTrackingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      // 5xx HttpExceptions are still worth tracking (rare but possible)
      if (status >= 500) {
        this.tracker.capture(exception, {
          requestId: req.id,
          path: req.url,
          method: req.method,
          userId: req.user?.id,
        });
      }
      res.status(status).json(exception.getResponse());
      return;
    }

    // Unknown error: log, track, and return a safe generic body.
    const eventId = this.tracker.capture(exception, {
      requestId: req.id,
      path: req.url,
      method: req.method,
      userId: req.user?.id,
    });
    this.logger.error(
      `Unhandled exception on ${req.method} ${req.url} (request-id ${req.id ?? 'unknown'})`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal server error',
      requestId: req.id,
      eventId,
    });
  }
}
