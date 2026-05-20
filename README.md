# Computicket Nigeria

> Nigeria's All-in-One Ticketing Platform — book events, travel, and experiences in seconds.

Computicket Nigeria is a **multi-vendor** digital booking and ticketing platform that unifies entertainment, travel, accommodation, and vouchers into a single mobile-first experience optimized for Nigerian payments, trust, and connectivity. Organizers run their entire ticketing operation on Computicket — create events, design and manage tickets, take payments, scan at the door, settle payouts — and embed the same engine into their own websites and apps via a first-class public API.

## What you can book

- **Events & Concerts** — music, comedy, festivals, conferences, church programs, sports, weddings, university events
- **Theatre & Cinema** — stage productions, premieres, cinema showtimes
- **Flights** — domestic (Air Peace, Ibom Air, United Nigeria, Overland) and international via GDS
- **Bus Travel** — GUO, ABC Transport, GIGM, Young Shall Grow, Libra, and more
- **Accommodation** — hotels, short-lets, apartments
- **Vouchers & Gift Cards** — restaurants, spa, travel, shopping, entertainment

## Who it's for

Customers, event organizers, travel operators, bus companies, hotels, entertainment brands, and corporate organizations.

## Differentiators

- **Local payments first** — Paystack, Flutterwave, Moniepoint, OPay, PalmPay, bank transfer, USSD, in-app wallet
- **Mobile-first** — Flutter apps, PWA, offline ticket storage, low-data mode
- **AI-powered** — recommendations, smart pricing insights, fraud detection, conversational support
- **Anti-fraud ticketing** — dynamic QR codes, anti-screenshot validation, real-time scan, device fingerprinting

## Documentation

- [Roadmap](./docs/ROADMAP.md) — phased launch plan
- [Architecture](./docs/ARCHITECTURE.md) — tech stack, system design, security
- [Organizers](./docs/ORGANIZERS.md) — multi-vendor model, dashboard, tooling
- [Public API](./docs/API.md) — REST + webhooks, embeddable widgets, SDKs
- [Payments](./docs/PAYMENTS.md) — Paystack integration plan and Nigerian payment landscape
- [Revenue Model](./docs/REVENUE.md) — commissions, subscriptions, ads, corporate
- [Brand](./docs/BRAND.md) — tone, taglines, positioning
- [Competitors](./docs/COMPETITORS.md) — local and global landscape

## Status

**Phases 1–3 complete.** Multi-vendor ticketing end to end across events, bus, theatre/cinema (add-ons), hotels, and flights. Wallet (with KYC tiers), loyalty points, gift-card vouchers, resale marketplace, agent network, corporate accounts, OAuth 2.0 for partners, and white-label organizer subdomains all ship in this repo.

## Quick start

Prerequisites: Node 20+, pnpm 9+, Docker.

```bash
cp .env.example .env
pnpm install
pnpm docker:up          # Postgres + Redis
pnpm db:generate
pnpm --filter @computicket/db exec prisma migrate dev --name init
pnpm db:seed            # demo organizer + 2 events
pnpm dev                # API on :4000, web on :3000
```

- Marketplace: http://localhost:3000
- API docs (Swagger): http://localhost:4000/docs
- API base: http://localhost:4000/v1

## Monorepo layout

```
apps/
  api/        NestJS API (events, orders, tickets, organizers, health)
  web/        Next.js marketplace (App Router + Tailwind)
packages/
  db/         Prisma schema + client
infra/        docker-compose for local Postgres + Redis
docs/         Architecture, roadmap, payments, organizers, API, brand
.github/      CI workflow
```

## What ships in Phase 1

- Multi-vendor data model: organizers with members + roles, events, ticket types, orders, tickets
- Public REST endpoints for events (list, detail, publish) and organizers (create, list, get)
- Order creation with inventory check and 15-minute holds
- **Paystack initialize** — real `/transaction/initialize` call, with a dev fallback when keys aren't set
- **Webhook handler** with HMAC SHA512 signature verification, amount-match check, and idempotent ticket issuance
- **Atomic ticket issuance** — claims the order via conditional update so replayed webhooks can't double-issue
- **QR codes** — `GET /v1/tickets/:code/qr.png` returns a scannable PNG
- **Scan endpoint** with one-shot replay protection (second scan returns `already_scanned`)
- Marketplace home, event listing, event detail with **live checkout form** (redirects to Paystack)
- `/checkout/return` page that shows issued tickets and QRs after payment
- **Inventory holds** — per-tier `held` counter, atomic raw-SQL claim that
  rejects overselling under concurrent buyers
- **Order expiry cron** — releases held inventory from abandoned pending
  orders every minute (race-safe via conditional updates)
- **Buyer email** — Postmark transport (logs to stdout in dev) with
  HTML body containing each ticket's QR inlined as a data URI
- **Auth** — email/password signup + signin, JWT bearer tokens,
  `JwtAuthGuard` and `OrganizerMemberGuard`. Protected: POST
  `/organizers`, POST `/events`, POST `/events/:slug/publish`,
  dashboard endpoints
- **Organizer dashboard UI** — sign in/up, organizer switcher, per-org
  page with sales stats (sold, revenue, paid orders), inline
  multi-tier event creation form, draft/publish toggle, orders list
  with one-click refund, **payouts setup** (bank picker, account
  verification via Paystack sub-account), **developer settings**
  (per-organizer API keys + outbound webhook endpoints)
- **Refunds** — Paystack refund + atomic state transition + ticket
  voiding + inventory release, idempotent on replay
- **Paystack split payments** — organizer sub-accounts, transactions
  initialised with the subaccount code so funds route directly to
  the organizer minus our commission
- **Scanner PWA** — camera-based ticket validation at `/scan`,
  scoped to {OWNER, MANAGER, SCANNER} roles on the event's organizer
- **Per-organizer API keys** with sha256 storage and revocation; a
  public `/api/v1/me` surface for partners to integrate against
- **Outbound webhooks** — order.paid, order.refunded, ticket.scanned;
  HMAC-SHA256 signature header, 5s timeout, parallel dispatch
- **Concurrency-safe inventory** — verified by `scripts/load-test-inventory.sh`:
  200 concurrent buyers competing for 5 seats produces exactly 5
  successes and 195 sold-out responses, no over-sells
- **Buyer accounts** — `/signin`, `/signup`, `/account` with linked
  order history and QR re-download for every paid ticket
- **Admin console** at `/admin` with platform stats, organizer
  approval/suspension, commission editor, KYC notes. `OrganizerStatus`
  is enforced: PENDING and SUSPENDED organizers can't publish events.
- **Team management** — invite, role change, remove on
  `/dashboard/o/[slug]/team`. Owner-only; defensive checks block
  self-demotion and removing the last owner.
- **Promo codes** — percentage or fixed-amount discounts, optional
  event scope, max uses, expiry. Atomic claim under load.
- **Embeddable buy-button widget** at `/widget.js` with a live demo
  at `/widget-demo`
- **Bus travel vertical** — routes, trip search at `/buses`, QR
  boarding passes via the same Order/Ticket flow
- Swagger docs auto-generated at `/docs`
- Tests: webhook signature verification, order expiry race-loss case
- CI: typecheck + build against Postgres

## What landed in Phase 2

- **Partial refunds + async refund webhook** — Refund records, idempotent claims, sync + async Paystack paths
- **Wallet** — atomic ledger, Paystack top-ups, pay-from-wallet at checkout, refunds-to-wallet
- **Webhook delivery log + retry queue** — every dispatch persisted, exponential backoff up to 6 attempts, dashboard view + manual retry
- **Reserved seating** — seat map editor, atomic seat holds, sold→Ticket linkage, refund/expiry release seats
- **Add-ons** (concessions, parking, merch) attached to orders
- **SMS** via Termii (dev fallback to stdout)
- **Referrals** — auto-generated codes, attribution at signup, NGN 500 wallet credit on first paid order
- **Broadcasts** — organizer-to-attendee emails per event with sent log
- **Affiliate tracking** — codes attribute orders, revenue dashboard
- **Hotels** (stub inventory) — public search, detail, organizer CRUD
- **Flights** (stub inventory) — public search by route/date, organizer CRUD

## Phase 3 candidates

- Real GDS / NDC integration for flights
- Hotel PMS integrations
- Flutter port of the scanner for offline-first venue ops
- Hotel/flight checkout integration (PNR, passenger names, nights)
- Wallet KYC for higher top-up tiers
- WordPress / Shopify plugins for the embeddable widget
