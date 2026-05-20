# Public API

Organizers and partners integrate Computicket Nigeria into their own websites, apps, and back-office systems via a versioned REST API, embeddable widgets, official SDKs, and webhooks.

## Principles

- **REST + JSON**, versioned at the path (`/v1/...`)
- **Idempotent writes** via `Idempotency-Key` header
- **Cursor pagination** with stable ordering
- **Predictable errors** — RFC 7807 problem+json
- **No breaking changes** within a major version; deprecations announced 6 months ahead
- **Sandbox environment** mirrors production, free for organizers

## Authentication

- **API keys** scoped per organizer (publishable + secret)
- Secret keys for server-to-server; publishable for client widgets
- **OAuth 2.0** for third-party apps acting on behalf of organizers (Phase 3)
- Mutual TLS available for enterprise

## Surface area

### Events

- `POST /v1/events` — create
- `GET /v1/events/:id`
- `PATCH /v1/events/:id`
- `POST /v1/events/:id/publish`
- `POST /v1/events/:id/clone`
- `GET /v1/events?status=&from=&to=&cursor=`

### Tickets

- `POST /v1/events/:id/ticket_types`
- `PATCH /v1/ticket_types/:id`
- `POST /v1/ticket_types/:id/holds`
- Promo codes, add-ons, comps under the same resource tree

### Orders & checkout

- `POST /v1/orders` — server-side cart creation
- `POST /v1/checkout_sessions` — hosted Paystack checkout
- `POST /v1/orders/:id/refunds`
- `POST /v1/orders/:id/transfer` — transfer to a new attendee

### Attendees & tickets

- `GET /v1/orders/:id/tickets`
- `POST /v1/tickets/:id/resend`
- `POST /v1/tickets/:id/scan` — used by the scanner app and partner gates

### Reporting

- `GET /v1/reports/sales?event_id=...`
- `GET /v1/reports/payouts`
- CSV exports via `Accept: text/csv`

### Customers

- `GET /v1/customers` (organizer-scoped, with consent rules)
- `POST /v1/broadcasts` — email campaigns to attendees

## Webhooks

Subscribe per organizer. Signed with HMAC SHA256 of the raw body using a per-endpoint secret.

| Event | When |
| --- | --- |
| `order.created` | Cart created |
| `order.paid` | Payment confirmed |
| `order.refunded` | Refund processed |
| `ticket.issued` | QR ticket generated |
| `ticket.scanned` | Gate scan |
| `ticket.transferred` | Reassigned to a new attendee |
| `event.published` | Event went live |
| `payout.paid` | Settlement sent to bank |
| `dispute.opened` | Chargeback raised |

- At-least-once delivery with exponential backoff up to 72 hours
- Replay from dashboard
- Endpoint health monitoring with email alerts on sustained failures

## Embeddable widgets

- **Checkout widget** — drop-in iframe/JS, themed to organizer brand
- **Event card** — single-event listing
- **Schedule widget** — multi-event calendar
- **Buy button** — minimal CTA

All widgets are responsive, accessible (WCAG 2.1 AA), and load < 50KB JS gzipped.

## SDKs

- **JavaScript / TypeScript** (browser + Node)
- **PHP** (WordPress ecosystem)
- **Python**
- **Flutter / Dart**
- **Mobile** native shims for iOS/Android scanner integrations

## Rate limits

- 60 requests/sec per API key (burst 120)
- Higher limits available on Enterprise
- 429 responses include `Retry-After` and `X-RateLimit-*` headers

## Compliance & data

- Buyer PII access governed by organizer consent and Nigerian data protection law (NDPA)
- Webhook payloads can be configured to redact PII for downstream systems
- Right-to-erasure honoured within 30 days; tickets anonymized while preserving financial records

## Versioning

- Current: `v1` (pre-release)
- Breaking changes ship in a new major version
- Deprecated fields kept for 12 months with `Sunset` headers

## Developer experience

- OpenAPI 3.1 spec, auto-generated SDKs
- Hosted reference docs with try-it-now console
- Postman collection
- Status page with public uptime
- Sandbox keys issued instantly at signup
