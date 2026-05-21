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

### 4. Connect the custom domain

Vercel dashboard → Domains → Add Domain → `computicket.ng` (and `www`).

For Route 53 (the Terraform module manages your zone):
- Apex `computicket.ng` → A/ALIAS record pointing to `76.76.21.21`
  (Vercel's anycast IP)
- `www.computicket.ng` → CNAME to `cname.vercel-dns.com`

Vercel issues + renews the TLS cert automatically via Let's Encrypt.

## Day-to-day deploys

Vercel's native git integration handles every deploy:

- Push to any branch → **Preview deployment** with its own URL,
  commented onto the PR if there is one.
- Push to `main` → **Production deployment** to `computicket.ng`.

No CI gate is enforced on top of this — a red `ci.yml` build will not
block a deploy from going out. The expected workflow is to merge to
`main` only after CI is green on the PR. If you outgrow that and want
hard CI-gated production, restore `.github/workflows/deploy-web.yml`
from git history (commit `360c4eb` is a known-good copy) and add the
three Vercel secrets it documents.

## What CI covers (independently of the deploy)

`.github/workflows/ci.yml` runs on every push and PR. It doesn't
deploy — it just gates merges to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm typecheck`
4. `pnpm build`
5. `pnpm test:e2e` (Jest, against a real Postgres)
6. `pnpm --filter @computicket/web run test:a11y` (axe-core via Playwright)
7. `pnpm --filter @computicket/web run test:functional` (Playwright happy paths)

Enable "Require status checks to pass before merging" in GitHub branch
protection on `main` so a red CI run blocks the merge that would
trigger a production deploy.

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
