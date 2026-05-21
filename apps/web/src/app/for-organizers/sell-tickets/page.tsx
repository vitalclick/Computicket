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

export const metadata: Metadata = {
  title: 'Sell Tickets — Computicket for Organizers',
  description:
    'Multi-tier ticketing, reserved seating, promo codes, group bookings, embeddable buy-button. Everything you need to sell tickets in Nigeria.',
};

export default function SellTicketsPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="organizer" active="sell-tickets" />

      <ContentHero
        eyebrow="Organizer · Sell Tickets"
        title="The ticketing engine that out-sells the others — and never oversells."
        lede="Multi-tier pricing, reserved seating, atomic inventory holds, embeddable buy-button. Computicket's selling stack is the same one the largest Lagos promoters use to push out 22,000-seat sell-outs in 90 minutes."
      />

      <StatsStrip
        stats={[
          { n: '0',       l: 'Over-sells under load (verified)' },
          { n: '< 200ms', l: 'Median order create latency' },
          { n: '10×',      l: 'Tiers per event, unlimited' },
          { n: 'T+1',      l: 'Funds in your bank' },
        ]}
      />

      <PillarsBlock
        eyebrow="Six selling features"
        title="Built for how Nigerians actually buy tickets."
        cols={3}
        pillars={[
          {
            icon: 'grid',
            title: 'Multi-tier ticketing',
            body:
              'Unlimited tiers per event with per-tier capacity, scheduled price changes, time-boxed promos. Tiers can be hidden until a date, gated by promo code, or capped by referral.',
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'qr',
            title: 'Reserved seating',
            body:
              'Visual seat-map editor. Atomic seat holds during checkout — concurrent buyers can never grab the same seat. Per-seat pricing, group seating, accessibility-marked rows.',
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'gift',
            title: 'Promo codes & affiliates',
            body:
              'Percentage or fixed-amount discounts, max-use caps, expiry, optional event scope. Affiliate codes attribute revenue and trigger referral payouts automatically.',
            color: 'oklch(0.65 0.15 75)',
          },
          {
            icon: 'user',
            title: 'Group bookings',
            body:
              'Buyers can purchase up to 50 tickets in one order. Optional name capture per ticket. Automatic group-seating algorithm tries to keep parties together.',
            color: 'oklch(0.55 0.18 305)',
          },
          {
            icon: 'send',
            title: 'Embeddable buy-button',
            body:
              'Drop one <script> tag onto any site. Buyers checkout in an overlay without leaving your page. Webhooks fire back as normal. Works on Wix, WordPress, raw HTML.',
            color: 'oklch(0.62 0.14 200)',
          },
          {
            icon: 'shield',
            title: 'Inventory protection',
            body:
              'Race-safe atomic claims. Order expiry releases held inventory in 15 minutes. Load-tested at 200 concurrent buyers competing for 5 seats — exactly 5 successes, every run.',
            color: 'oklch(0.65 0.20 25)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="Inventory under load"
        title="The race-safe inventory engine that doesn't over-sell."
        image="ph-3"
        imageCaption="Load test · 200 concurrent buyers, 5 seats"
        body={
          <>
            <p>
              Every claim runs as a single Postgres CTE that decrements the tier&apos;s available
              count atomically. There is no read-then-write race window. If two buyers race for
              the last seat, exactly one succeeds; the other gets a clean &ldquo;sold
              out&rdquo; response in under 50 ms.
            </p>
            <p className="mt-4">
              Our 15-minute order expiry cron releases held inventory automatically from abandoned
              orders. Holds are reflected in the live capacity counter shoppers see — buyers
              never queue for stale availability.
            </p>
            <p className="mt-4">
              We publish the load test that proves this in our repo:{' '}
              <span className="mono">scripts/load-test-inventory.sh</span>. Run it yourself — 200
              concurrent buyers, 5 seats, every run produces exactly 5 successes and 195
              sold-outs.
            </p>
          </>
        }
      />

      <ContentBlock
        eyebrow="Embed anywhere"
        title="One script tag. Buyers stay on your page."
        imagePosition="left"
        image="ph-6"
        imageCaption="Buy-button widget · live demo"
        body={
          <>
            <p>
              The Computicket buy-button widget is a single 4 KB script. Drop it on your event
              landing page, your tour micro-site, your venue&apos;s WordPress, or a partner&apos;s
              Wix — the checkout overlays without leaving your page.
            </p>
            <p className="mt-4">
              Branding follows yours: header colours, accent, logo. Webhooks (order.paid,
              order.refunded, ticket.scanned) fire to your endpoints as if it were a native
              integration. We host the cart, you keep the audience.
            </p>
            <p className="mt-4">
              Try it live at <span className="mono">/widget-demo</span> — buyers never see a
              redirect.
            </p>
          </>
        }
      />

      <FAQBlock
        eyebrow="Frequently asked"
        title="Selling questions."
        items={[
          {
            q: 'Can I sell to a closed audience (corporate, season-pass)?',
            a: (
              <>
                Yes. Mark the tier as &ldquo;hidden&rdquo; and gate access by promo code, email
                domain, or one-time link. Corporate bulk orders, fan-club presales and member-only
                tickets all use the same primitive.
              </>
            ),
          },
          {
            q: 'How do refunds work for buyers?',
            a: (
              <>
                Refundable events get a one-click refund button in your dashboard. Refunds hit
                Paystack and void the tickets atomically. Replays are idempotent; sold counts roll
                back so seats can resell. Refund-to-wallet lands instantly; card refunds 5–10
                business days.
              </>
            ),
          },
          {
            q: 'What about VAT and service fees?',
            a: (
              <>
                VAT (7.5%) is calculated and remitted automatically. The 1.5% buyer service fee is
                itemised at checkout — buyers see it before they pay. You receive the ticket
                face-value minus your 7% (or 5% volume) commission.
              </>
            ),
          },
          {
            q: 'Can I move a buyer to a different ticket?',
            a: (
              <>
                Yes — from the dashboard, open the order and reassign the ticket to a different
                tier. The buyer gets an email confirming the change. Price differences settle via
                wallet (credit) or card top-up (additional payment).
              </>
            ),
          },
        ]}
      />

      <ContentCTA
        eyebrow="Start selling"
        title="Free to sign up. First ticket can ship today."
        sub="Set up your organizer account in under a minute. KYC takes 24 hours; first event can publish the moment you connect your bank."
        primary={{ label: 'Create organizer account', href: '/dashboard/signup' }}
        secondary={{ label: 'See Promoter Hub', href: '/for-organizers/promoter-hub' }}
      />
    </div>
  );
}
