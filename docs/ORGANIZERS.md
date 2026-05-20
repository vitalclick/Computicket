# Organizers (Multi-Vendor Platform)

Computicket Nigeria is a **multi-vendor marketplace**. Organizers self-serve: they sign up, get verified, and run their full ticketing operation through our dashboard and API. We're the rails — they own the brand, the audience, and the data.

## Who counts as an organizer

- Event promoters and concert organizers
- Comedy and theatre producers
- Conferences and training providers
- Churches and faith-based events
- Universities and student bodies
- Sports clubs and federations
- Bus operators (in their own dashboard variant)
- Cinemas and venues

## Onboarding

1. **Sign up** — email + phone OTP
2. **KYC** — CAC registration, director ID, BVN, proof of address (light KYC for individuals under a payout threshold)
3. **Payout setup** — bank account verified via NIP name enquiry; mapped to a Paystack sub-account
4. **Profile** — logo, brand colour, public organizer page (`computicket.ng/o/<slug>`)
5. **Approval** — automated for low-risk, manual review for high-volume or flagged
6. **Go live** — create first event, first ticket sells within minutes of approval

## Dashboard capabilities

### Events

- Create / clone / draft events with rich media
- Recurring events and multi-date series
- Multi-venue events
- Private (link-only) and password-gated events
- Scheduled publish

### Tickets

- Unlimited ticket types per event (General, VIP, VVIP, Table, Student, Comp, etc.)
- Tiered pricing, early bird windows, automatic price changes
- Quantity limits per type and per buyer
- Group / table bookings
- Promo codes (percentage, fixed, BOGO, organizer-specific, partner-specific)
- Add-ons (parking, food combos, merch)
- Hidden tickets (revealed by code or affiliate link)
- Comp tickets with audit trail
- Custom ticket design (logo, colour, background, branded QR frame)

### Seating

- Reserved seating with seat map editor (rows, sections, accessible seats)
- General admission with capacity tracking
- Holds and blocks (press, VIPs, comps)

### Sales & operations

- Live sales dashboard with revenue, conversion, traffic source
- Order management: refunds (full/partial), transfers, name changes, resends
- Customer list with search, export, segmentation
- Email broadcasts to attendees (compliance-aware)
- Affiliate / promoter tracking with per-link commission

### Door & check-in

- Scanner app (iOS, Android) with offline mode and conflict resolution
- Multi-gate support with role-based scanner accounts
- Real-time scan-in feed for the event
- Capacity alerts, suspicious-scan alerts
- Print-at-home and wristband / RFID export for partners

### Payouts & finance

- Real-time settlement view (gross, fees, commission, net)
- Configurable payout schedule (T+1, weekly, post-event)
- Statements, invoices, receipts (FIRS-compliant where required)
- Multi-bank-account support per organizer
- Hold/reserve policies for high-risk or new organizers

### Team & permissions

- Roles: Owner, Manager, Finance, Marketing, Scanner, Read-only
- Per-event access scopes
- Audit log of every action

## Branded experience

- Custom organizer page with their logo, banner, bio, social links
- Custom email sender name and reply-to
- Optional white-label checkout subdomain (Phase 3)
- Branded tickets and confirmation emails

## Embed on their own website

Organizers don't have to send buyers to us:

- **Embeddable checkout widget** (iframe + JS SDK) — drops into any site
- **Public API** — full programmatic control (see [API.md](./API.md))
- **Webhooks** — order, scan, refund, payout events
- **Pre-built integrations** — WordPress plugin, Shopify app (post-MVP)

## Support tiers

- **Self-serve** — help center, community, in-app chat
- **Priority** (Growth plan) — same-day email response, dedicated Slack/WhatsApp channel
- **Enterprise** — account manager, on-site support for major events, SLA

## Risk controls (platform side)

- Per-organizer rolling reserve based on chargeback history
- Anti-scalping rules per event
- Manual review queue for first events over a threshold
- Hard stop on payouts when KYC lapses or disputes spike
