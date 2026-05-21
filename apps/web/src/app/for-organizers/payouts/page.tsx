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
  title: 'Payouts — Computicket for Organizers',
  description:
    'Direct bank settlement, NDIC-insured escrow, sub-account-per-organizer routing. T+1 to T+3 to your bank.',
};

export default function PayoutsPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="organizer" active="payouts" />

      <ContentHero
        eyebrow="Organizer · Payouts"
        title="Funds land in your bank. Not in our pocket."
        lede="Direct bank settlement via Paystack sub-accounts. NDIC-insured escrow. T+1 to T+3 from sale to bank. No weekly batches, no opaque withholding, no surprise reconciliation calls."
      />

      <StatsStrip
        stats={[
          { n: 'T+1 → T+3', l: 'Sale to bank, depending on bank' },
          { n: 'NDIC',       l: 'Escrow held at Wema · insured' },
          { n: '0',          l: 'Funds co-mingled with ours' },
          { n: 'Per event',   l: 'Reconciliation, automatic' },
        ]}
      />

      <PillarsBlock
        eyebrow="How payouts work"
        title="Sub-account routing, end to end."
        cols={3}
        pillars={[
          {
            icon: 'wallet',
            title: 'Sub-account per organizer',
            body:
              "Each organizer gets its own Paystack sub-account at onboarding. Buyer payments route to your sub-account directly — we never touch your funds.",
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'shield',
            title: 'NDIC-insured escrow',
            body:
              'Funds sit in NDIC-insured escrow at Wema Bank until the event delivers. If your event fires correctly, the escrow releases automatically 24 hours after gates close.',
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'check',
            title: 'Commission auto-deducted',
            body:
              'Our 7% (or 5% volume) commission is deducted at sale, before funds reach your sub-account. No invoicing, no monthly reconciliation, no surprise bills.',
            color: 'oklch(0.65 0.15 75)',
          },
          {
            icon: 'refresh',
            title: 'Refunds, automatic rollback',
            body:
              "When you refund a buyer, the payout amount adjusts in your next settlement. Refunds-to-wallet are instant; card refunds roll back via the standard Paystack flow.",
            color: 'oklch(0.55 0.18 305)',
          },
          {
            icon: 'chart',
            title: 'Full reconciliation export',
            body:
              'Every payout comes with a CSV listing every order, ticket, refund, promo redemption and commission line. Hand it to your accountant — it ties exactly to your bank.',
            color: 'oklch(0.62 0.14 200)',
          },
          {
            icon: 'pulse',
            title: 'Live ledger',
            body:
              "See pending, in-escrow and paid-out totals in real time. Drill into any settlement to see the underlying orders. No more 'where's my money?' calls.",
            color: 'oklch(0.65 0.20 25)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="Setting up payouts"
        title="Two-minute setup. One bank account."
        image="ph-7"
        imageCaption="Payout setup · Promoter Hub"
        body={
          <>
            <p>
              From <span className="mono">Settings → Payouts</span> in your dashboard, select
              your bank and enter the account number. We verify the account name via Paystack&apos;s
              bank API in under 5 seconds. Once it matches your registered organizer name,
              you&apos;re live.
            </p>
            <p className="mt-4">
              You can update the destination at any time. Pending settlements continue to the
              previous account until reconciled; new sales route to the new one.
            </p>
            <p className="mt-4">
              All 24 major Nigerian banks supported, plus Wema, Sterling, Polaris and select
              microfinance banks (Moniepoint, Opay, PalmPay).
            </p>
          </>
        }
      />

      <ContentBlock
        eyebrow="Escrow & buyer protection"
        title="Funds release after the event delivers. Buyers stay protected."
        imagePosition="left"
        image="ph-4"
        imageCaption="Escrow reconciliation · Lagos ops"
        body={
          <>
            <p>
              We hold funds in NDIC-insured escrow until 24 hours after gates close. We reconcile
              scan counts against orders, settle the difference (no-shows return to your payout,
              cancelled tickets refund automatically), then release the net to your sub-account.
            </p>
            <p className="mt-4">
              This is what backs Buyer Protection. If you fail to deliver — venue change beyond
              policy, cancellation, no-show by the organizer — buyers get refunded from escrow
              before you see the funds. Fly-by-night operators are filtered out at this layer.
            </p>
            <p className="mt-4">
              Established operators with a track record can request <em>release-on-publish</em>{' '}
              (funds settle T+1 without waiting for the event). 200+ organizers qualify; the
              criteria are published on the Trust &amp; Safety page.
            </p>
          </>
        }
      />

      <FAQBlock
        eyebrow="Frequently asked"
        title="Payout questions."
        items={[
          {
            q: 'When exactly will I see my first payout?',
            a: (
              <>
                For new organizers with default escrow: 24 hours after the event closes. For
                qualified release-on-publish organizers: T+1 (one business day after the sale).
                Tier-1 banks usually credit within 4 hours of disbursement.
              </>
            ),
          },
          {
            q: 'What if my bank rejects the transfer?',
            a: (
              <>
                Paystack retries automatically. If it still fails after 3 attempts, we email you
                and place the payout in a <span className="mono">RETRY</span> state. Update the
                bank details from the dashboard and it ships on the next disbursement window.
              </>
            ),
          },
          {
            q: 'How do you handle multi-currency?',
            a: (
              <>
                Today, every transaction settles in NGN. Enterprise customers with USD or GBP
                events can request multi-currency invoicing — we settle in NGN and you invoice
                buyers separately for the difference. Native USD/GBP rails ship in Q4.
              </>
            ),
          },
          {
            q: 'Are there payout fees?',
            a: (
              <>
                No additional fee from Computicket. Paystack&apos;s transfer fee (₦10–₦50
                depending on amount) is absorbed by us as part of our commission. The amount that
                lands in your bank is exactly the amount on your reconciliation line.
              </>
            ),
          },
          {
            q: 'Can I have multiple bank accounts?',
            a: (
              <>
                Yes, on the Enterprise plan. Routing rules can split per event, per region or per
                tier. Useful for tour productions splitting revenue between artist, promoter and
                venue — done at the rail layer rather than via post-event reconciliation.
              </>
            ),
          },
        ]}
      />

      <ContentCTA
        eyebrow="Get paid"
        title="Connect your bank. Sell your first ticket. We do the rest."
        sub="No invoicing, no monthly reconciliation calls, no waiting on bookkeeping. Sale to bank, automatically."
        primary={{ label: 'Set up payouts', href: '/dashboard' }}
        secondary={{ label: 'Read about analytics', href: '/for-organizers/analytics' }}
      />
    </div>
  );
}
