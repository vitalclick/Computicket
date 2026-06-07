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
  title: 'API Access — Computicket for Organizers',
  description:
    'Per-organizer API keys, signed webhooks, embeddable widget, REST + GraphQL. Integrate Computicket anywhere.',
};

export default function ApiAccessPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="organizer" active="api-access" />

      <ContentHero
        eyebrow="Organizer · API Access"
        title="Computicket, programmatically."
        lede="Per-organizer API keys, signed outbound webhooks, idempotent writes, sandbox parity. Build native integrations, custom checkout, partner inventory feeds — without leaving the platform."
      />

      <StatsStrip
        stats={[
          { n: 'REST + GraphQL', l: 'Two surfaces, same data' },
          { n: 'idempotent',      l: 'Every write, every retry' },
          { n: '< 5 min',         l: 'Sandbox to first request' },
          { n: '99.97%',           l: 'API uptime (90-day SLA)' },
        ]}
      />

      <PillarsBlock
        eyebrow="What you can build"
        title="Six API patterns we see daily."
        cols={3}
        pillars={[
          {
            icon: 'send',
            title: 'Custom checkout',
            body:
              'Headless cart and order endpoints. Implement Computicket inside your existing buyer flow. Paystack handoff happens on our side — your buyers never see a redirect.',
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'qr',
            title: 'Custom scanner',
            body:
              "Drop the scan endpoint into your in-house door app. We return the same anti-replay decisions, audit-logged. iOS, Android and barcode-scanner SDKs.",
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'chart',
            title: 'Reporting & BI',
            body:
              'Pull live revenue, channel attribution and refund streams into BigQuery, Snowflake or Looker Studio. Push pipelines via signed webhook.',
            color: 'oklch(0.65 0.15 75)',
          },
          {
            icon: 'grid',
            title: 'Multi-venue inventory',
            body:
              'Run a chain? Manage all venues under one organizer, scoped roles per venue, consolidated payouts. The API matches the dashboard surface 1:1.',
            color: 'oklch(0.55 0.18 305)',
          },
          {
            icon: 'gift',
            title: 'Loyalty & rewards',
            body:
              'Wallet credit, points award, voucher issuance — all API-callable. Run Compass-style loyalty inside your own brand without rebuilding the rails.',
            color: 'oklch(0.62 0.14 200)',
          },
          {
            icon: 'shield',
            title: 'Fraud signals',
            body:
              'Subscribe to our fraud signal stream for buyer reputation, device fingerprint risk and historical chargeback velocity. Real-time, push-based.',
            color: 'oklch(0.65 0.20 25)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="Webhook architecture"
        title="Signed, idempotent, retried — never replayed accidentally."
        image="ph-2"
        imageCaption="Webhook delivery console · Promoter Hub"
        body={
          <>
            <p>
              Every webhook we send is HMAC-SHA256 signed with a per-endpoint secret. Verify the
              <span className="mono"> X-Computicket-Signature</span> header against the raw body
              before processing — boilerplate provided in our six SDKs.
            </p>
            <p className="mt-4">
              Retries follow exponential back-off across 6 attempts over 24 hours. Every delivery
              is persisted to a console you can inspect, replay manually, or disable.
              Deduplication is keyed by event ID, not URL — replays are safe.
            </p>
            <p className="mt-4">
              Subscribed events:
              <span className="mono"> order.paid</span>,
              <span className="mono"> order.refunded</span>,
              <span className="mono"> ticket.scanned</span>,
              <span className="mono"> ticket.voided</span>,
              <span className="mono"> seat.held</span>,
              <span className="mono"> seat.released</span>.
            </p>
          </>
        }
      />

      <ContentBlock
        eyebrow="Sandbox & developer experience"
        title="Live in 5 minutes. Production parity guaranteed."
        imagePosition="left"
        image="ph-9"
        imageCaption="Sandbox console · sandbox.computicket.ng"
        body={
          <>
            <p>
              Generate a sandbox API key from your organizer dashboard. Sandbox data mirrors the
              production schema exactly — webhooks, signatures, response shapes, pagination cursors
              are all identical.
            </p>
            <p className="mt-4">
              We ship a Postman collection that walks the happy-path (organizer → event → tier →
              order → payment webhook → scan) inside 5 minutes. Plus six official SDKs:
              TypeScript, Python, PHP, Go, Java, Ruby. Auto-generated, semver-stable.
            </p>
            <p className="mt-4">
              Documentation lives at <span className="mono">/docs</span> on every Computicket
              environment — Swagger UI, deep-linked, with response schemas inline.
            </p>
          </>
        }
      />

      <FAQBlock
        eyebrow="Frequently asked"
        title="API questions."
        items={[
          {
            q: 'How do I get an API key?',
            a: (
              <>
                Inside the dashboard, head to{' '}
                <span className="mono">Settings → Developers → API Keys</span>. Create a key
                scoped to read, write, or admin. Keys are sha256-hashed at rest — we never store
                or display the raw key after creation, so save it on issue.
              </>
            ),
          },
          {
            q: 'What are the rate limits?',
            a: (
              <>
                Standard plan: 60 read req/s, 20 write req/s per organizer. Volume plan: 200 read
                / 60 write. Enterprise: negotiated. 429 responses include{' '}
                <span className="mono">Retry-After</span> header. Burst credits are calculated per
                15-second window — short spikes get absorbed without throttling.
              </>
            ),
          },
          {
            q: 'Is there an OAuth flow?',
            a: (
              <>
                Yes — OAuth 2.0 for partners building on behalf of organizers. Authorization code
                + PKCE supported. Scopes mirror the dashboard permissions (
                <span className="mono">events:read</span>,{' '}
                <span className="mono">orders:write</span>,{' '}
                <span className="mono">scan:write</span>, etc.). Token rotation, refresh tokens,
                revocation endpoint all live.
              </>
            ),
          },
          {
            q: 'How do you version the API?',
            a: (
              <>
                URL-versioned (<span className="mono">/v1/...</span>). Breaking changes ship under
                a new major version with 12 months of overlap. Deprecation notices go out 6 months
                before sunset, with deprecation headers on every response while the version is
                still live.
              </>
            ),
          },
          {
            q: 'Can I self-host scanning?',
            a: (
              <>
                Yes — the scan API is fully open. POST a code to <span className="mono">/v1/tickets/scan</span>{' '}
                and you get the same one-shot replay protection the in-app scanner uses.
                Enterprise customers get the option of running an on-prem scan gateway for
                venues with no network.
              </>
            ),
          },
        ]}
      />

      <ContentCTA
        eyebrow="Start building"
        title="Sandbox key in 30 seconds. Production in a day."
        sub="No partnership review for sandbox. Sign up, click 'Create key', and start integrating. Production approval is automatic once your organizer KYC clears."
        primary={{ label: 'Get sandbox access', href: '/dashboard/signup' }}
        secondary={{ label: 'Read API docs', href: 'mailto:partners@computicket.ng?subject=API%20docs' }}
      />
    </div>
  );
}
