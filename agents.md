# SeatSnaps — Agent Handoff Guide

## Project Overview

**SeatSnaps** is a generic event companion app that lets users capture, annotate, and share their experience at live events (concerts, sports, theatre, etc.). Users can snap photos from their seat, add event context (artist, venue, row/seat), and browse a social feed.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Language | TypeScript 5.x, Node 20+ |
| Frontend | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Backend | NestJS 10 (Fastify adapter) |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL |
| Shared types | Zod schemas |
| Linting | ESLint (flat config), Prettier |
| Deployment | Railway (Docker-based) |

## Monorepo Structure

```
seat-snaps/
├── apps/
│   ├── web/          # Next.js 15 frontend (port 3000)
│   └── api/          # NestJS 10 backend (port 3001)
├── packages/
│   ├── shared/       # Zod schemas, DTOs, shared TypeScript types
│   └── db/           # Drizzle ORM client, schema, migrations
├── turbo.json        # Turborepo pipeline config
├── package.json      # Root workspace config, shared dev dependencies
├── tsconfig.json     # Base TypeScript config (extended by all packages)
├── eslint.config.js  # Flat ESLint config (shared)
├── .prettierrc       # Prettier config (shared)
├── .env.example      # Required environment variables
└── agents.md         # This file
```

### `apps/web` — Next.js Frontend

- **Framework**: Next.js 15, App Router, React Server Components
- **Styling**: Tailwind CSS 4 (CSS-based config via `@import "tailwindcss"`)
- **Component library**: shadcn/ui (`components.json` at root of `apps/web`)
- **Utility**: `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge)
- **PWA**: `public/manifest.json` placeholder; icons live in `public/icons/`
- **Key directories**:
  - `src/app/` — Next.js App Router pages and layouts
  - `src/components/` — Shared UI components (add shadcn components here)
  - `src/lib/` — Utility functions
  - `src/hooks/` — Custom React hooks

### `apps/api` — NestJS Backend

- **Framework**: NestJS 10 with Fastify adapter (faster than Express)
- **Global prefix**: `/api` — all endpoints live under `/api/...`
- **Health endpoint**: `GET /api/health` — used by Railway health checks
- **Validation**: `ValidationPipe` (whitelist + transform + forbidNonWhitelisted)
- **Module structure**: feature modules under `src/` (e.g., `src/health/`)
- **Key files**:
  - `src/main.ts` — bootstrap, CORS, global pipes, port config
  - `src/app.module.ts` — root module, import feature modules here
  - `nest-cli.json` — NestJS CLI config

### `packages/shared` — Shared Code

- **Purpose**: Types, Zod schemas, and DTOs consumed by both `apps/web` and `apps/api`
- **Key exports**:
  - `PaginationQuerySchema`, `PaginatedResponse<T>` — standard pagination
  - `UuidSchema`, `TimestampSchema` — base schema primitives
  - `ApiErrorSchema`, `SuccessResponseSchema` — standard API response shapes
- **Pattern**: Add domain schemas here (e.g., `EventSchema`, `SnapSchema`) as features are built

### `packages/db` — Database Layer

- **ORM**: Drizzle ORM with `postgres` driver (postgres-js)
- **Schema file**: `src/schema.ts` — define all tables here
- **Config**: `drizzle.config.ts` — reads `DATABASE_URL` from env
- **Migration output**: `drizzle/` directory (git-ignored)
- **Factory**: `createDb(databaseUrl)` — call once at app startup in `apps/api`

## Architecture Principles

### Clean Architecture
- **Domain logic** lives in NestJS services, not controllers
- **Controllers** handle HTTP only — delegate to services
- **Repositories** (future) encapsulate DB access — services depend on interfaces, not Drizzle directly

### SOLID
- **Single Responsibility**: each module, service, and component has one job
- **Open/Closed**: extend behavior via new modules/providers, not modifying existing ones
- **Interface-Driven**: define interfaces for services before implementation

### Separation of Concerns
- `apps/web` — presentation only; fetch data via API calls to `apps/api`
- `apps/api` — business logic, validation, orchestration
- `packages/db` — data access only; no business logic
- `packages/shared` — pure types and schemas; no side effects

## Development Commands

```bash
npm run dev           # Start all apps (Next.js + NestJS) in watch mode
npm run build         # Build all apps
npm run lint          # Lint all workspaces
npm run format        # Format all files with Prettier

# Database (run from repo root)
npm run db:generate   # Generate Drizzle migration files from schema changes
npm run db:migrate    # Apply pending migrations to the database
npm run db:push       # Push schema directly (dev only — skips migrations)
npm run db:studio     # Open Drizzle Studio (visual DB browser)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret for signing JWTs / session tokens (min 32 chars) |
| `STORAGE_BUCKET_NAME` | Bucket name for image uploads |
| `STORAGE_REGION` | Storage region (e.g. `us-east-1`) |
| `STORAGE_ACCESS_KEY_ID` | Access key ID for your storage provider |
| `STORAGE_SECRET_ACCESS_KEY` | Secret access key for your storage provider |
| `STORAGE_ENDPOINT` | S3-compatible endpoint URL (Railway Buckets, AWS S3, Cloudflare R2, MinIO, etc.) |
| `NEXT_PUBLIC_API_URL` | API base URL consumed by the Next.js frontend |
| `API_PORT` | Port for the NestJS API (default: 3001) |

## Deployment (Railway)

- **`apps/web/Dockerfile`** — multi-stage build, Next.js standalone output, port 3000
- **`apps/api/Dockerfile`** — multi-stage build, NestJS compiled dist, port 3001
- Railway detects Dockerfiles automatically; configure `DATABASE_URL` and other env vars in Railway project settings
- Health check endpoint: `GET /api/health` (returns 200 when service is up)

## Adding a New Feature Module

1. Create `apps/api/src/<feature>/<feature>.module.ts`, `.controller.ts`, `.service.ts`
2. Import the module in `apps/api/src/app.module.ts`
3. Add any new Zod schemas to `packages/shared/src/schemas/`
4. Add database tables to `packages/db/src/schema.ts`
5. Run `npm run db:generate` to create the migration
