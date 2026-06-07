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
  title: 'Promoter Hub — Computicket for Organizers',
  description:
    'Sales velocity, AI insights, tier breakdowns, channel attribution, live scan feed. The cockpit promoters actually use.',
};

export default function PromoterHubPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="organizer" active="promoter-hub" />

      <ContentHero
        eyebrow="Organizer · Promoter Hub"
        title="The cockpit Nigerian promoters wake up to."
        lede="Sales velocity, AI selling insights, tier breakdowns, channel attribution, live scan feed. Not a dashboard built for accountants — built for the people closing the night."
      />

      <StatsStrip
        stats={[
          { n: 'Every second', l: 'Live data refresh' },
          { n: '< 200ms',       l: 'AI insight generation' },
          { n: '8',              l: 'Sales channels tracked separately' },
          { n: '24/7',           l: 'Live scan feed during events' },
        ]}
      />

      <PillarsBlock
        eyebrow="What's on the screen"
        title="Six panels you'll keep open during sale."
        cols={3}
        pillars={[
          {
            icon: 'chart',
            title: 'Sales velocity',
            body:
              "Daily ticket sales overlaid on forecast and industry benchmark. See if you're tracking ahead or behind — and by how much.",
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'grid',
            title: 'Tier breakdown',
            body:
              'Per-tier sold count, revenue, percent-sold, and time-to-sell-out estimates. Spot the underperforming tier before it sinks the event.',
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'sparkle',
            title: 'Compass insights',
            body:
              "AI-generated moves with projected impact: 'drop Diamond 8%' or 'push Abuja audience'. Each comes with one-click apply.",
            color: 'oklch(0.65 0.15 75)',
          },
          {
            icon: 'send',
            title: 'Channel attribution',
            body:
              'Track every kobo across Compass app, web, direct artist link, paid Instagram, USSD and partner widgets. Real attribution, not last-click.',
            color: 'oklch(0.55 0.18 305)',
          },
          {
            icon: 'qr',
            title: 'Live scan feed',
            body:
              'During the event, watch entries land in real time. Gate, lane, tier, flag — every scan logged with venue staff identity.',
            color: 'oklch(0.62 0.14 200)',
          },
          {
            icon: 'pulse',
            title: 'Audience demographics',
            body:
              'Buyer city distribution, age cohorts, repeat-buyer share, referral attribution. Optional CSV export for your next campaign.',
            color: 'oklch(0.65 0.20 25)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="Compass insights"
        title="The AI suggestions that have moved actual ticket sales."
        image="ph-5"
        imageCaption="Compass insights · live during Asake sale"
        body={
          <>
            <p>
              Compass watches your event in real time and flags moves with quantified impact.
              Each insight ships with a one-click Apply button that wires the change into the
              system — no manual price-editing screen, no waiting for an engineer.
            </p>
            <p className="mt-4">
              Recent examples shipped to organizers in production:
            </p>
            <ul className="mt-4" style={{ paddingLeft: 18, lineHeight: 1.75 }}>
              <li>
                <strong>&ldquo;Drop Diamond by 8%&rdquo;</strong> — surfaced when one tier
                trailed the rest. Projected +₦4.6M revenue. Two clicks to apply.
              </li>
              <li className="mt-2">
                <strong>&ldquo;Push Abuja audience&rdquo;</strong> — flagged when 31% of Abuja
                carts were abandoned. Wired into a bundled flight + ticket promo. Closed 64% of
                them historically.
              </li>
              <li className="mt-2">
                <strong>&ldquo;Open Gate D from 7pm&rdquo;</strong> — predicted from arrival
                curves of past events. Reduces gate complaints by 47%.
              </li>
            </ul>
          </>
        }
      />

      <ContentBlock
        eyebrow="Real-time scan feed"
        title="Stand at the gate. Watch the entries land."
        imagePosition="left"
        image="ph-1"
        imageCaption="Live scan feed during Tafawa Balewa Square sell-out"
        body={
          <>
            <p>
              During the event, the Promoter Hub becomes a live operations console. Every QR
              scan lands in under 200ms — gate, lane, scanner staff member, tier, flag — fully
              attributed.
            </p>
            <p className="mt-4">
              Counters live-update: scanned-in, pending, flagged. Flagged scans (duplicate QR,
              voided ticket, off-venue attempt) come with a one-click escalation to your security
              lead and our Trust &amp; Safety on-call.
            </p>
            <p className="mt-4">
              Median time from QR presented at gate to entry confirmed: <strong>240
              ms</strong>.
            </p>
          </>
        }
      />

      <ContentCTA
        eyebrow="See the hub"
        title="Five-minute live tour. We'll show you yours."
        sub="Book a screen-share with our organizer success team and we'll run the Promoter Hub against one of your past events — so the numbers feel real."
        primary={{ label: 'Book a demo', href: 'mailto:success@computicket.ng?subject=Promoter%20Hub%20demo' }}
        secondary={{ label: 'See analytics', href: '/for-organizers/analytics' }}
      />
    </div>
  );
}
