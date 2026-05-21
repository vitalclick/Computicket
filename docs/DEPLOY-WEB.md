# Deploying the web app to Vercel

The Next.js 15 web app at `apps/web/` ships to Vercel. The API + DB
live separately on the EKS cluster the Terraform module provisions
(see `infra/terraform/README.md`).

## One-time setup

### 1. Create the Vercel project

```sh
npm install -g vercel
# Run from the REPO ROOT (vercel.json lives there, telling Vercel
# the Next.js app is at apps/web).
vercel login
vercel link
```

When prompted:
- **Set up and deploy?** Yes
- **Which scope?** Your team / personal scope
- **Link to existing project?** No (or yes if you already created it)
- **Project name?** `computicket-web`
- **In which directory is your code?** `./` (repo root — vercel.json
  handles the monorepo routing)

`vercel link` writes `.vercel/project.json` locally — **don't commit
it**, it's already ignored. The pair of IDs in it (`projectId`,
`orgId`) go into GitHub secrets in step 4.

### 2. Vercel project settings

The repo's `vercel.json` carries every build setting — there's
nothing to configure in the dashboard. Specifically:

- **Root Directory**: leave at `/` (default). The `outputDirectory`
  in vercel.json (`apps/web/.next`) tells Vercel where the build
  artifact lands.
- **Framework Preset**: auto-detected as Next.js (or set explicitly
  if you want).
- **Build / Install / Output**: don't override — let vercel.json win.

### 3. Environment variables

Set per-environment in the dashboard (Settings → Environment Variables):

| Variable | Production | Preview |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.computicket.ng/v1` | `https://api.staging.computicket.ng/v1` |
| `NEXT_PUBLIC_SITE_URL` | `https://computicket.ng` | `https://staging.computicket.ng` |

`NEXT_PUBLIC_*` values get baked into the client bundle at build time, so
each environment needs them set before the first deploy.

### 4. GitHub secrets

For the CI-gated deploy in `.github/workflows/deploy-web.yml`, add
three secrets in the GitHub repo settings → Secrets and variables → Actions:

| Secret | Where to find it |
|---|---|
| `VERCEL_TOKEN` | `vercel.com/account/tokens` → Create |
| `VERCEL_ORG_ID` | `.vercel/project.json` (from step 1) → `"orgId"` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `"projectId"` |

### 5. Connect the custom domain

Vercel dashboard → Domains → Add Domain → `computicket.ng` (and `www`).

For Route 53 (the Terraform module manages your zone):
- Apex `computicket.ng` → A/ALIAS record pointing to `76.76.21.21`
  (Vercel's anycast IP)
- `www.computicket.ng` → CNAME to `cname.vercel-dns.com`

Vercel issues + renews the TLS cert automatically via Let's Encrypt.

## Day-to-day deploys

Two flows running side-by-side:

- **Vercel's native git integration**: every push to a branch creates
  a Preview deployment with its own URL. Push to `main` creates a
  Production deployment. No CI gate — Vercel deploys whatever the
  branch builds.
- **GitHub Actions** (`deploy-web.yml`): runs on push to `main`,
  waits for the `build` job in `ci.yml` to pass first, then deploys
  via `vercel deploy --prebuilt`. This is the *gated* path —
  production deploys never go out if typecheck / e2e / a11y /
  functional tests are red.

Turn off Vercel's native production deploys for `main` in the
dashboard if you want the GitHub Action to be the only path to
production:

> Settings → Git → Production Branch → set to a non-existent branch
> like `_disabled-vercel-prod` so the GitHub Action is the sole
> deployer. Preview deploys on other branches still work.

## What the CI gate covers

The `wait-for-ci` job in `deploy-web.yml` polls the GitHub Checks API
for a job named `build` on the same SHA. That job — defined in
`ci.yml` — runs:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm typecheck`
4. `pnpm build`
5. `pnpm test:e2e` (Jest, against a real Postgres)
6. `pnpm --filter @computicket/web run test:a11y` (axe-core via Playwright)
7. `pnpm --filter @computicket/web run test:functional` (Playwright happy paths)

Only after all seven pass does the deploy job fire.

## Rollbacks

Vercel keeps every deployment forever. To roll back: dashboard →
Deployments → find the last-known-good one → "Promote to Production".
Or via CLI:

```sh
vercel rollback <deployment-url> --token=$VERCEL_TOKEN
```

Rollback is instant — Vercel's edge router just flips traffic to the
older immutable build.

## Cost expectations

Free Hobby tier covers most pre-launch work. The first real cost
inflection points are:

- **Bandwidth**: 100 GB/mo free, then $0.40/GB. Lagos PoP keeps
  egress reasonable for the Nigerian audience.
- **Build minutes**: 6000 min/mo free. Each web build is ~2 min.
- **Functions execution**: 100 GB-hours/mo free. We're mostly SSR
  so this matters when traffic grows.

Pro tier ($20/seat/mo) lifts the bandwidth + function quotas and adds
team features (analytics, audit logs, password-protected previews).
