import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import {
  ContentCTA,
  ContentHero,
  ContentSubNav,
  FAQBlock,
  StatsStrip,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Help Centre — Computicket Nigeria',
  description: '80+ articles covering tickets, payments, refunds, scanning and organizer questions. Live chat 24/7.',
};

interface Topic {
  icon: IconName;
  title: string;
  count: number;
  sub: string;
}

const TOPICS: Topic[] = [
  { icon: 'qr',     title: 'My tickets & QR codes', count: 14, sub: 'Finding, transferring, re-issuing, screen-locks' },
  { icon: 'wallet', title: 'Payments & wallet',     count: 16, sub: 'Cards, transfer, USSD, wallet top-ups, failed charges' },
  { icon: 'refresh',title: 'Refunds & cancellations',count: 11, sub: 'Refund timing, partial refunds, who owes what' },
  { icon: 'plane',  title: 'Bus, flight & hotel',    count: 12, sub: 'Booking the travel side of the marketplace' },
  { icon: 'shield', title: 'Account & security',     count: 9,  sub: 'Sign-in, 2FA, password resets, devices, sessions' },
  { icon: 'pulse',  title: 'Scanning at venues',     count: 7,  sub: 'What happens at the gate, scan failures, bypass codes' },
  { icon: 'gift',   title: 'Compass points & rewards',count: 8, sub: 'Tiers, earning, redeeming, expiry' },
  { icon: 'chart',  title: 'For organizers',         count: 19, sub: 'Dashboard, payouts, scanning, refunds, team roles' },
];

const TOP = [
  {
    q: "I paid but didn't get my ticket — what now?",
    a: (
      <>
        Open your account page and check the order status. If it&apos;s <span className="mono">PAID</span> but you
        don&apos;t see tickets, tap &ldquo;Resend QR&rdquo;. If still nothing within 5 minutes, contact support with
        your Paystack reference (starts with <span className="mono">ct_</span>). 99% of cases resolve within the
        first chat reply.
      </>
    ),
  },
  {
    q: 'Can I transfer my ticket to someone else?',
    a: (
      <>
        Yes — open the ticket in your account, tap Transfer, enter the new owner&apos;s email and phone. The QR
        rotates to a new code; the original stops scanning at the gate. The new owner gets an email + WhatsApp
        confirmation. Transfers are free; you can transfer up to 3 times per ticket.
      </>
    ),
  },
  {
    q: 'How fast do refunds land?',
    a: (
      <>
        Refunds to wallet are instant. Refunds to card take 5–10 business days depending on the issuing bank
        (Paystack handles disbursement). Bank-transfer refunds: 1–3 business days. We start the refund the moment
        we approve — your bank dictates the rest.
      </>
    ),
  },
  {
    q: 'What happens if the event is cancelled?',
    a: (
      <>
        You get a 100% refund automatically — no form to fill, no wait. The funds land back where they came from
        (or to wallet if you opted in). The <a className="accent-text" href="/buyer-protection">Buyer Protection</a>{' '}
        page has the full policy.
      </>
    ),
  },
  {
    q: 'Can I buy without an account?',
    a: (
      <>
        Yes — checkout works as a guest. But you get faster checkout, wallet credit, group bookings, order history
        and Compass points only if you sign up. Free, and we don&apos;t spam.
      </>
    ),
  },
  {
    q: "My QR code won't scan at the venue — help?",
    a: (
      <>
        Have the scanner re-scan; often the angle. If still nothing, show staff the order page in your account —
        they can validate manually using your reference. <strong>Don&apos;t screenshot the QR;</strong> the in-app
        code rotates every 30 seconds and screenshots stop being valid almost immediately. WhatsApp the trust line
        for a 60-second bypass code if all else fails.
      </>
    ),
  },
];

export default function HelpPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="support" active="help" />

      <ContentHero
        eyebrow="Help Centre"
        title="Most questions answered here. The rest answered in chat."
        lede="80+ articles, eight topic areas, 24/7 in-app chat. Tier-1 agents pick up most questions in under 4 minutes — and we resolve 92% in the first reply."
      />

      <StatsStrip
        stats={[
          { n: '80+',  l: 'Help articles, updated weekly' },
          { n: '< 4 min', l: 'Avg first response on chat' },
          { n: '92%',     l: 'Resolved on first reply' },
          { n: '24/7',    l: 'Live chat, every day' },
        ]}
      />

      <section className="wrap section">
        <div
          className="card"
          style={{
            padding: '14px 22px',
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0,1fr) auto',
            gap: 16,
            alignItems: 'center',
            border: '1px solid var(--line-strong)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Icon name="search" size={20} />
          <input
            type="search"
            aria-label="Search help centre articles"
            placeholder="Search the help centre — e.g. refund, QR, transfer"
            className="input"
            style={{ border: 0, background: 'transparent', padding: '14px 0', fontSize: 18 }}
          />
          <button type="button" className="btn btn-accent">
            Search
          </button>
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="Browse" title="Topics." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {TOPICS.map((t) => (
            <a
              key={t.title}
              href={`/help#${t.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="card card-hover"
              style={{ padding: 24, display: 'block' }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--r-2)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={t.icon} size={18} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 15 }}>
                {t.title}
              </div>
              <div className="text-xs muted mt-1">{t.count} articles</div>
              <div className="text-xs accent-text mt-2">{t.sub}</div>
            </a>
          ))}
        </div>
      </section>

      <FAQBlock eyebrow="Top questions" title="What buyers ask most." items={TOP} />

      <ContentCTA
        eyebrow="Still stuck?"
        title="In-app chat is always faster than email."
        sub="Tier-1 agents pick up most questions in under 4 minutes. For order issues, have your reference handy (it starts with ct_)."
        primary={{ label: 'Chat with support', href: '/support' }}
        secondary={{ label: 'Email us', href: '/contact' }}
      />
    </div>
  );
}
