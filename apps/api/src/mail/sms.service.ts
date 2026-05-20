import { Injectable, Logger } from '@nestjs/common';

const TERMII_URL = 'https://api.ng.termii.com/api/sms/send';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private get apiKey(): string | undefined {
    return process.env.TERMII_API_KEY;
  }

  private get from(): string {
    return process.env.TERMII_SENDER ?? 'Computicket';
  }

  /**
   * Send a transactional SMS. Phone must be in international E.164
   * format (e.g. +2348012345678). When TERMII_API_KEY isn't set we
   * log instead of sending so dev/CI work.
   */
  async send(to: string | null | undefined, message: string): Promise<void> {
    if (!to) return;
    if (!this.apiKey) {
      this.logger.log(`[dev sms] to=${to} msg="${message.slice(0, 80)}…"`);
      return;
    }
    try {
      const res = await fetch(TERMII_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          to,
          from: this.from,
          sms: message,
          type: 'plain',
          channel: 'generic',
        }),
      });
      if (!res.ok) {
        this.logger.error(`Termii send failed (${res.status}): ${await res.text()}`);
      }
    } catch (e) {
      this.logger.error(`Termii send threw: ${(e as Error).message}`);
    }
  }
}
