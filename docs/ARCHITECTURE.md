# Architecture

## Surfaces

Computicket Nigeria ships several distinct surfaces against one backend:

- **Marketplace web** (`computicket.ng`) — discovery, buyer checkout
- **Buyer mobile apps** (iOS, Android, Flutter) — tickets, wallet, scanning their own QRs
- **Organizer dashboard** (`organizer.computicket.ng`) — multi-vendor control plane
- **Scanner app** (iOS, Android) — door staff, offline-first
- **Embeddable widgets** — drop-in checkout for organizer websites
- **Public API** — REST + webhooks for partner integrations
- **Admin console** — internal operations

## Tech stack

### Frontend

- **Next.js** (App Router) — marketplace + organizer dashboard, SSR for SEO and AI indexability
- **TailwindCSS** — design system shared across surfaces
- **Flutter** — buyer apps + scanner app (shared codebase)
- **PWA** — offline ticket storage, low-data mode
- **Embeddable widget bundle** — framework-agnostic, < 50KB gzipped

### Backend

- **NestJS** (Node.js + TypeScript) — primary API
- REST for public clients, internal RPC where useful
- BullMQ for background jobs (email, payouts, scan sync, fraud checks)

### Data

- **PostgreSQL** — primary store
- **Redis** — cache, rate limits, session, queues
- **S3-compatible storage** — event images, ID docs, generated tickets

### Infrastructure

- **AWS** (eu-west-1 or af-south-1) or equivalent
- **Cloudflare** — CDN, WAF, DDoS protection
- GitHub Actions for CI/CD
- Sentry for error tracking, PostHog/Plausible for product analytics

## Core domains

| Domain | Responsibility |
| --- | --- |
| `identity` | Users, OTP, MFA, sessions, devices |
| `organizers` | Vendor accounts, KYC, team & roles, branding, sub-accounts |
| `catalog` | Events, routes, flights, hotels, vouchers |
| `inventory` | Seats, capacity, holds, reservations |
| `pricing` | Tiers, promo codes, dynamic pricing inputs |
| `orders` | Cart, checkout, order lifecycle |
| `payments` | Paystack integration, refunds, wallet |
| `tickets` | QR generation, signing, scan validation, transfers |
| `payouts` | Vendor settlement, split payments, ledger |
| `notifications` | Email, SMS, push, broadcasts |
| `fraud` | Rules + AI scoring, device fingerprinting |
| `api` | Public REST API, API keys, OAuth, rate limits |
| `webhooks` | Outbound delivery, retries, signing, replay |
| `admin` | Vendor approval, commissions, CMS |

## Ticketing & anti-fraud

- Tickets signed with HMAC + rotating server secret
- QR encodes a short opaque ID; full ticket data lives server-side
- Scanner app validates online; offline mode caches whitelist with replay protection
- Per-ticket scan limit (default 1), audit log of every scan
- Device fingerprinting on purchase to flag bot/scalper patterns
- Velocity rules: card/IP/device thresholds

## Security

- All traffic TLS 1.2+
- PCI scope minimized — card data never touches our servers (Paystack-hosted)
- OTP via SMS for sensitive actions (new device, password reset, payout change)
- Role-based access for organizer staff (owner, manager, scanner)
- Secrets in AWS Secrets Manager, rotated quarterly
- Audit log for all admin and payout actions

## SEO & AI visibility

- Structured data: `Event`, `Place`, `Offer`, `Product` schemas
- Sitemap with per-event URLs, hreflang for EN + future languages
- Conversational-friendly H1/H2 structure, FAQ blocks on listing pages
- Fast TTFB targets: P75 < 800ms on 4G

## Performance targets

- Listing page LCP < 2.5s on mid-tier Android over 4G
- Checkout to ticket issued < 6s (P95) excluding 3DS time
- Scanner validation < 300ms round trip on stable 4G
