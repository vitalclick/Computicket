import type { Metadata } from 'next';
import {
  ContentCTA,
  ContentHero,
  ContentSubNav,
  FAQBlock,
  PillarsBlock,
  StatsStrip,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Refunds policy — Computicket Nigeria',
  description:
    'How and when refunds happen on Computicket. Timing per payment method, partial refunds, organizer-initiated refunds.',
};

const TIMING = [
  { method: 'Computicket Wallet',              when: 'Instant',          note: 'Refunds to wallet land within seconds. No bank intermediation.' },
  { method: 'Card (Verve, Visa, Mastercard)',  when: '5–10 business days', note: 'Paystack disburses; your issuing bank credits. Varies by bank.' },
  { method: 'Bank transfer',                   when: '1–3 business days', note: 'Same-day for tier-1 NG banks; up to 3 days for others.' },
  { method: 'USSD',                            when: '1–3 business days', note: 'Refund routes back to the originating bank account.' },
  { method: 'Apple Pay / Google Pay',          when: '5–10 business days', note: 'Refund returns to the underlying card.' },
];

const SCENARIOS = [
  {
    icon: 'check' as const,
    title: 'Event cancelled',
    body:
      'Automatic, full refund. No action needed — we initiate the moment the organizer or our trust team marks the event cancelled.',
    color: 'oklch(0.62 0.18 152)',
  },
  {
    icon: 'refresh' as const,
    title: 'Self-service refund request',
    body:
      'For organizer-permitted refundable events. Open the order, tap "Request refund" — most auto-approve within minutes.',
    color: 'oklch(0.60 0.16 230)',
  },
  {
    icon: 'shield' as const,
    title: 'Disputed charge',
    body:
      "If you don't recognise a charge, open a dispute. We freeze the transaction within 30 minutes; investigation completes inside 5 business days.",
    color: 'oklch(0.65 0.15 75)',
  },
  {
    icon: 'minus' as const,
    title: 'Partial refund',
    body:
      "If you bought 4 tickets and want to refund 2, that's supported. Refund amount is pro-rated; remaining tickets stay valid.",
    color: 'oklch(0.55 0.18 305)',
  },
  {
    icon: 'send' as const,
    title: 'Organizer-initiated',
    body:
      'Organizer issues refund from their dashboard — you get email + WhatsApp the moment it lands. Wallet credits arrive instantly.',
    color: 'oklch(0.62 0.14 200)',
  },
  {
    icon: 'wallet' as const,
    title: 'Refunds-to-wallet',
    body:
      "Opt-in. Pick 'refund to wallet' instead of card and get the money back instantly, ready to spend on the next ticket.",
    color: 'oklch(0.65 0.20 25)',
  },
];

export default function RefundsPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="support" active="refunds" />

      <ContentHero
        eyebrow="Refunds policy"
        title="How and when money comes back."
        lede="Refund timing depends on how you paid. Wallet refunds are instant. Card refunds depend on your bank. Here's the full table — and the six scenarios we cover."
      />

      <StatsStrip
        stats={[
          { n: 'Instant',  l: 'Wallet refunds, on approval' },
          { n: '5–10 d',   l: 'Card refunds, via your bank' },
          { n: '1–3 d',    l: 'Bank transfer & USSD' },
          { n: '< 4 h',    l: 'Refund decision SLA' },
        ]}
      />

      <section className="wrap section">
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
                padding: '20px 24px',
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

      <PillarsBlock
        eyebrow="Scenarios"
        title="Six refund flows. All covered."
        sub="Which applies depends on who triggered it and why. Each one has the same SLA."
        cols={3}
        pillars={SCENARIOS}
      />

      <FAQBlock
        eyebrow="FAQ"
        title="Four common refund questions."
        items={[
          {
            q: 'My order says PAID — when does the refund start?',
            a: (
              <>
                The clock starts the moment we approve the refund. For wallet refunds, that&apos;s
                instant. For card refunds, Paystack initiates within minutes and the bank
                fulfilment time is on top. We don&apos;t sit on approved refunds.
              </>
            ),
          },
          {
            q: 'Does the service fee come back too?',
            a: (
              <>
                Yes, in full on a complete refund. We never keep fees on a successful refund. The
                only exception is partial refunds on multi-item orders, where the fee is
                pro-rated to the refunded amount.
              </>
            ),
          },
          {
            q: 'Can I cancel after the event has started?',
            a: (
              <>
                No — once the event clock starts, the order is fulfilled. Use{' '}
                <a className="accent-text" href="/buyer-protection">Buyer Protection</a> if
                there&apos;s a fault on our side or the organizer&apos;s side.
              </>
            ),
          },
          {
            q: 'What about promo-code orders?',
            a: (
              <>
                Refund value reflects the price you actually paid (after the discount). Promo-code
                uses are returned to the code so you (or the next buyer) can re-use them — unless
                the code was time-boxed and has since expired.
              </>
            ),
          },
        ]}
      />

      <ContentCTA
        eyebrow="Need a refund now?"
        title="Open the order. Tap request refund. We take it from there."
        sub="Most claims auto-approve in minutes. For disputes or anything not self-service, support is in-app 24/7."
        primary={{ label: 'Open my account', href: '/account' }}
        secondary={{ label: 'Talk to support', href: '/support' }}
      />
    </div>
  );
}
