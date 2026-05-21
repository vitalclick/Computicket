import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { CategoryHero } from '@/components/marketplace/CategoryHero';
import { PillarGrid } from '@/components/marketplace/ContentPage';
import { SectionHead } from '@/components/marketplace/SectionHead';

export const metadata: Metadata = {
  title: 'For organizers — sell tickets, take payments, scan at the door',
  description:
    "Run your entire ticketing operation on Computicket — create events, design tiers, take payments, scan at the door, settle payouts, embed via the public API.",
};

const PILLARS: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'grid',
    title: 'Centralised control',
    body:
      'Every event, tier, refund, scan and payout in one dashboard. Add your team with scoped roles — Owner, Manager, Finance, Marketing, Scanner, Read-only.',
  },
  {
    icon: 'wallet',
    title: 'Automated ticket sales',
    body:
      'Buyers pay with Paystack — cards, transfer, USSD, Apple/Google Pay. Inventory holds prevent overselling. Funds settle directly to your bank via a sub-account, minus a transparent commission.',
  },
  {
    icon: 'chart',
    title: 'Real-time analytics',
    body:
      'Sold counts, gross revenue, conversion, channel breakdown — updated every second. See per-event performance the moment money lands; refund a buyer and watch capacity free up immediately.',
  },
];

const FEATURES = [
  {
    id: 'sell-tickets',
    icon: 'qr' as const,
    title: 'Multi-tier ticketing',
    body:
      'Unlimited tiers per event, per-tier capacity, scheduled price changes, reserved seating with an interactive seat-map editor.',
  },
  {
    id: 'promoter-hub',
    icon: 'send' as const,
    title: 'Promoter Hub',
    body:
      "Sales velocity charts, tier breakdowns, AI insights — 'sell out 2 days early by dropping Diamond 8%'. Built for promoters, not accountants.",
  },
  {
    id: 'api-access',
    icon: 'settings' as const,
    title: 'Public API & webhooks',
    body:
      'Per-organizer API keys, signed outbound webhooks (order.paid, order.refunded, ticket.scanned), and an embeddable buy-button widget for your own site.',
  },
  {
    id: 'payouts',
    icon: 'wallet' as const,
    title: 'Direct payouts',
    body:
      'Connect your bank once. Each transaction routes to you minus the platform commission — no batched settlement runs, no weekly reconciliation.',
  },
  {
    id: 'analytics',
    icon: 'chart' as const,
    title: 'Real-time analytics',
    body:
      'Channel attribution (paid Instagram vs. organic vs. USSD), promo-code performance, refund rates, cohort retention. Export as CSV anytime.',
  },
  {
    id: 'onboarding',
    icon: 'check' as const,
    title: 'Onboarding & support',
    body:
      'White-glove setup for orgs over ₦5M/month. KYC takes under 24 hours. Dedicated success manager from day one.',
  },
];

const FAQ = [
  {
    q: 'How much does it cost?',
    a: 'Default commission is 7% per ticket sold (paid by the organizer), with a 1.5% buyer service fee on top. No monthly minimums, no listing fees. We negotiate volume rates for organizers consistently doing over ₦20M/month.',
  },
  {
    q: 'How fast do payouts land?',
    a: 'T+1 to T+3 to your nominated bank — Paystack handles the disbursement. We don\'t pool funds; each transaction routes to your sub-account at sale.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes — white-label subdomains are included (yourorg.computicket.ng). Custom domain support (your-org.com) ships with our Enterprise plan.',
  },
  {
    q: 'What about scanning at the gate?',
    a: 'Browser-based scanner at /scan works on any phone with a camera. iOS/Android Flutter apps in beta. Scoped to OWNER, MANAGER and SCANNER roles only.',
  },
];

export default function ForOrganizersPage() {
  return (
    <div className="page-enter">
      <CategoryHero
        eyebrow="Promoter Hub · For organizers"
        title="Run your entire ticketing operation on one platform."
        subtitle="Create events. Take payments. Scan at the door. Settle payouts. Embed via the public API. Everything you need to run a venue, a tour, or a single weekend show."
        ph="ph-3"
        primaryCta={{ label: 'Start selling tickets', href: '/dashboard/signup' }}
        secondaryCta={{ label: 'Sign in to dashboard', href: '/dashboard/signin' }}
        badges={[
          { icon: 'pulse', label: '1.2M tickets scanned this year' },
          { icon: 'shield', label: 'PCI-DSS · NDPR' },
        ]}
      />

      <section className="wrap section-sm">
        <SectionHead
          eyebrow="What you get"
          title="Three pillars. Everything else follows."
        />
        <PillarGrid items={PILLARS} />
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead
          eyebrow="Feature tour"
          title="Six things organizers use most."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map((f) => (
            <div id={f.id} key={f.id} className="card card-hover" style={{ padding: 24 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--r-2)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={f.icon} size={20} />
              </div>
              <div className="h-4 mt-3" style={{ fontSize: 16 }}>
                {f.title}
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.65, marginTop: 8 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <SectionHead eyebrow="Pricing" title="Transparent. No surprises." />
        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            <div>
              <div className="eyebrow">Standard</div>
              <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                7%
              </div>
              <div className="text-xs muted mt-1">per ticket sold</div>
              <ul
                style={{
                  margin: '20px 0 0',
                  paddingLeft: 18,
                  color: 'var(--ink-3)',
                  fontSize: 13.5,
                  lineHeight: 1.85,
                }}
              >
                <li>Unlimited events &amp; tiers</li>
                <li>Real-time analytics</li>
                <li>Direct bank payouts</li>
                <li>QR scanning at the door</li>
                <li>WhatsApp + email support</li>
              </ul>
            </div>
            <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 32 }}>
              <div className="eyebrow accent-text">Volume</div>
              <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                5%
              </div>
              <div className="text-xs muted mt-1">over ₦20M / month</div>
              <ul
                style={{
                  margin: '20px 0 0',
                  paddingLeft: 18,
                  color: 'var(--ink-3)',
                  fontSize: 13.5,
                  lineHeight: 1.85,
                }}
              >
                <li>Everything in Standard</li>
                <li>Dedicated success manager</li>
                <li>Priority support · SLA</li>
                <li>White-label subdomain</li>
                <li>API rate-limit upgrades</li>
              </ul>
            </div>
            <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 32 }}>
              <div className="eyebrow accent-text">Enterprise</div>
              <div className="h-1 tnum mt-2" style={{ fontSize: 40 }}>
                Custom
              </div>
              <div className="text-xs muted mt-1">venue networks &amp; large promoters</div>
              <ul
                style={{
                  margin: '20px 0 0',
                  paddingLeft: 18,
                  color: 'var(--ink-3)',
                  fontSize: 13.5,
                  lineHeight: 1.85,
                }}
              >
                <li>Everything in Volume</li>
                <li>Custom domain</li>
                <li>SSO &amp; SAML</li>
                <li>On-site scan deployments</li>
                <li>24/7 phone hotline</li>
              </ul>
            </div>
          </div>
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
            padding: 48,
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid oklch(0.68 0.18 152 / .3)',
          }}
        >
          <div className="eyebrow accent-text mb-2">Get started</div>
          <h2 className="h-2" style={{ margin: '6px 0 12px' }}>
            Free to sign up. Pay only when you sell.
          </h2>
          <p
            className="muted"
            style={{ maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}
          >
            Set up your organizer account, draft an event, connect your bank when you&apos;re ready
            to publish. We never charge anything until your first ticket sells.
          </p>
          <div
            className="row mt-6 gap-3"
            style={{ justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/dashboard/signup" className="btn btn-accent btn-lg">
              Create organizer account <Icon name="arrow" size={14} />
            </Link>
            <Link href="/contact" className="btn btn-ghost btn-lg">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
