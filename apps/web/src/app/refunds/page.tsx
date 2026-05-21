import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Refunds policy — Computicket Nigeria',
  description:
    'How and when refunds happen on Computicket. Timing per payment method, partial refunds, organizer-initiated refunds.',
};

const TIMING = [
  { method: 'Computicket Wallet', when: 'Instant',                  note: 'Refunds to wallet land within seconds. No bank intermediation.' },
  { method: 'Card (Verve, Visa, Mastercard)', when: '5–10 business days', note: 'Paystack disburses; your issuing bank credits. Varies by bank.' },
  { method: 'Bank transfer',       when: '1–3 business days',        note: 'Same-day for tier-1 NG banks; up to 3 days for others.' },
  { method: 'USSD',                when: '1–3 business days',        note: 'Refund routes back to the originating bank account.' },
  { method: 'Apple Pay / Google Pay', when: '5–10 business days',    note: 'Refund returns to the underlying card.' },
];

const SCENARIOS = [
  {
    t: 'Event cancelled',
    s: 'Automatic, full refund. No action needed — we initiate the refund the moment the organizer or our trust team marks the event cancelled.',
  },
  {
    t: 'Self-service refund request',
    s: 'For organizer-permitted refundable events. Open the order in your account, tap "Request refund" — most are auto-approved within minutes.',
  },
  {
    t: 'Disputed charge',
    s: "If you don't recognise a charge, open a dispute. We freeze the transaction within 30 minutes; full investigation completes inside 5 business days.",
  },
  {
    t: 'Partial refund',
    s: "If you bought 4 tickets and want to refund 2, that's supported. Refund amount is pro-rated; remaining tickets stay valid.",
  },
  {
    t: 'Organizer-initiated',
    s: 'Organizer issues refund from their dashboard — you get email + SMS the moment it lands.',
  },
  {
    t: 'Refunds-to-wallet',
    s: "Opt-in. Pick 'refund to wallet' instead of card and get the money back instantly, ready to spend on the next ticket.",
  },
];

const FAQ = [
  {
    q: 'My order says PAID — when does the refund start?',
    a: 'The clock starts the moment we approve the refund. For wallet refunds, that\'s instant. For card refunds, Paystack initiates within minutes and the bank fulfilment time is on top.',
  },
  {
    q: 'Does the service fee come back too?',
    a: 'Yes, in full. We never keep fees on a successful refund — the only exception is partial refunds on multi-item orders, where fees are pro-rated.',
  },
  {
    q: 'Can I cancel after the event has started?',
    a: 'No — once the event clock starts, the order is fulfilled. Use Buyer Protection if there\'s a fault on our side or the organizer\'s side.',
  },
  {
    q: 'What about promo-code orders?',
    a: 'Refund value reflects the price you actually paid (after the discount). Promo-code uses are returned to the code so you (or the next buyer) can re-use them.',
  },
];

export default function RefundsPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Refunds policy"
        title="How and when money comes back."
        subtitle="Refund timing depends on how you paid. Wallet refunds are instant. Card refunds depend on your bank. Here&apos;s the full table — and the scenarios we cover."
        ph="ph-7"
        primaryCta={{ label: 'Open my orders', href: '/account' }}
        secondaryCta={{ label: 'Buyer protection', href: '/buyer-protection' }}
        badges={[
          { icon: 'refresh', label: '< 5 day SLA' },
          { icon: 'wallet', label: 'Instant to wallet' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead eyebrow="Timing" title="When the money lands, by payment method." />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 24px',
              display: 'grid',
              gridTemplateColumns: '240px 180px minmax(0,1fr)',
              gap: 24,
              alignItems: 'center',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--line)',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '.16em',
              color: 'var(--ink-3)',
            }}
          >
            <span>Method</span>
            <span>Refund time</span>
            <span>Notes</span>
          </div>
          {TIMING.map((t, i) => (
            <div
              key={t.method}
              style={{
                padding: '18px 24px',
                display: 'grid',
                gridTemplateColumns: '240px 180px minmax(0,1fr)',
                gap: 24,
                alignItems: 'center',
                borderBottom: i < TIMING.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              <span className="fw-600">{t.method}</span>
              <span className="accent-text mono fw-600">{t.when}</span>
              <span className="muted" style={{ fontSize: 13.5 }}>
                {t.note}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Scenarios"
          title="Six refund flows."
          sub="Each one is covered. Which applies depends on who triggered it and why."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {SCENARIOS.map((s) => (
            <div key={s.t} className="card" style={{ padding: 22 }}>
              <div className="h-4" style={{ fontSize: 15 }}>
                {s.t}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--ink-3)',
                  lineHeight: 1.65,
                  marginTop: 10,
                }}
              >
                {s.s}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="FAQ" title="Four common questions." />
        <div className="col gap-3">
          {FAQ.map((f) => (
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
                }}
              >
                {f.q}
                <Icon name="chevronDown" size={14} />
              </summary>
              <p style={{ marginTop: 12, color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.7 }}>
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
            <div className="eyebrow accent-text mb-2">Need a refund now?</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              Open the order in your account and pick &ldquo;Request refund&rdquo;. Most are auto-approved in minutes.
              For disputes or anything not self-service, support is in-app 24/7.
            </p>
          </div>
          <a href="/account" className="btn btn-accent btn-lg">
            Open my account <Icon name="arrow" size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
