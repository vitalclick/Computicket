import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post('paystack')
  @HttpCode(200)
  async paystack(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) throw new UnauthorizedException('Missing raw body');
    if (!this.webhooks.verifyPaystackSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }
    const payload = JSON.parse(rawBody.toString('utf8'));
    return this.webhooks.handlePaystackEvent(payload);
  }
}
