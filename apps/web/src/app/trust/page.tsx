import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { PillarGrid } from '@/components/marketplace/ContentPage';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'Trust & Safety — Computicket Nigeria',
  description:
    'How Computicket protects buyers and organizers — PCI-DSS, NDPR, anti-fraud, refund guarantees.',
};

const PILLARS = [
  {
    icon: 'shield' as const,
    title: 'Buyer protection',
    body:
      "Every paid order is backed. If the event is cancelled, your money comes back. If the organizer disappears, we step in. No appeals process — we're the receipt.",
  },
  {
    icon: 'qr' as const,
    title: 'Anti-fraud ticketing',
    body:
      "QR codes rotate every 5 minutes. Screenshot validation. Device fingerprinting. Tickets can't be cloned, scalped through bots, or 'shared' to multiple phones.",
  },
  {
    icon: 'lock' as const,
    title: 'PCI-DSS certified',
    body:
      'Card data never touches our infrastructure. Paystack and Flutterwave handle the rails; we hold encrypted tokens only. AES-256 at rest, TLS 1.3 in transit.',
  },
  {
    icon: 'eye' as const,
    title: 'NDPR-compliant',
    body:
      "We're registered with the Nigeria Data Protection Commission. Your data stays in NG-hosted infrastructure. Full export and deletion on request.",
  },
  {
    icon: 'check' as const,
    title: 'Verified organizers',
    body:
      "Every organizer is KYC'd before publishing. CAC registration, ID verification, payout bank confirmation. Suspicious orgs get suspended fast.",
  },
  {
    icon: 'pulse' as const,
    title: 'On-call 24/7',
    body:
      'Real humans on the trust hotline 24 hours a day. Venue incidents, suspected fraud, lost-and-found, account compromise — phone, email or WhatsApp.',
  },
];

const REPORTING = [
  { t: 'Suspect fraud',           who: 'A fake event, a fake organizer, a phishing ticket', cta: 'trust@computicket.ng', href: 'mailto:trust@computicket.ng' },
  { t: 'Lost or stolen account',  who: 'Account taken over, password reset spam',           cta: 'trust@computicket.ng', href: 'mailto:trust@computicket.ng' },
  { t: 'Venue incident',           who: 'Safety, refusal of entry, dispute at the door',     cta: 'On-call hotline · 0700 268 425 38', href: 'tel:+2347002684253' },
  { t: 'Vulnerability report',     who: 'Security researchers — bug bounty active',          cta: 'security@computicket.ng', href: 'mailto:security@computicket.ng' },
];

const SCANS_PER_MONTH = 1_280_000;
const FRAUD_RATE = 0.0008;

export default function TrustPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Trust & Safety"
        title="Booking on Computicket should feel like banking."
        subtitle="Verified organizers, anti-fraud tickets, PCI-DSS, NDPR — and a real person on the trust hotline 24 hours a day."
        ph="ph-4"
        primaryCta={{ label: 'Report a concern', href: '#reporting' }}
        secondaryCta={{ label: 'Buyer protection', href: '/buyer-protection' }}
        badges={[
          { icon: 'shield', label: 'PCI-DSS certified' },
          { icon: 'check', label: 'NDPR compliant' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead eyebrow="Pillars" title="Six things we never compromise." />
        <PillarGrid items={PILLARS} />
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="row" style={{ gap: 48, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="eyebrow">Scans this month</div>
              <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                {SCANS_PER_MONTH.toLocaleString()}
              </div>
              <div className="text-xs muted mt-1">across 280 venues</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="eyebrow">Fraud rate</div>
              <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                {(FRAUD_RATE * 100).toFixed(2)}%
              </div>
              <div className="text-xs muted mt-1">vs. 1.2% industry baseline</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="eyebrow">Refund SLA</div>
              <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                &lt; 5 days
              </div>
              <div className="text-xs muted mt-1">90th percentile for card refunds</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="eyebrow">Disputes resolved</div>
              <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                99.4%
              </div>
              <div className="text-xs muted mt-1">in buyer&apos;s favour when valid</div>
            </div>
          </div>
        </div>
      </section>

      <section id="reporting" className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Reporting"
          title="See something? Tell us."
          sub="Pick the right channel. Trust incidents get triaged first — we don't queue them behind tier-1 support."
        />
        <div className="col gap-3">
          {REPORTING.map((r) => (
            <div
              key={r.t}
              className="card card-hover"
              style={{
                padding: 22,
                display: 'grid',
                gridTemplateColumns: '200px minmax(0,1fr) auto',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div className="h-4">{r.t}</div>
              <div className="text-sm muted">{r.who}</div>
              <a href={r.href} className="btn btn-accent btn-sm">
                {r.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="row gap-3">
            <Icon name="info" size={18} />
            <div>
              <div className="h-4">Responsible disclosure</div>
              <p
                className="muted mt-2"
                style={{ fontSize: 14, lineHeight: 1.7 }}
              >
                Security researchers — we run a private bug bounty. Critical findings paid within 14 days,
                tiered up to ₦5,000,000 for remote code execution or full account takeover.
                Mail{' '}
                <a href="mailto:security@computicket.ng" className="accent-text">
                  security@computicket.ng
                </a>{' '}
                with your PGP key.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
