import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

const POSTMARK_URL = 'https://api.postmarkapp.com/email';

/**
 * Renders an `<img>` for the Computicket mark when MAIL_LOGO_URL is set,
 * otherwise an empty string so we fall back to the wordmark-only header.
 * Pinned to a 32px square so the same source PNG works without a CDN
 * resize.
 */
function logoMark(): string {
  const url = process.env.MAIL_LOGO_URL;
  if (!url) return '';
  return `<img src="${escapeHtml(url)}" alt="" width="32" height="32" style="display:inline-block;vertical-align:middle;margin-right:8px;border-radius:6px" />`;
}

interface OrderConfirmationInput {
  to: string;
  buyerName?: string | null;
  eventTitle: string;
  eventVenue: string;
  eventCity: string;
  eventStartsAt: Date;
  totalKobo: number;
  tickets: Array<{ code: string; ticketTypeName: string }>;
}

interface RefundNotificationInput {
  to: string;
  buyerName?: string | null;
  eventTitle: string;
  amountKobo: number;
}

interface BroadcastInput {
  to: string;
  subject: string;
  bodyText: string;
  eventTitle: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private get postmarkToken(): string | undefined {
    return process.env.POSTMARK_SERVER_TOKEN;
  }

  private get fromAddress(): string {
    return process.env.MAIL_FROM ?? 'tickets@computicket.ng';
  }

  async sendOrderConfirmation(input: OrderConfirmationInput): Promise<void> {
    const subject = `Your tickets — ${input.eventTitle}`;
    const html = await this.renderConfirmationHtml(input);
    const text = this.renderConfirmationText(input);

    if (!this.postmarkToken) {
      this.logger.log(
        `[dev mail] to=${input.to} subject="${subject}" tickets=${input.tickets.length}`,
      );
      return;
    }

    const res = await fetch(POSTMARK_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-postmark-server-token': this.postmarkToken,
      },
      body: JSON.stringify({
        From: this.fromAddress,
        To: input.to,
        Subject: subject,
        HtmlBody: html,
        TextBody: text,
        MessageStream: 'outbound',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      // Don't throw — webhook should still 200 even if email fails. Surface in logs.
      this.logger.error(`Postmark send failed (${res.status}): ${body}`);
      return;
    }
    this.logger.log(`Sent confirmation to ${input.to} for ${input.tickets.length} tickets`);
  }

  async sendEmailVerification(input: { to: string; name?: string | null; link: string }): Promise<void> {
    const subject = 'Verify your Computicket email';
    const greeting = input.name ? `Hi ${escapeHtml(input.name)},` : 'Hi there,';
    const html = `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,Arial;background:#f9fafb;padding:24px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
<div style="font-weight:700;color:#008751">${logoMark()}Computicket Nigeria</div>
<h1 style="font-size:22px;margin:16px 0">Verify your email</h1>
<p>${greeting}</p>
<p>Tap the button below to confirm this email address. The link expires in 24 hours.</p>
<p style="margin:24px 0"><a href="${escapeHtml(input.link)}" style="background:#008751;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Verify email</a></p>
<p style="color:#6b7280;font-size:12px">Didn't sign up? You can ignore this email.</p>
</div></body></html>`;
    const text = `${greeting}\n\nConfirm your email: ${input.link}\n\nLink expires in 24 hours. If you didn't sign up, ignore this email.`;
    await this.deliver(input.to, subject, html, text);
  }

  /**
   * Passwordless sign-in email. Single-use link, expires in 15 minutes.
   * Footer surfaces the requesting IP + user-agent so the recipient can
   * spot a stolen link before they click.
   */
  async sendMagicLink(input: {
    to: string;
    link: string;
    requestedIp?: string;
    requestedUa?: string;
  }): Promise<void> {
    const subject = 'Sign in to Computicket';
    const meta =
      input.requestedIp || input.requestedUa
        ? `<p style="color:#6b7280;font-size:11px;margin-top:24px">Requested from ${
            escapeHtml(input.requestedIp ?? 'unknown IP')
          } · ${escapeHtml(input.requestedUa ?? 'unknown device')}. If that wasn't you, ignore this email — the link expires in 15 minutes and can only be used once.</p>`
        : '';
    const html = `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,Arial;background:#f9fafb;padding:24px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
<div style="font-weight:700;color:#008751">${logoMark()}Computicket Nigeria</div>
<h1 style="font-size:22px;margin:16px 0">Your sign-in link</h1>
<p>Tap below to sign in. The link works once and expires in 15 minutes.</p>
<p style="margin:24px 0"><a href="${escapeHtml(input.link)}" style="background:#008751;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Sign me in</a></p>
<p style="color:#6b7280;font-size:12px">Or paste this URL into your browser:<br/><span style="word-break:break-all">${escapeHtml(input.link)}</span></p>
${meta}
</div></body></html>`;
    const text = `Your Computicket sign-in link:\n${input.link}\n\nWorks once, expires in 15 minutes. Didn't ask? Ignore this email.`;
    await this.deliver(input.to, subject, html, text);
  }

  async sendPasswordReset(input: { to: string; name?: string | null; link: string }): Promise<void> {
    const subject = 'Reset your Computicket password';
    const greeting = input.name ? `Hi ${escapeHtml(input.name)},` : 'Hi there,';
    const html = `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,Arial;background:#f9fafb;padding:24px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
<div style="font-weight:700;color:#008751">${logoMark()}Computicket Nigeria</div>
<h1 style="font-size:22px;margin:16px 0">Reset your password</h1>
<p>${greeting}</p>
<p>We received a request to reset your password. Tap below — the link is single-use and expires in 1 hour.</p>
<p style="margin:24px 0"><a href="${escapeHtml(input.link)}" style="background:#008751;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Reset password</a></p>
<p style="color:#6b7280;font-size:12px">Didn't ask for this? You can ignore this email and your password stays the same.</p>
</div></body></html>`;
    const text = `${greeting}\n\nReset your password: ${input.link}\n\nLink is single-use and expires in 1 hour. If you didn't ask for this, ignore this email.`;
    await this.deliver(input.to, subject, html, text);
  }

  private async deliver(to: string, subject: string, html: string, text: string): Promise<void> {
    if (!this.postmarkToken) {
      this.logger.log(`[dev mail] to=${to} subject="${subject}"`);
      this.logger.log(`[dev mail] body: ${text}`);
      return;
    }
    const res = await fetch(POSTMARK_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-postmark-server-token': this.postmarkToken,
      },
      body: JSON.stringify({
        From: this.fromAddress,
        To: to,
        Subject: subject,
        HtmlBody: html,
        TextBody: text,
        MessageStream: 'outbound',
      }),
    });
    if (!res.ok) {
      this.logger.error(`Postmark deliver failed (${res.status}): ${await res.text()}`);
    }
  }

  async sendBroadcast(input: BroadcastInput): Promise<void> {
    const html = `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,Arial;background:#f9fafb;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
<div style="font-weight:700;color:#008751">${logoMark()}Computicket Nigeria · ${escapeHtml(input.eventTitle)}</div>
<div style="margin-top:16px;white-space:pre-wrap;font-size:15px;line-height:1.5;color:#111827">${escapeHtml(input.bodyText)}</div>
<div style="margin-top:24px;color:#9ca3af;font-size:12px">Sent because you have a ticket to ${escapeHtml(input.eventTitle)}.</div>
</div></body></html>`;
    if (!this.postmarkToken) {
      this.logger.log(`[dev mail] to=${input.to} subject="${input.subject}" (broadcast)`);
      return;
    }
    const res = await fetch(POSTMARK_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-postmark-server-token': this.postmarkToken,
      },
      body: JSON.stringify({
        From: this.fromAddress,
        To: input.to,
        Subject: input.subject,
        HtmlBody: html,
        TextBody: input.bodyText,
        MessageStream: 'broadcast',
      }),
    });
    if (!res.ok) {
      this.logger.error(`Postmark broadcast send failed (${res.status}): ${await res.text()}`);
    }
  }

  async sendRefundNotification(input: RefundNotificationInput): Promise<void> {
    const subject = `Refund processed — ${input.eventTitle}`;
    const greeting = input.buyerName ? `Hi ${input.buyerName},` : 'Hi there,';
    const html = `
<!doctype html>
<html><body style="font-family:ui-sans-serif,system-ui,Arial;background:#f9fafb;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <div style="font-weight:700;color:#008751">${logoMark()}Computicket Nigeria</div>
    <h1 style="font-size:22px;margin:16px 0">Your refund is on the way</h1>
    <p>${greeting}</p>
    <p>We've processed a refund of <strong>${formatNgn(input.amountKobo)}</strong> for your tickets to <strong>${escapeHtml(input.eventTitle)}</strong>. Your tickets have been voided.</p>
    <p style="color:#6b7280;font-size:13px">Refunds typically land in your bank account within 5–14 business days, depending on your bank.</p>
  </div>
</body></html>`;
    const text = `${greeting}\n\nWe've processed a refund of ${formatNgn(input.amountKobo)} for your tickets to ${input.eventTitle}. Your tickets have been voided.\n\nRefunds typically land in your bank account within 5–14 business days.`;

    if (!this.postmarkToken) {
      this.logger.log(`[dev mail] to=${input.to} subject="${subject}"`);
      return;
    }
    const res = await fetch(POSTMARK_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-postmark-server-token': this.postmarkToken,
      },
      body: JSON.stringify({
        From: this.fromAddress,
        To: input.to,
        Subject: subject,
        HtmlBody: html,
        TextBody: text,
        MessageStream: 'outbound',
      }),
    });
    if (!res.ok) {
      this.logger.error(`Postmark refund send failed (${res.status}): ${await res.text()}`);
    }
  }

  private async renderConfirmationHtml(input: OrderConfirmationInput): Promise<string> {
    const ticketBlocks = await Promise.all(
      input.tickets.map(async (t) => {
        const dataUri = await QRCode.toDataURL(t.code, {
          errorCorrectionLevel: 'M',
          width: 260,
          margin: 1,
        });
        return `
          <tr>
            <td style="padding:24px 0;border-bottom:1px solid #e5e7eb">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:20px">
                    <img src="${dataUri}" alt="${t.code}" width="180" height="180" style="display:block" />
                  </td>
                  <td style="vertical-align:top">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">${escapeHtml(t.ticketTypeName)}</div>
                    <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;margin-top:6px">${escapeHtml(t.code)}</div>
                    <div style="font-size:13px;color:#4b5563;margin-top:10px">Show this QR at the gate. One scan only.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
      }),
    );

    const greeting = input.buyerName ? `Hi ${escapeHtml(input.buyerName)},` : 'Hi there,';
    const startsAt = input.eventStartsAt.toLocaleString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
<!doctype html>
<html><head><meta charset="utf-8"><title>Your tickets</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb">
    <tr><td align="center" style="padding:32px 16px">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;padding:32px">
        <tr><td>
          <div style="font-weight:700;color:#008751;font-size:18px">${logoMark()}Computicket Nigeria</div>
          <h1 style="font-size:24px;margin:16px 0 4px">You're going to ${escapeHtml(input.eventTitle)}</h1>
          <div style="color:#4b5563;font-size:14px">${escapeHtml(input.eventVenue)}, ${escapeHtml(input.eventCity)} · ${escapeHtml(startsAt)}</div>
          <p style="font-size:15px;color:#111827;margin-top:24px">${greeting} Your payment of ${formatNgn(input.totalKobo)} was received. Here ${input.tickets.length === 1 ? 'is your ticket' : `are your ${input.tickets.length} tickets`}:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${ticketBlocks.join('')}</table>
          <p style="font-size:13px;color:#6b7280;margin-top:24px">Save this email or screenshot the QR codes. Each ticket is single-use.</p>
        </td></tr>
      </table>
      <div style="color:#9ca3af;font-size:12px;margin-top:16px">© Computicket Nigeria</div>
    </td></tr>
  </table>
</body></html>`;
  }

  private renderConfirmationText(input: OrderConfirmationInput): string {
    const lines = [
      `You're going to ${input.eventTitle}`,
      `${input.eventVenue}, ${input.eventCity}`,
      `${input.eventStartsAt.toISOString()}`,
      `Total: ${formatNgn(input.totalKobo)}`,
      '',
      'Tickets:',
      ...input.tickets.map((t) => `  ${t.ticketTypeName} — ${t.code}`),
      '',
      'Show the QR codes (in the HTML version of this email) at the gate.',
    ];
    return lines.join('\n');
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatNgn(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}
