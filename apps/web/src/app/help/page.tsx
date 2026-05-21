import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Help Centre — Computicket Nigeria',
  description: 'Answers to the most asked questions about events, tickets, payments and refunds.',
};

interface Topic {
  icon: IconName;
  title: string;
  count: number;
  sub: string;
}

const TOPICS: Topic[] = [
  { icon: 'qr',     title: 'My tickets & QR codes', count: 12, sub: 'Where to find them, transferring, screen-locks' },
  { icon: 'wallet', title: 'Payments & wallet',     count: 14, sub: 'Cards, transfer, USSD, wallet top-ups' },
  { icon: 'refresh',title: 'Refunds & cancellations',count: 9,  sub: 'Refund timing, who owes what' },
  { icon: 'plane',  title: 'Bus, flight & hotel',    count: 11, sub: 'Booking the travel side of the marketplace' },
  { icon: 'shield', title: 'Account & security',     count: 8,  sub: 'Sign-in, 2FA, password resets, devices' },
  { icon: 'pulse',  title: 'Scanning at venues',     count: 6,  sub: 'What happens at the gate, scanning issues' },
  { icon: 'gift',   title: 'Compass points & rewards',count: 7, sub: 'Tiers, earning, redeeming' },
  { icon: 'chart',  title: 'For organizers',         count: 18, sub: 'Dashboard, payouts, scanning, refunds' },
];

interface FAQ {
  q: string;
  a: string;
}

const TOP: FAQ[] = [
  {
    q: "I paid but didn't get my ticket — what now?",
    a: "Open your account page and check the order status. If it's PAID but you don't see tickets, hit 'Resend QR'. If still nothing within 5 minutes, contact support with your Paystack reference (starts with `ct_`).",
  },
  {
    q: 'Can I transfer my ticket to someone else?',
    a: 'Yes — open the ticket in your account, tap Transfer, enter the new owner\'s email and phone. The QR rotates to a new code; the original stops scanning at the gate.',
  },
  {
    q: 'How fast do refunds land?',
    a: 'Refunds to wallet are instant. Refunds to card take 5–10 business days depending on the issuing bank (Paystack handles the disbursement). Bank-transfer refunds: 1–3 business days.',
  },
  {
    q: 'What happens if the event is cancelled?',
    a: "You get a 100% refund automatically — no form to fill, no wait. The Buyer Protection page has the full policy.",
  },
  {
    q: 'Can I buy without an account?',
    a: 'Yes — checkout works as a guest. But you get faster checkout, wallet credit, group bookings and order history if you sign up. Free.',
  },
  {
    q: 'My QR code won\'t scan at the venue — help?',
    a: "Have the scanner re-scan; sometimes it's the angle. If still nothing, show staff the order page in your account — they can validate manually using your reference. Travel light: don't screenshot the QR; the in-app code rotates and screenshots stop being valid.",
  },
];

export default function HelpPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Help Centre"
        title="Got a question? Most answers are here."
        subtitle="Searchable knowledge base, 80+ articles, in-app chat 24/7. The faster your question — the faster the resolution."
        ph="ph-3"
        primaryCta={{ label: 'Chat with support', href: '/support' }}
        secondaryCta={{ label: 'Email us', href: '/contact' }}
        badges={[
          { icon: 'pulse', label: '24/7 in-app chat' },
          { icon: 'check', label: 'Avg response < 4 min' },
        ]}
      />

      <section className="wrap section-sm">
        <div
          className="card"
          style={{
            padding: '12px 22px',
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0,1fr) auto',
            gap: 16,
            alignItems: 'center',
            border: '1px solid var(--line-strong)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Search the help centre — e.g. refund, QR, transfer"
            className="input"
            style={{ border: 0, background: 'transparent', padding: '14px 0', fontSize: 17 }}
          />
          <button type="button" className="btn btn-accent">
            Search
          </button>
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="Browse" title="Topics." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {TOPICS.map((t) => (
            <a
              key={t.title}
              href={`/help#${t.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="card card-hover"
              style={{ padding: 22, display: 'block' }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--r-2)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={t.icon} size={16} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 14 }}>
                {t.title}
              </div>
              <div className="text-xs muted mt-1">{t.count} articles</div>
              <div className="text-xs accent-text mt-2">{t.sub}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Top questions"
          title="What buyers ask most."
        />
        <div className="col gap-3">
          {TOP.map((f) => (
            <details
              key={f.q}
              className="card"
              style={{ padding: '20px 24px', cursor: 'pointer' }}
            >
              <summary
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {f.q}
                <Icon name="chevronDown" size={14} />
              </summary>
              <p
                style={{
                  marginTop: 12,
                  color: 'var(--ink-3)',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div
          className="card"
          style={{
            padding: 32,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: 24,
            alignItems: 'center',
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid oklch(0.68 0.18 152 / .3)',
          }}
        >
          <div>
            <div className="eyebrow accent-text mb-1">Still stuck?</div>
            <div className="h-3">In-app chat is always faster than email.</div>
            <p className="muted mt-2" style={{ fontSize: 14, lineHeight: 1.6 }}>
              Tier-1 agents pick up most questions in under 4 minutes.
              For order issues, have your reference handy (it starts with{' '}
              <code className="mono">ct_</code>).
            </p>
          </div>
          <a href="/support" className="btn btn-accent btn-lg">
            Chat with support <Icon name="arrow" size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
