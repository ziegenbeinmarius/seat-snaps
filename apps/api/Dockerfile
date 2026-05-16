FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/

RUN npm ci --workspace=@seat-snaps/api --workspace=@seat-snaps/shared --workspace=@seat-snaps/db

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=@seat-snaps/api

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=3001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/db ./packages/db

USER nestjs
WORKDIR /app/apps/api

EXPOSE 3001

# Run pending migrations then start the server
CMD ["sh", "-c", "node ../../node_modules/.bin/drizzle-kit migrate --config=../../packages/db/drizzle.config.ts 2>/dev/null; node dist/main"]
