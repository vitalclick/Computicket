# syntax=docker/dockerfile:1.7
# ---- Stage 1: deps ----
FROM node:22-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Workspace metadata first so Docker can cache the dep layer when only
# source files change.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @computicket/api... --filter @computicket/db...

# ---- Stage 2: build ----
FROM deps AS build
WORKDIR /repo
COPY packages/db packages/db
COPY apps/api apps/api
RUN pnpm --filter @computicket/db run generate
RUN pnpm --filter @computicket/api run build

# Prune to production-only deps for the runtime stage.
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm --filter @computicket/api deploy --prod --legacy /out

# ---- Stage 3: runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S -G app app
WORKDIR /app

# `pnpm deploy` produces a self-contained directory: dependencies +
# the package's own files (built dist/) — no monorepo siblings.
COPY --from=build --chown=app:app /out ./
# Bring across the generated Prisma client + engine binaries from the
# workspace dep, then the migrations so we can apply them at deploy.
COPY --from=build --chown=app:app /repo/packages/db/dist ./node_modules/@computicket/db/dist
COPY --from=build --chown=app:app /repo/node_modules/.pnpm/@prisma+client*/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=app:app /repo/packages/db/prisma ./prisma

USER app
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/v1/health || exit 1

CMD ["node", "dist/main.js"]
