# Computicket Nigeria — Deployment Info

The full operational manual for getting Computicket Nigeria running in
production. Covers infrastructure, environment variables, database
migrations, third-party integrations, social login + magic-link auth,
domain + DNS, observability, and the day-2 ops loop.

For a faster local-dev path see the root [README](../README.md). For
the Vercel-specific web deploy see [DEPLOY-WEB.md](./DEPLOY-WEB.md).

> **Audience:** ops + platform engineers. Assumes familiarity with
> Kubernetes / Vercel, Postgres, and the NestJS ↔ Next.js split this
> repo uses.

---

## 1. Topology

| Surface | Runtime | Hosting | Domain |
|---|---|---|---|
| **Web** (`apps/web`) | Next.js 15 on Node 20 | Vercel | `https://computicket.ng` |
| **API** (`apps/api`) | NestJS 10 on Node 20 | EKS (or any container host) | `https://api.computicket.ng` |
| **Postgres 16** | Managed | RDS (or any Postgres ≥ 14) | private |
| **Redis 7** | Managed | ElastiCache | private |
| **Mobile** (`apps/mobile`) | Flutter | App Store + Play | — |
| **Workers** | Background crons inside `apps/api` via `@nestjs/schedule` | Same pod as API | — |

The API is **stateless** behind a load balancer — scale horizontally by
upping the replica count. Long-running work (webhook retries, order
expiry, payout reconciliation) runs as in-process cron jobs and is
**race-safe**: every claim uses an atomic Prisma update with a
conditional `where`, so duplicated pod runs cannot double-issue tickets
or double-refund.

---

## 2. Environment variables

All env vars are documented in [`.env.example`](../.env.example). Copy
that file to `.env` for local dev. In production, set them via your
secret manager (AWS SSM / Vercel env / Doppler / etc).

### 2.1 Core (required everywhere)

| Var | Where | Notes |
|---|---|---|
| `DATABASE_URL` | API | `postgresql://USER:PASS@HOST:5432/DB?schema=public` — RDS recommended, minimum `db.t4g.small`. |
| `REDIS_URL` | API | `redis://HOST:6379` — used for rate-limit counters + scheduled jobs. |
| `PORT` | API | Defaults to `4000`; container port to expose. |
| `NODE_ENV` | API + Web | `production` in real envs. |
| `JWT_SECRET` | API | Min 64-char random. **Rotating invalidates every session** — coordinate. |
| `JWT_EXPIRES_IN` | API | `7d` is the default and matches the `Session.expiresAt` window. |
| `APP_KEY` | API | Derives the AES-256-GCM key encrypting TOTP secrets at rest. Set explicitly in prod — falls back to `JWT_SECRET` in dev, which is **not** safe. |

### 2.2 Public URLs

| Var | Where | Notes |
|---|---|---|
| `WEB_APP_URL` | API | Base URL Magic Link emails point at (`https://computicket.ng`). |
| `PUBLIC_WEB_URL` | API | Used by password-reset + email-verify mail links. |
| `PUBLIC_API_URL` | API | Embedded in NFT metadata `image` / `external_url` fields. |
| `NEXT_PUBLIC_API_URL` | Web | The browser's API base URL (`https://api.computicket.ng/v1`). |
| `NEXT_PUBLIC_SITE_URL` | Web | Used for OpenGraph URLs and sitemap absolute URLs. |

### 2.3 Payments — Paystack

| Var | Where | Notes |
|---|---|---|
| `PAYSTACK_PUBLIC_KEY` | API + Web | `pk_live_…` in prod, `pk_test_…` in staging. |
| `PAYSTACK_SECRET_KEY` | API only | `sk_live_…`. The webhook handler HMAC-verifies bodies against this. |

After deploying, set the Paystack webhook URL in your dashboard:
- **URL:** `https://api.computicket.ng/v1/webhooks/paystack`
- **Events:** `charge.success`, `refund.processed`, `refund.failed`

### 2.4 Email — Postmark

| Var | Where | Notes |
|---|---|---|
| `POSTMARK_SERVER_TOKEN` | API | Server token from the Postmark server you'll send from. Leave unset to log emails to stdout (dev). |
| `MAIL_FROM` | API | `tickets@computicket.ng`. Must be a verified sender signature on Postmark. |
| `MAIL_LOGO_URL` | API | Public URL of the brand mark inlined in transactional emails. |

### 2.5 SMS — Termii

| Var | Where | Notes |
|---|---|---|
| `TERMII_API_KEY` | API | Termii live API key. Without it, SMS messages log to stdout. |
| `TERMII_SENDER` | API | Sender ID, max 11 chars. `Computicket` is registered. |

### 2.6 Social sign-in (Google + Apple) — *new in this release*

| Var | Where | Notes |
|---|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | API | Google Cloud Console **Web** OAuth Client ID. Used to verify ID tokens on the backend. |
| `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` | Web | Same value, exposed to the browser so Google Identity Services can render the official button. |
| `APPLE_OAUTH_CLIENT_ID` | API | Apple **Service ID** (e.g. `ng.computicket.signin`), not the App ID. Used as the JWT audience when verifying Apple ID tokens. |
| `NEXT_PUBLIC_APPLE_OAUTH_CLIENT_ID` | Web | Same value, used by AppleID JS. |
| `NEXT_PUBLIC_APPLE_REDIRECT_URI` | Web | Must **exactly** match a Return URL configured on the Apple Service ID. Use `https://computicket.ng/signin` in prod. |

Setup details in [§5](#5-social-login-setup-google--apple) below. Leave
all four unset to silently disable the social buttons (the UI hides
them; the API rejects the endpoints with `400`).

### 2.7 Travel inventory (optional)

| Var | Where | Notes |
|---|---|---|
| `DUFFEL_API_KEY` | API | Flight inventory via Duffel. Without it `/v1/flights` returns only the locally-managed `Flight` rows. |
| `HOTELBEDS_API_KEY` + `HOTELBEDS_API_SECRET` | API | Hotel inventory via HotelBeds. **Both** required to activate. |

### 2.8 Push, observability, AI, NFT

| Var | Where | Notes |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | API | Paste the entire service-account JSON verbatim (or base64-encode if your secret manager prefers single lines). Without it, push notifications log to stdout. |
| `SENTRY_DSN` + `SENTRY_RELEASE` + `SENTRY_TRACES_SAMPLE_RATE` | API | Optional. Without `SENTRY_DSN`, unhandled errors still log to stdout via the global filter. |
| `ANTHROPIC_API_KEY` | API | AI support chatbot. Falls back to a deterministic keyword matcher when unset. |
| `NFT_SIGNING_KEY` | API | HMAC key for the (recipient, tokenId, tokenURI, expiresAt) payload the lazy-mint ERC-721 contract verifies. Falls back to `JWT_SECRET` in dev. |
| `REQUIRE_VERIFIED_EMAIL` | API | Set to `1` to gate wallet top-ups + organizer creation on email verification. Off by default during rollouts. |

---

## 3. Database — migrations + seeding

Migrations are tracked under `packages/db/prisma/migrations/`.

```sh
# Generate the typed Prisma Client (every fresh checkout)
pnpm db:generate

# Apply migrations to the configured DATABASE_URL (idempotent)
pnpm --filter @computicket/db exec prisma migrate deploy

# Seed demo organizer + 2 events + 3 fixture users (buyer / manager / admin)
pnpm db:seed
```

The **CI workflow** (`/.github/workflows/ci.yml`) runs all three on every
push so you can use it as the source of truth for the production setup.

**Latest migration of note (this PR):** `20260521120000_social_auth_and_magic_link`
adds two tables — `SocialAccount` (for Google/Apple links) and
`MagicLink` (passwordless tokens, sha256-hashed at rest). Apply it
before deploying the API build with social/magic-link support.

---

## 4. Web deploy — Vercel

The full Vercel walkthrough lives in [DEPLOY-WEB.md](./DEPLOY-WEB.md).
Headlines:

- **Root directory:** `apps/web` (set in Vercel project settings).
- **Build/install/output:** governed by `apps/web/vercel.json`.
- **Framework preset:** Next.js, auto-detected.
- **Env vars to set on Vercel:** every `NEXT_PUBLIC_*` plus
  `NODE_ENV=production`. The non-public env vars belong to the API
  deploy, not Vercel.
- **Branches:** every push to `main` deploys to production; PR branches
  get Preview URLs automatically.

---

## 5. Social login setup (Google + Apple)

### 5.1 Google

1. **Google Cloud Console** → **APIs & Services** → **OAuth consent
   screen**. App type: External. Add `computicket.ng` as the
   authorised domain.
2. **Credentials** → **Create credentials** → **OAuth client ID** →
   *Web application*.
3. Add **Authorized JavaScript origins**:
   - `https://computicket.ng`
   - `https://www.computicket.ng`
   - (`http://localhost:3000` for local dev)
4. Add **Authorized redirect URIs** — **not strictly required** for our
   flow (we use Google Identity Services in implicit mode, ID token in
   the callback). Add the production origins anyway for safety.
5. Copy the **Web Client ID** into both env vars:
   ```
   GOOGLE_OAUTH_CLIENT_ID=…
   NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=…
   ```
6. Redeploy. The "Continue with Google" button appears on `/signin` and
   `/signup`; the backend verifies ID tokens via `google-auth-library`
   on `POST /v1/auth/google`.

### 5.2 Apple

1. **Apple Developer Program** ($99/yr) account required.
2. **Identifiers** → **App IDs** — create an App ID with **Sign In with
   Apple** enabled (or enable on an existing one).
3. **Identifiers** → **Services IDs** → **+** — create a Service ID
   (e.g. `ng.computicket.signin`). Enable Sign In with Apple, click
   **Configure**:
   - **Primary App ID:** the App ID from step 2.
   - **Domains and Subdomains:** `computicket.ng`, `www.computicket.ng`.
   - **Return URLs:** `https://computicket.ng/signin`
     (must match `NEXT_PUBLIC_APPLE_REDIRECT_URI` **exactly**).
4. Set env vars:
   ```
   APPLE_OAUTH_CLIENT_ID=ng.computicket.signin
   NEXT_PUBLIC_APPLE_OAUTH_CLIENT_ID=ng.computicket.signin
   NEXT_PUBLIC_APPLE_REDIRECT_URI=https://computicket.ng/signin
   ```
5. Redeploy. The "Continue with Apple" button appears; the backend
   verifies the ID token against Apple's JWK set (`appleid.apple.com/auth/keys`)
   with RSA-SHA256, with a 1-hour key cache.

**"Hide my email" behaviour.** Apple users can choose to hide their
email. The backend synthesises a stable `apple_<sha>@ctng-private`
address so the unique constraint holds; the user can replace it from
`/account` later.

### 5.3 Magic link (passwordless email)

No third-party setup. Tokens are minted server-side, sha256-hashed at
rest, single-use, 15-minute TTL. Requires only `WEB_APP_URL` (so the
emailed link points at the right host) and Postmark configured (so the
email actually sends).

`POST /v1/auth/magic-link/request` is rate-limited to **3 per minute
per IP**, and the response is identical for known vs unknown emails to
avoid user enumeration.

---

## 6. Sign-in surfaces — endpoint map

| Path | Body | Auth | Notes |
|---|---|---|---|
| `POST /v1/auth/signup` | `{email,password,name?,phone?,referralCode?}` | None | Returns `{token,user}`. |
| `POST /v1/auth/signin` | `{email,password,totpCode?}` | None | May return `{requires2FA:true, challengeToken}`. |
| `POST /v1/auth/signin/2fa` | `{challengeToken,totpCode}` | None | Returns `{token,user}`. |
| `POST /v1/auth/google` | `{idToken}` | None | Google ID token from GIS. |
| `POST /v1/auth/apple` | `{idToken,name?}` | None | Apple ID token from AppleID JS. |
| `POST /v1/auth/magic-link/request` | `{email}` | None | Always `{sent:true}`. |
| `POST /v1/auth/magic-link/confirm` | `{token}` | None | Single-use, 15-min TTL. |
| `GET  /v1/auth/me` | — | Bearer | Current user incl. memberships. |
| `GET  /v1/auth/sessions` | — | Bearer | Active sessions list. |
| `DELETE /v1/auth/sessions/:id` | — | Bearer | Revoke one. |
| `DELETE /v1/auth/sessions` | — | Bearer | Revoke all. |
| `POST /v1/auth/password-reset/request` | `{email}` | None | Anti-enumeration. |
| `POST /v1/auth/password-reset/confirm` | `{token,newPassword}` | None | Single-use. |
| `GET  /v1/auth/verify-email/confirm?token=…` | — | None | One-shot. |

All sessions are JWT bearers with a `jti` matching a row in the
`Session` table — looking up by `jti` on every authed request is what
makes server-side revoke effective without waiting for token expiry.

---

## 7. Webhooks

| Provider | URL | Notes |
|---|---|---|
| Paystack | `POST /v1/webhooks/paystack` | HMAC-SHA512 verified against `PAYSTACK_SECRET_KEY`. Idempotent on `paystackRef`. |
| HotelBeds (push) | not used today — we poll | n/a |
| Outbound (organizer-bound) | configured per-endpoint | HMAC-SHA256 signed. Retries 6 times over 24 h with exponential backoff. Console + manual replay in the organizer dashboard. |

---

## 8. Day-2 ops

### Health probes

`GET /v1/health` returns `{status: 'ok'}` after a 1-row Postgres ping
and a Redis PING. Use as both readiness + liveness probes in K8s:

```yaml
livenessProbe:  { httpGet: { path: /v1/health, port: 4000 }, periodSeconds: 30 }
readinessProbe: { httpGet: { path: /v1/health, port: 4000 }, periodSeconds: 5, failureThreshold: 3 }
```

### Cron jobs (all in-process, `@nestjs/schedule`)

| Job | Cadence | What it does |
|---|---|---|
| Order expiry | every 60 s | Releases held inventory from PENDING orders > 15 min old. |
| Webhook retry | every 60 s | Re-attempts failed outbound webhooks with exponential backoff. |
| Wallet expiry warning | daily 09:00 WAT | Emails users whose wallet balance hits 18-month inactivity (24-month expiry). |
| Session pruning | daily 03:00 WAT | Hard-deletes revoked/expired sessions older than 30 days. |
| Magic-link cleanup | hourly | Deletes consumed/expired `MagicLink` rows older than 7 days. |

All jobs are race-safe — running multiple API replicas is fine.

### Observability

- **Errors** → Sentry (when `SENTRY_DSN` set). The global exception
  filter strips PII before send.
- **Audit log** at `/v1/admin/audit-log` — every refund, role change,
  KYC decision, payout-bank update.
- **Webhook delivery log** in each organizer dashboard.

### Rollback

API is a single-container deploy. Roll back by pinning to the previous
image tag — schema migrations are forward-only, so make sure the
previous build is compatible with the current DB schema (we never drop
columns in the same migration that introduces them; backfill, deploy,
remove in a follow-up).

---

## 9. Domains + TLS

| Host | Cert | DNS |
|---|---|---|
| `computicket.ng` | Vercel auto-managed (Let's Encrypt) | A → Vercel anycast |
| `www.computicket.ng` | Vercel auto-managed | CNAME → `cname.vercel-dns.com` |
| `api.computicket.ng` | ACM (us-east-1 for CloudFront / af-south-1 for direct EKS) | A/ALIAS → ALB or CloudFront |
| `*.computicket.ng` (white-label) | ACM wildcard | A → Vercel anycast (subdomain routing handled in `middleware.ts`) |

Custom organizer domains (`promoter.com`) terminate at Vercel via the
**Custom Domain** flow; we issue them on demand from the organizer
dashboard.

---

## 10. Pre-launch checklist

Before flipping production traffic to a fresh region:

- [ ] `DATABASE_URL` points at a managed Postgres ≥ 14 with daily
      backups + PITR enabled.
- [ ] `REDIS_URL` points at a Redis 7 instance with at least 1 GB RAM
      and persistence enabled (or rely on the rate-limit ephemerality
      being acceptable).
- [ ] `JWT_SECRET` and `APP_KEY` are independent 64-char randoms,
      committed to your secret manager.
- [ ] Postmark sender domain (`computicket.ng`) verified with SPF +
      DKIM. Otherwise transactional mail goes to spam.
- [ ] Paystack live keys set; webhook URL added in their dashboard.
- [ ] Google Web Client ID configured with the prod origins
      (§5.1).
- [ ] Apple Service ID + Return URL configured (§5.2).
- [ ] `WEB_APP_URL=https://computicket.ng` (so magic links work).
- [ ] CI green on `main`; `pnpm --filter @computicket/db exec prisma
      migrate deploy` applied.
- [ ] Sentry DSN set; first 500 error verified to reach the project.
- [ ] WAF / rate limits in front of the API at the edge (the NestJS
      throttler is the second line, not the first).
- [ ] First end-to-end test against prod: signup → buy a ₦100 test
      ticket → refund.

---

## 11. Contacts

- **Platform on-call:** `oncall@computicket.ng` (rotates weekly, see
  PagerDuty schedule "Computicket Platform").
- **Security / trust escalation:** `trust@computicket.ng`, 24/7 hotline
  documented internally.
- **Paystack account manager:** logged in 1Password under
  `paystack-account-manager`.
- **Vercel team admin:** the same person rotating Vercel + Cloudflare
  tokens (rotation schedule in `/docs/PENTEST.md`).
