# Accessibility smoke suite

Playwright drives Chromium against the built web app and runs
`@axe-core/playwright` on each route. Fails the build on **serious**
or **critical** WCAG 2.0/2.1 A + AA violations; moderate/minor are
surfaced in the report but don't gate.

## Run locally

```sh
# 1. Start the API in another terminal.
pnpm --filter @computicket/api run build
DATABASE_URL=postgresql://computicket:computicket@localhost:5432/computicket?schema=public \
PAYSTACK_SECRET_KEY=sk_test_replace_me JWT_SECRET=test APP_KEY=test \
node apps/api/dist/main.js

# 2. Seed the DB so /events has data (one-time per fresh DB).
pnpm db:seed

# 3. Build + run the a11y suite. Playwright starts `next start` on 3100.
pnpm --filter @computicket/web run build
pnpm --filter @computicket/web exec playwright install --with-deps chromium
pnpm --filter @computicket/web run test:a11y
```

The HTML report opens automatically on failure
(`apps/web/playwright-report/index.html`).

## Triaging a violation

Open the report, click into the failing test, expand the violation —
axe links each finding to its WCAG rule, lists the offending DOM
nodes, and explains how to fix it. Three common buckets:

- **Real fix**: bad markup. Patch the component.
- **Design tweak**: e.g. `color-contrast` on the brand accent that
  legitimately fails AA. Either bump the colour or accept it as a
  documented exception (and consider whether it should be a blocker
  in a different override).
- **False positive**: axe occasionally flags things that are actually
  fine in context (e.g. an SVG with a sibling `aria-label`). Mark
  with `AxeBuilder.exclude()` in the test, with a comment explaining
  why.

## What's covered

| Spec | Route | Auth |
|---|---|---|
| `smoke.spec.ts` | `/` | — |
| | `/events` | — |
| | `/events/davido-timeless-tour-lagos` | — |
| | `/for-organizers` | — |
| | `/signin` | — |
| | `/signup` | — |
| | `/forgot-password` | — |
| `authed.spec.ts` | `/account` | buyer |
| | `/account/security` | buyer |
| | `/account/wallet` | buyer |
| | `/support` | buyer |
| | `/dashboard` | manager |
| | `/dashboard/o/livenation-ng` | manager |
| | `/admin` | admin |
| | `/admin/audit-log` | admin |

## Fixtures

`fixtures.ts` extends Playwright's base `test` with three authed
pages: `buyerPage`, `managerPage`, `adminPage`. Each one signs in
via the API (POST `/v1/auth/signin`) and injects the JWT into
`localStorage` under `ctng_token` (the same key
`apps/web/src/lib/auth.ts` reads from) via `page.addInitScript`
**before** navigation, so the first paint of `/account/*` is the
real authed view rather than the redirect to `/signin`.

The authed path needs the seeded fixture users — `pnpm db:seed`
creates them idempotently:

| Email | Password | Role |
|---|---|---|
| `buyer@example.com` | `Password123!` | plain buyer |
| `manager@livenation.ng` | `Password123!` | `OrganizerMember(MANAGER)` on `livenation-ng` |
| `admin@computicket.ng` | `AdminPass123!` | platform admin |

The fixture refuses to proceed if any of those accounts has 2FA
enabled (the API would return a challenge token instead of a real
session token). If you ever enable 2FA on the seeded admin for
defence-in-depth, swap the fixture to use a non-2FA test account
specifically for the suite.
