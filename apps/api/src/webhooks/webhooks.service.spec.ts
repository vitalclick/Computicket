import { createHmac } from 'crypto';
import { WebhooksService } from './webhooks.service';

describe('WebhooksService.verifyPaystackSignature', () => {
  const secret = 'sk_test_abcdef';
  let service: WebhooksService;

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = secret;
    service = new WebhooksService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it('accepts a correctly signed payload', () => {
    const body = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'r' } }));
    const sig = createHmac('sha512', secret).update(body).digest('hex');
    expect(service.verifyPaystackSignature(body, sig)).toBe(true);
  });

  it('rejects a tampered payload', () => {
    const body = Buffer.from('{"event":"charge.success"}');
    const sig = createHmac('sha512', secret).update(body).digest('hex');
    const tampered = Buffer.from('{"event":"charge.failed"}');
    expect(service.verifyPaystackSignature(tampered, sig)).toBe(false);
  });

  it('rejects when signature header is missing', () => {
    const body = Buffer.from('{}');
    expect(service.verifyPaystackSignature(body, undefined)).toBe(false);
  });

  it('rejects when secret is unset', () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    const body = Buffer.from('{}');
    expect(service.verifyPaystackSignature(body, 'whatever')).toBe(false);
  });
});
