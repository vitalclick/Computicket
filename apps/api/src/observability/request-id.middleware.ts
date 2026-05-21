import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

declare module 'express' {
  interface Request {
    id?: string;
  }
}

/**
 * Stamps every request with a unique ID, echoes it back in the response
 * header for client-side correlation, and exposes it via `req.id` for
 * downstream logging and error reports. Honours an incoming
 * `x-request-id` so upstream load balancers / API gateways can supply
 * their own.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.header('x-request-id');
    const id = incoming && /^[A-Za-z0-9._-]{8,128}$/.test(incoming)
      ? incoming
      : randomBytes(12).toString('base64url');
    req.id = id;
    res.setHeader('x-request-id', id);
    next();
  }
}
