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
  title: 'Analytics — Computicket for Organizers',
  description:
    'Real-time revenue, channel attribution, refund rates, cohort retention. CSV export, BigQuery push, scheduled reports.',
};

export default function AnalyticsPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="organizer" active="analytics" />

      <ContentHero
        eyebrow="Organizer · Analytics"
        title="The numbers behind every ticket — live, attributed, exportable."
        lede="Real-time revenue, channel attribution, refund cohorts, repeat-buyer share. Not a static report you wait for at month-end — a live data plane you can pipe straight into BigQuery, Looker, or your accountant's spreadsheet."
      />

      <StatsStrip
        stats={[
          { n: 'Every sale',  l: 'Updates the dashboard, live' },
          { n: '< 1 second',  l: 'CSV export, full history' },
          { n: 'BigQuery',     l: 'Native push pipeline' },
          { n: 'Weekly',       l: 'Scheduled email reports' },
        ]}
      />

      <PillarsBlock
        eyebrow="What you can measure"
        title="Six metrics, properly attributed."
        cols={3}
        pillars={[
          {
            icon: 'chart',
            title: 'Revenue, live',
            body:
              'Gross, net of commission, net of refunds, by event, by tier, by city. Drill in to any number to see the underlying orders. Currency-correct VAT lines for your accountant.',
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'send',
            title: 'Channel attribution',
            body:
              'Real attribution across Compass app (iOS + Android), web, direct artist links, paid Instagram, USSD, partner widgets and affiliate codes. Not last-click — model-based.',
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'pulse',
            title: 'Conversion funnel',
            body:
              'Site visit → event view → cart → payment → ticket issued. See where buyers drop and why. Mobile vs web split. Bot-filtered.',
            color: 'oklch(0.65 0.15 75)',
          },
          {
            icon: 'refresh',
            title: 'Refund cohorts',
            body:
              'Refund rate by tier, time-to-refund, refund reason taxonomy. Spot tiers that consistently refund (often a pricing issue) before the next event.',
            color: 'oklch(0.55 0.18 305)',
          },
          {
            icon: 'heart',
            title: 'Repeat-buyer share',
            body:
              'What percent of tonight\'s buyers also bought last time? Compass\'s loyalty signal — a 40%+ repeat-buyer share is the leading indicator of a sustainable fanbase.',
            color: 'oklch(0.62 0.14 200)',
          },
          {
            icon: 'map',
            title: 'Geo + demo distribution',
            body:
              'Buyer cities, suburb-level for Lagos and Abuja, age cohorts, gender skew (opt-in). Drives smarter ad targeting and venue selection for the next show.',
            color: 'oklch(0.65 0.20 25)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="Channel attribution, done right"
        title="Not last-click. A model that survives Instagram retargeting."
        image="ph-2"
        imageCaption="Channel attribution split · Asake Tour"
        body={
          <>
            <p>
              We attribute revenue across a Markov-chain model that handles cross-channel
              journeys properly. A buyer who first heard about the show on the Compass app,
              clicked an Instagram ad two days later, and finally bought from your direct artist
              link gets attributed proportionally across all three touches — not 100% to the last
              click.
            </p>
            <p className="mt-4">
              For organizers running paid social, this is the difference between knowing whether
              your campaigns actually drive incremental ticket sales — or just intercept buyers
              who would have come anyway. Most of our promoters discover they were
              over-attributing to paid by 30–50%.
            </p>
            <p className="mt-4">
              Affiliate codes, partner widget embeds and USSD short codes all attribute
              first-class — no <em>direct/none</em> bucket eating half your revenue.
            </p>
          </>
        }
      />

      <ContentBlock
        eyebrow="Export & integrate"
        title="Pipe into BigQuery, Snowflake, Looker. Or just an email."
        imagePosition="left"
        image="ph-5"
        imageCaption="Scheduled report · Friday 6pm digest"
        body={
          <>
            <p>
              Every metric in the dashboard is also a CSV export — including all the underlying
              order rows. One click, full history. For organizers running BI in-house, a
              push pipeline lands the same data in BigQuery, Snowflake or your S3 every 5
              minutes.
            </p>
            <p className="mt-4">
              For organizers who don&apos;t want a BI stack: scheduled email reports. Friday 6pm
              digest with sales summary, top events, refund flags, the three numbers we&apos;d
              call out. Configurable per recipient — share with your accountant, your tour
              manager and your artist all separately.
            </p>
            <p className="mt-4">
              All integrations available on Standard. BigQuery push and SSO-protected report links
              ship with the Volume plan.
            </p>
          </>
        }
      />

      <ContentCTA
        eyebrow="See your numbers"
        title="Bring your last event. We'll show you what's hiding in the data."
        sub="Free analytics review for any organizer with at least one past Computicket event. Our team will dig into the channel attribution and refund cohorts and tell you what to do next."
        primary={{ label: 'Book a free analytics review', href: 'mailto:success@computicket.ng?subject=Analytics%20review' }}
        secondary={{ label: 'See the Promoter Hub', href: '/for-organizers/promoter-hub' }}
      />
    </div>
  );
}
