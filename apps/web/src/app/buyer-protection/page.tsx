import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { PillarGrid } from '@/components/marketplace/ContentPage';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Buyer Protection — Computicket Nigeria',
  description:
    "Every paid order on Computicket is protected. Here's exactly what's covered, when it kicks in, and how to claim.",
};

const COVERED = [
  {
    icon: 'check' as const,
    title: 'Event cancelled',
    body:
      'Organizer cancels the event for any reason — weather, force majeure, withdrawal of headliner — you get a 100% refund automatically. No form, no wait.',
  },
  {
    icon: 'refresh' as const,
    title: 'Event materially changed',
    body:
      'Date moved by more than 24 hours, venue changed to a different city, headliner withdrawn from a single-headline event — you can opt for refund or stay booked. Your choice.',
  },
  {
    icon: 'qr' as const,
    title: 'Ticket fails to scan',
    body:
      "If a valid Computicket QR doesn't scan at the gate and the venue refuses entry, we refund the order plus a goodwill credit of 20% to your wallet for the inconvenience.",
  },
  {
    icon: 'shield' as const,
    title: 'Organizer disappears',
    body:
      "If the organizer becomes uncontactable in the run-up to an event we host, we step in and refund. We're the receipt.",
  },
  {
    icon: 'lock' as const,
    title: 'Unauthorized charge',
    body:
      "Charge you don't recognise? Open a dispute in your account — we freeze the transaction within 30 minutes and the refund completes once we verify.",
  },
  {
    icon: 'fire' as const,
    title: 'Force majeure',
    body:
      'Civil unrest, transport strikes that cancel travel, public health restrictions — covered. We follow the official guidance from the Federal Government and refund proactively.',
  },
];

const NOT_COVERED = [
  'You no longer want to attend (use the resale marketplace if available)',
  'You missed the event because you arrived after closing time',
  'You bought tickets outside Computicket and were defrauded',
  'You purchased a clearly-labelled non-refundable promo product',
  'You damaged or screenshotted the QR so it could no longer rotate',
];

const STEPS = [
  { n: '01', t: 'Open the order in your account',     s: 'Tap the order, then "Request refund" or "Open dispute" depending on the case.' },
  { n: '02', t: 'Tell us what happened',                s: 'A short description and any evidence — screenshots, scanner messages, communications.' },
  { n: '03', t: 'We acknowledge within 4 hours',         s: 'Most refundable claims get auto-approved within minutes. Complex disputes go to a specialist.' },
  { n: '04', t: 'Resolution within 5 business days',     s: 'Wallet refunds: instant on approval. Card refunds: 5–10 business days via your issuing bank.' },
];

export default function BuyerProtectionPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Buyer Protection"
        title="The booking is the contract. We back it."
        subtitle="Every paid order on Computicket is protected. If something goes wrong, we refund. No fine print, no appeals process, no 'we'll get back to you'."
        ph="ph-4"
        primaryCta={{ label: 'Open a claim', href: '/account' }}
        secondaryCta={{ label: 'Read refunds policy', href: '/refunds' }}
        badges={[
          { icon: 'shield', label: '100% refund if cancelled' },
          { icon: 'clock', label: '< 5 day SLA' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead eyebrow="What's covered" title="Six scenarios. Always refundable." />
        <PillarGrid items={COVERED} />
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="What's not covered"
          title="Where buyer protection ends."
          sub="We&apos;d rather be honest than buried in fine print."
        />
        <div className="card" style={{ padding: 28 }}>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: 'var(--ink-2)',
              fontSize: 15,
              lineHeight: 1.85,
            }}
          >
            {NOT_COVERED.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="How to claim"
          title="Four steps. Most resolved same-day."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="card" style={{ padding: 24 }}>
              <div className="mono accent-text fw-600" style={{ fontSize: 24 }}>
                {s.n}
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 14 }}>
                {s.t}
              </div>
              <p
                className="text-xs muted mt-2"
                style={{ lineHeight: 1.65 }}
              >
                {s.s}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div
          className="card"
          style={{
            padding: 32,
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid oklch(0.68 0.18 152 / .3)',
          }}
        >
          <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
            <Icon name="info" size={20} stroke={2} />
            <div>
              <div className="h-4">A note on resale</div>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, marginTop: 8 }}>
                Computicket runs a resale marketplace for popular events. If you can&apos;t attend,
                list your ticket and we&apos;ll match you with a buyer — the QR rotates to the new owner,
                price is capped at face value plus a small fee. Resale is the right route when you simply
                can&apos;t make it, not a refund case.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
