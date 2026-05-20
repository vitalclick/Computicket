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

## Phase 2 — Travel & Stays

- **Flights** — domestic carriers first (Air Peace, Ibom Air, United Nigeria, Overland), international via GDS later
- **Hotels & short-lets** — search, map, reviews, pay-now or pay-at-hotel
- **Theatre & Cinema** — showtime + seat mapping, food combo add-ons
- Wallet (top up, refunds, ticket purchases)
- Referral program
- Public API v1 GA — WordPress plugin, JS/PHP/Python/Flutter SDKs
- Organizer dashboard v2 — reserved seating editor, affiliate tracking, broadcast emails

## Phase 3 — Ecosystem

- **Vouchers & Gift Cards** — restaurants, spa, travel, shopping, entertainment
- **Loyalty points** across all verticals
- **Corporate solutions** — enterprise booking, central billing
- **Resale marketplace** — verified, fraud-resistant ticket resales
- **Agent network** — offline agents across Nigeria with sub-accounts
- **White-label checkout subdomain** for organizers (`tickets.organizer.com`)
- **OAuth 2.0** for third-party apps acting on behalf of organizers
- **Shopify app** and other marketplace integrations

## Phase 4 — Future

- NFT / blockchain tickets for premium concerts
- Live streaming / hybrid events
- AI dynamic pricing
- AI customer support chatbot deeply integrated across verticals

## Out of scope until proven demand

- White-label organizer storefronts
- International expansion beyond Nigeria
- Crypto payments (regulatory uncertainty)
