import type { Metadata } from 'next';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  FAQBlock,
  PillarsBlock,
  StatsStrip,
} from '@/components/marketplace/Editorial';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Buyer Protection — Computicket Nigeria',
  description:
    "Every paid order on Computicket is protected. What's covered, when it kicks in, and how to claim.",
};

const COVERED = [
  {
    icon: 'check' as const,
    title: 'Event cancelled',
    body:
      'Organizer cancels for any reason — weather, force majeure, withdrawal of headliner — and you get a 100% refund automatically. No form, no wait.',
    color: 'oklch(0.62 0.18 152)',
  },
  {
    icon: 'refresh' as const,
    title: 'Event materially changed',
    body:
      'Date moved by more than 24 hours, venue changed to a different city, headliner withdrawn from a single-headline event — you choose refund or stay booked.',
    color: 'oklch(0.60 0.16 230)',
  },
  {
    icon: 'qr' as const,
    title: 'Ticket fails to scan',
    body:
      "If a valid Computicket QR doesn't scan and the venue refuses entry, we refund the order plus a 20% goodwill credit to your wallet for the inconvenience.",
    color: 'oklch(0.65 0.15 75)',
  },
  {
    icon: 'shield' as const,
    title: 'Organizer disappears',
    body:
      "If the organizer becomes uncontactable in the run-up to an event we host, we step in and refund from NDIC-insured escrow. We're the receipt.",
    color: 'oklch(0.55 0.18 305)',
  },
  {
    icon: 'lock' as const,
    title: 'Unauthorized charge',
    body:
      "Charge you don't recognise? Open a dispute in your account — we freeze the transaction within 30 minutes and the refund completes once we verify.",
    color: 'oklch(0.62 0.14 200)',
  },
  {
    icon: 'fire' as const,
    title: 'Force majeure',
    body:
      'Civil unrest, transport strikes that cancel travel, public health restrictions — covered. We follow Federal Government guidance and refund proactively.',
    color: 'oklch(0.65 0.20 25)',
  },
];

const NOT_COVERED = [
  'You no longer want to attend (use the resale marketplace where available)',
  'You missed the event because you arrived after closing time',
  'You bought tickets outside Computicket and were defrauded',
  'You purchased a clearly-labelled non-refundable promo product',
  'You damaged or screenshotted the QR so it could no longer rotate',
];

const STEPS = [
  { n: '01', t: 'Open the order in your account', body: 'Tap the order, then "Request refund" or "Open dispute" depending on the case.' },
  { n: '02', t: 'Tell us what happened',          body: 'A short description and any evidence — screenshots, scanner messages, communications.' },
  { n: '03', t: 'We acknowledge within 4 hours',  body: 'Most refundable claims auto-approve within minutes. Complex disputes go to a specialist.' },
  { n: '04', t: 'Resolution within 5 business days', body: 'Wallet refunds: instant on approval. Card refunds: 5–10 business days via your bank.' },
];

export default function BuyerProtectionPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="support" active="buyer-protection" />

      <ContentHero
        eyebrow="Buyer Protection"
        title="The booking is the contract. We back it."
        lede="Every paid order on Computicket is protected. If something goes wrong, we refund. No fine print, no appeals process, no 'we'll get back to you'."
      />

      <StatsStrip
        stats={[
          { n: '100%',  l: 'Refund if event cancelled' },
          { n: '< 5 d', l: 'Resolution SLA, card refunds' },
          { n: 'Instant', l: 'Wallet refunds, on approval' },
          { n: '₦500k',  l: 'Coverage on bundled travel' },
        ]}
      />

      <PillarsBlock
        eyebrow="What's covered"
        title="Six scenarios. Always refundable."
        cols={3}
        pillars={COVERED}
      />

      <section className="wrap section">
        <SectionHead
          eyebrow="What's not covered"
          title="Where buyer protection ends."
          sub="We'd rather be honest than buried in fine print."
        />
        <div className="card" style={{ padding: 32 }}>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-2)', fontSize: 16, lineHeight: 1.85 }}>
            {NOT_COVERED.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap section">
        <SectionHead eyebrow="How to claim" title="Four steps. Most resolved same-day." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="card" style={{ padding: 24 }}>
              <div className="mono accent-text fw-600" style={{ fontSize: 28 }}>
                {s.n}
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 14 }}>
                {s.t}
              </div>
              <p className="text-sm muted mt-2" style={{ lineHeight: 1.65 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ContentBlock
        eyebrow="Travel coverage"
        title="Bundled flights and hotels are covered up to ₦500,000."
        image="ph-2"
        imageCaption="Bundle coverage · Lagos ops"
        body={
          <>
            <p>
              If you bought a Computicket bundle (event + flight + hotel) and the event is
              cancelled, we refund the full bundle. Flights and hotels purchased through us are
              covered up to ₦500,000 per booking.
            </p>
            <p className="mt-4">
              For flights bought separately through Computicket but in connection with a cancelled
              event we ticketed, we negotiate refunds with the carrier directly and credit your
              wallet — no chasing involved.
            </p>
            <p className="mt-4">
              For bigger trips, the optional ₦600 travel insurance add-on at checkout covers
              personal interruption (illness, missed connections) up to ₦2,000,000.
            </p>
          </>
        }
      />

      <FAQBlock
        eyebrow="FAQ"
        title="Common protection questions."
        items={[
          {
            q: 'How quickly does a refund actually land?',
            a: (
              <>
                Wallet refunds: instant on approval. Card refunds: Paystack initiates within
                minutes; the bank takes 5–10 business days. Bank-transfer refunds: 1–3 business
                days. The clock starts the moment we approve — we don&apos;t sit on claims.
              </>
            ),
          },
          {
            q: 'Do service fees come back too?',
            a: (
              <>
                Yes, in full on a complete refund. We never keep fees on a successful refund. The
                only exception is partial refunds on multi-item orders, where fees are pro-rated.
              </>
            ),
          },
          {
            q: 'What about resale tickets?',
            a: (
              <>
                Tickets bought through the Computicket resale marketplace are protected. Tickets
                bought through third-party resale (DM, WhatsApp, Twitter) are not — those
                aren&apos;t Computicket orders, even if the underlying ticket is a Computicket
                ticket.
              </>
            ),
          },
          {
            q: "What if I'm scammed by someone pretending to be Computicket?",
            a: (
              <>
                We never DM you asking for payment or verification codes. If someone does, screenshot
                and send to{' '}
                <a className="accent-text" href="mailto:trust@computicket.ng">
                  trust@computicket.ng
                </a>{' '}
                — we work with the EFCC cybercrime unit on impersonation cases.
              </>
            ),
          },
        ]}
      />

      <ContentCTA
        eyebrow="Need to claim?"
        title="Open the order. Tap request refund. We take it from there."
        sub="Most claims approve themselves. Complex cases go to a human inside 4 hours."
        primary={{ label: 'Open my account', href: '/account' }}
        secondary={{ label: 'Read refunds policy', href: '/refunds' }}
      />
    </div>
  );
}
