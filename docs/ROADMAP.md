# Roadmap

A phased launch plan that ships value early and avoids boiling the ocean.

## Phase 1 — Foundation (MVP) — ✅ Complete

Goal: prove the multi-vendor booking loop with real organizers, real events, and real money in.

Shipped:

- **Multi-vendor onboarding** — self-serve organizer signup, light KYC (bank verification via Paystack sub-account, admin notes field)
- **Events & Concerts** — listing, detail, multi-tier selection, Paystack checkout, signed QR e-tickets
- **Bus Travel** — routes, search by city + date at `/buses`, trips reuse the events flow with `type=BUS_TRIP`, QR boarding passes
- **Paystack** with split payouts to organizer sub-accounts
- **Customer accounts** — `/signin`, `/signup`, `/account` with linked order history. (OTP deferred to Phase 2.)
- **Organizer dashboard** — events, ticket tiers, live sales (sold/revenue/paid orders), one-click refunds, payouts setup, promo codes (percentage + fixed), team management with roles, developer settings
- **Admin console** at `/admin` — platform stats, approve/suspend organizers, commission editor, KYC notes. Approval is enforced — `PENDING`/`SUSPENDED` organizers can't publish events.
- **Scanner** — browser-based PWA at `/scan` using device camera, scoped to `OWNER` / `MANAGER` / `SCANNER` roles. Flutter port deferred.
- **Public API v1** — per-organizer API keys (sha256-stored, revocable) plus outbound webhooks (HMAC SHA-256 signed) for `order.paid`, `order.refunded`, `ticket.scanned`. Public `/api/v1/me` smoke endpoint.
- **Embeddable widget** — drop-in `<script src="/widget.js">` with a live demo at `/widget-demo`.
- **Concurrency-safe inventory** — verified by `scripts/load-test-inventory.sh` at 200 buyers / 5 seats.

## Phase 2 — Travel & Stays + Dashboard v2 — ✅ Complete

Shipped:

- **Partial refunds + async refund webhook** — Refund records, idempotent claims, separate sync (Paystack response) and async (`refund.processed` webhook) paths
- **Wallet** — atomic ledger, Paystack top-ups, pay-from-wallet at checkout, refunds default to wallet for signed-in buyers
- **Webhook delivery log + retry queue** — every dispatch persisted, exponential back-off (1m, 5m, 30m, 2h, 8h, 24h) up to 6 attempts, dashboard view with manual retry
- **Reserved seating** — seat-map editor, atomic seat holds, SOLD→Ticket linkage, refund/expiry release seats
- **Add-ons** (concessions, parking, merch) — event-scoped, capacity-tracked, attached to orders
- **Termii SMS** confirmations alongside email
- **Referral program** — auto-generated codes, attribution at signup, NGN 500 wallet credit on referee's first paid order
- **Broadcasts** — organizer-to-attendee email per event, with sent log
- **Affiliate tracking** — links per organizer, attribution stored on orders, revenue dashboard
- **Hotels** (stub inventory) — schema, public search, organizer CRUD
- **Flights** (stub inventory) — schema, public search by route/date, organizer CRUD

Deferred (real provider integration required, Phase 3):

- Flight checkout via GDS / NDC (Travelport, Sabre, direct airline APIs)
- Hotel checkout via PMS integration
- Flutter port of the scanner for offline-first venue ops
- WordPress / Shopify plugins for the embeddable widget

## Phase 3 — Ecosystem — ✅ Complete

Shipped:

- **Wallet KYC tiers** (NONE / BASIC / VERIFIED) with per-tier top-up caps and admin review queue
- **Loyalty points** — earn 1 per NGN 100 spent, redeem at checkout (100 pts = NGN 100 off)
- **Vouchers & gift cards** — organizer issues batches, buyer redeems to wallet
- **Resale marketplace** — list a ticket, atomic wallet-debit + ownership transfer + 10% platform fee
- **Agent network** — admin-issued codes, attribution at checkout, wallet-credited commission
- **Corporate accounts** — credit-limited enterprise booking, per-employee limits, central-billed invoices
- **Hotel & flight checkout** — bookings via Paystack with prefixed references, atomic flight seat claims, PNR on payment
- **OAuth 2.0 (client_credentials)** — registered clients with hashed secrets, sha256-stored access tokens, scope narrowing at issuance
- **White-label organizer pages** — `customDomain` field, Next.js middleware that rewrites `tickets.organizer.com` to the organizer's branded landing page

Deferred to Phase 4 (real provider integration required):

- GDS / NDC integration for flights (Travelport, Sabre, direct airline APIs)
- Hotel PMS integrations
- Flutter native scanner
- WordPress / Shopify plugin packages
- OAuth authorization_code grant (browser-mediated consent flow)

## Phase 4 — Future

- NFT / blockchain tickets for premium concerts
- Live streaming / hybrid events
- AI dynamic pricing
- AI customer support chatbot deeply integrated across verticals

## Out of scope until proven demand

- White-label organizer storefronts
- International expansion beyond Nigeria
- Crypto payments (regulatory uncertainty)
