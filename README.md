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

Phase 1 development kicked off. The repo contains a working monorepo skeleton: NestJS API, Next.js marketplace, Prisma schema, Docker dev environment, CI.

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

## What's working in Phase 1 so far

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
- Swagger docs auto-generated at `/docs`
- Tests: webhook signature verification suite
- CI: typecheck + build against Postgres

## Next up

- Organizer dashboard UI (sign in, create event, view sales, refunds)
- Scanner app (Flutter) — offline cache + replay protection at the gate
- Email/SMS confirmations (Postmark + Termii)
- Public API auth (API keys), outbound webhooks for organizers, embeddable checkout widget
- Bus travel vertical
