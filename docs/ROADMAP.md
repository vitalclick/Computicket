# Roadmap

A phased launch plan that ships value early and avoids boiling the ocean.

## Phase 1 — Foundation (MVP)

Goal: prove the multi-vendor booking loop with real organizers, real events, and real money in.

- **Multi-vendor onboarding** — self-serve organizer signup, KYC, Paystack sub-account mapping
- **Events & Concerts** — listing, detail, seat/tier selection, checkout, QR e-ticket
- **Bus Travel** — route search, seat selection, QR boarding pass
- **Paystack** as the sole payment provider with split payouts (see [PAYMENTS.md](./PAYMENTS.md))
- Customer accounts, booking history, OTP verification
- Organizer dashboard v1 — create events, design tickets (types, pricing, promo codes), live sales, refunds, payouts, team roles (see [ORGANIZERS.md](./ORGANIZERS.md))
- Admin console — vendor approval, commission settings, basic reports
- Scanner app (iOS + Android) for event check-in (QR validation, offline mode)
- Public API v1 (events, orders, tickets, webhooks) and embeddable checkout widget — beta (see [API.md](./API.md))

Success criteria: 50+ active organizers, 100+ events live, working scan at the gate, payouts settled weekly without manual intervention.

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
