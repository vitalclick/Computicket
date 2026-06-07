import type { Metadata } from 'next';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  PillarsBlock,
  StatsStrip,
} from '@/components/marketplace/Editorial';

export const metadata: Metadata = {
  title: 'For Organizers — Computicket Nigeria',
  description:
    "Run your entire ticketing operation on Computicket. Sell tickets, take payments, scan at the door, settle payouts, embed via the public API.",
};

export default function ForOrganizersOverviewPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="organizer" active="overview" />

      <ContentHero
        eyebrow="Promoter Hub · For organizers"
        title="Run your entire ticketing operation on one platform."
        lede="Create events. Take payments. Scan at the door. Settle payouts. Embed via the public API. Everything you need to run a venue, a tour, or a single weekend show — built for Nigerian promoters, by Nigerian promoters."
      />

      <StatsStrip
        stats={[
          { n: '1.2M+',  l: 'Tickets scanned this year' },
          { n: '2,400+', l: 'Active organizers' },
          { n: 'T+1',     l: 'Bank payouts on every sale' },
          { n: '99.97%',  l: 'Booking success rate' },
        ]}
      />

      <PillarsBlock
        eyebrow="What you get"
        title="Six features. One platform."
        sub="Each tile is a deep, dedicated page — click in for the full story, pricing details and screenshots."
        cols={3}
        pillars={[
          {
            icon: 'qr',
            title: 'Sell Tickets',
            body:
              'Multi-tier ticketing, reserved seating, promo codes, group bookings, embeddable buy-button. Sell anywhere.',
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'sparkle',
            title: 'Promoter Hub',
            body:
              'Sales velocity charts, AI selling insights, tier breakdowns, channel attribution — the cockpit promoters actually use.',
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'settings',
            title: 'API Access',
            body:
              'Per-organizer API keys, signed webhooks (order.paid, order.refunded, ticket.scanned). Embed Computicket anywhere.',
            color: 'oklch(0.65 0.15 75)',
          },
          {
            icon: 'wallet',
            title: 'Payouts',
            body:
              'Direct bank settlement, T+1 to T+3. NDIC-insured escrow. Sub-account-per-organizer architecture.',
            color: 'oklch(0.55 0.18 305)',
          },
          {
            icon: 'chart',
            title: 'Analytics',
            body:
              'Real-time revenue, channel attribution, refund rates, cohort retention. CSV export, BigQuery push, scheduled reports.',
            color: 'oklch(0.62 0.14 200)',
          },
          {
            icon: 'check',
            title: 'Onboarding',
            body:
              'KYC in 24 hours. White-glove setup for orgs over ₦5M/month. Dedicated success manager from day one.',
            color: 'oklch(0.65 0.20 25)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="Pricing · transparent"
        title="7% standard, 5% over ₦20M/month, custom at enterprise."
        image="ph-2"
        imageCaption="Promoter Hub · Lagos office"
        body={
          <>
            <p>
              <strong>Standard.</strong> 7% per ticket sold, paid by the organizer. 1.5% buyer
              service fee on top, capped per event. No monthly minimums, no listing fees, no
              hidden processing surcharges.
            </p>
            <p className="mt-4">
              <strong>Volume.</strong> 5% commission once you cross ₦20M GMV in a calendar month.
              Includes dedicated success manager, priority support SLA, white-label subdomain and
              API rate-limit upgrades.
            </p>
            <p className="mt-4">
              <strong>Enterprise.</strong> Custom commercial terms for venue networks, ticketing
              groups and large promoters. SSO/SAML, custom domain, on-site scan deployments, 24/7
              phone hotline.
            </p>
          </>
        }
      />

      <ContentCTA
        eyebrow="Get started"
        title="Free to sign up. Pay only when you sell."
        sub="Set up your organizer account, draft an event, connect your bank when you're ready to publish. We never charge anything until your first ticket sells."
        primary={{ label: 'Create organizer account', href: '/dashboard/signup' }}
        secondary={{ label: 'Talk to sales', href: '/contact' }}
      />
    </div>
  );
}
