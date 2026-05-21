# syntax=docker/dockerfile:1.7
# ---- Stage 1: deps ----
FROM node:22-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @computicket/web...

# ---- Stage 2: build ----
FROM deps AS build
WORKDIR /repo/apps/web
COPY apps/web .
# Build-time env: API_URL gets baked into the static bundle. Override
# in the build pipeline for staging/prod.
ARG NEXT_PUBLIC_API_URL=https://api.computicket.ng/v1
ARG NEXT_PUBLIC_SITE_URL=https://computicket.ng
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN cd /repo && pnpm --filter @computicket/web run build

# ---- Stage 3: runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S -G app app
WORKDIR /app

# Next.js standalone output: server.js + minimal node_modules subset.
# Public assets and the .next/static bucket need to be copied
# explicitly — they're not part of the standalone tree.
COPY --from=build --chown=app:app /repo/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=app:app /repo/apps/web/public ./apps/web/public

USER app
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ -O /dev/null || exit 1

CMD ["node", "apps/web/server.js"]
