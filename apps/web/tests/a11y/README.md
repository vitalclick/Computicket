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

| Route | Why it's in the smoke set |
|---|---|
| `/` | First impression — hero, nav, footer |
| `/events` | Search interaction (combobox, listbox semantics) |
| `/events/[slug]` | Event detail with structured-data + buy form |
| `/for-organizers` | Marketing surface; the most "designed" page |
| `/signin` | Form with optional 2FA challenge branch |
| `/signup` | Form with autofill hints |
| `/forgot-password` | Trivial form — sanity check |

Authenticated pages (`/account`, `/dashboard`, `/admin`, `/me/...`)
aren't in the smoke set yet because they need a real session.
Targeted follow-up: stand up a Playwright fixture that signs a buyer
in via the API and adds `/account/security` + `/dashboard` to the
sweep.
