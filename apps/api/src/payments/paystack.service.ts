import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

interface InitializeParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyResult {
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  reference: string;
  amountKobo: number;
  paidAt?: string;
}

const PAYSTACK_BASE = 'https://api.paystack.co';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);

  private get secretKey(): string | undefined {
    return process.env.PAYSTACK_SECRET_KEY;
  }

  isLive(): boolean {
    const k = this.secretKey;
    return !!k && k !== 'sk_test_replace_me';
  }

  async initialize(params: InitializeParams): Promise<InitializeResult> {
    if (!this.isLive()) {
      // Dev fallback: return a placeholder URL so the buyer flow can be
      // exercised end-to-end without real Paystack credentials.
      this.logger.warn('PAYSTACK_SECRET_KEY missing — returning placeholder authorization URL');
      return {
        authorizationUrl: `https://checkout.paystack.com/sandbox/${params.reference}`,
        accessCode: `dev_${params.reference}`,
        reference: params.reference,
      };
    }

    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.secretKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amountKobo,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Paystack initialize failed (${res.status}): ${text}`);
      throw new ServiceUnavailableException('Payment provider unavailable');
    }

    const body = (await res.json()) as {
      status: boolean;
      data: { authorization_url: string; access_code: string; reference: string };
    };

    return {
      authorizationUrl: body.data.authorization_url,
      accessCode: body.data.access_code,
      reference: body.data.reference,
    };
  }

  async verify(reference: string): Promise<VerifyResult> {
    if (!this.isLive()) {
      return { status: 'pending', reference, amountKobo: 0 };
    }

    const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { authorization: `Bearer ${this.secretKey}` },
    });
    if (!res.ok) throw new ServiceUnavailableException('Verification failed');

    const body = (await res.json()) as {
      data: { status: string; reference: string; amount: number; paid_at?: string };
    };
    return {
      status: body.data.status as VerifyResult['status'],
      reference: body.data.reference,
      amountKobo: body.data.amount,
      paidAt: body.data.paid_at,
    };
  }
}
