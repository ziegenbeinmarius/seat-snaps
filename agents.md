# SeatSnaps — Agent Handoff Guide

## Overview

SeatSnaps is a generic event companion app. Organizers create events with seating plans, manage attendees, and generate QR codes. Attendees scan QR codes to join, view schedules, browse the guest directory, and find their seat.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Language | TypeScript 5.x, Node 20+ |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4, shadcn/ui |
| Backend | NestJS 10 (Fastify adapter) |
| Database | PostgreSQL, Drizzle ORM |
| Shared | Zod schemas, DTOs |
| Linting | ESLint (flat config), Prettier |
| Deployment | Railway (Docker-based) |

## Project Structure

```
seat-snaps/
├── apps/
│   ├── web/           # Next.js 15 frontend (port 3005)
│   └── api/           # NestJS 10 backend (port 3001)
├── packages/
│   ├── shared/        # Zod schemas, DTOs, shared types
│   └── db/            # Drizzle ORM, schema, migrations
├── turbo.json         # Turborepo pipeline
├── package.json       # Root workspace config
├── tsconfig.json      # Base TS config
├── eslint.config.js   # Shared ESLint
└── .prettierrc        # Shared Prettier
```

## Context Files

Detailed docs live in each subfolder — read only the ones relevant to your task:

- `apps/web/agent.md` — Frontend: routes, components, API hooks, auth, PWA
- `apps/api/agent.md` — Backend: modules, guards, service patterns, adding features
- `packages/db/agent.md` — Database: schema, migrations, seed
- `packages/shared/agent.md` — Shared types, Zod schemas

Each subfolder also has a `CLAUDE.md` mirror (auto-loaded by Claude Code).
API modules have individual `agent.md` files in `apps/api/src/<module>/`.

## Architecture Principles

- **Clean Architecture**: presentation → application → domain → infrastructure
- **SOLID + Interface-Driven**: every service and repository has an interface; implementations are injected
- **Separation of Concerns**: web = presentation, api = business logic, db = data access, shared = pure types

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | HS256 signing secret (shared by web + api, min 32 chars) |
| `AUTH_URL` | Next.js base URL (production) |
| `INTERNAL_API_URL` | NestJS URL for server-side calls (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_API_URL` | API URL for client-side calls |
| `API_PORT` | NestJS port (default: 3001) |
| `APP_URL` | Public app URL for QR code generation |
| `STORAGE_*` | S3-compatible storage (bucket, region, keys, endpoint) |

## Dev Commands

```bash
npm run dev           # Start all apps in watch mode
npm run build         # Build all
npm run lint          # Lint all
npm run format        # Prettier all
npm run db:generate   # Generate Drizzle migration from schema changes
npm run db:migrate    # Apply pending migrations
npm run db:push       # Push schema directly (dev only)
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Seed database (from packages/db)
```

## Agent DB Migration Policy

- Agents must never hand-write SQL files in `packages/db/drizzle/`.
- For DB changes, agents should only update Drizzle schema files in `packages/db/src/schema/` and then run `npm run db:generate`.
- Applying migrations (`npm run db:migrate`) is a manual step owned by a human unless explicitly requested in the prompt.
- If migration drift is detected, agents should stop and report it instead of rewriting existing applied migrations.

## Event Theme System

### Architecture

- **Schema**: `packages/db/src/schema/event-themes.ts` — `event_themes` table (1:1 with events, `eventId` UNIQUE)
- **Repository interface**: `apps/api/src/domain/repositories/IEventThemeRepository.ts` — `findByEventId`, `upsert`
- **Drizzle implementation**: `apps/api/src/infrastructure/repositories/DrizzleEventThemeRepository.ts`
- **Service interface**: `apps/api/src/themes/domain/IThemeService.ts` (`THEME_SERVICE` symbol)
- **Service**: `apps/api/src/themes/themes.service.ts` — `getTheme`, `updateTheme` (with preset expansion)
- **Controller**: `apps/api/src/themes/themes.controller.ts` — `GET /events/:id/theme` (public), `PUT /events/:id/theme` (organizer)
- **Module**: `apps/api/src/themes/themes.module.ts`
- **Shared types**: `packages/shared/src/schemas/theme.schema.ts` — `ThemeResponse`, `UpdateThemeInput`, `ThemePreset`

### Preset System

Four built-in presets expand to `primaryColor`/`secondaryColor` pairs:

| Preset | Primary | Secondary |
|---|---|---|
| `wedding` | `#d4a0a0` | `#f5e6e0` |
| `birthday` | `#f59e0b` | `#fef3c7` |
| `corporate` | `#1e40af` | `#eff6ff` |
| `default` | `#3b82f6` | `#eff6ff` |

Sending `{ preset: "wedding" }` in the PUT body sets the colors; explicit `primaryColor`/`secondaryColor` in the same request override the preset values.

### CSS Variable Injection

The attendee layout (`apps/web/src/app/event/[eventId]/layout.tsx`) fetches the theme server-side and injects CSS custom properties on the root `<div>`:

- `--event-primary` — primary color hex
- `--event-secondary` — secondary color hex
- `--event-background-url` — `url(...)` value for background image

### Theme Editor (Organizer)

Route: `/dashboard/events/[id]/theme`
Client component: `apps/web/src/app/dashboard/events/[id]/theme/theme-editor.tsx`
API hook: `apps/web/src/lib/api/themes.ts` — `useEventTheme(eventId)`, `useUpdateTheme(eventId)`

---

## Deployment (Railway)

### Services

Deploy as two separate Railway services from the monorepo root:

| Service | Dockerfile | Port | Health check |
|---|---|---|---|
| API | `apps/api/Dockerfile` | 3001 | `GET /api/health` |
| Web | `apps/web/Dockerfile` | 3005 | `GET /` |

Each app has a `railway.toml` file configuring the build and deploy settings.

### Docker Builds

Both Dockerfiles use multi-stage builds (deps → builder → runner) and run from the monorepo root as the build context so they can copy the workspace `package.json`, `turbo.json`, and shared packages.

The API image runs `drizzle-kit migrate` before starting the server so migrations always apply on deploy.

The web image requires `output: "standalone"` in `next.config.ts` (already set).

### Environment Variables for Railway

**API service:**

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Railway PostgreSQL — use the Railway-provided connection string |
| `AUTH_SECRET` | Same secret as web — min 32 chars |
| `APP_URL` | Public URL of the web service |
| `STORAGE_BUCKET_NAME` | Railway Buckets or S3-compatible |
| `STORAGE_REGION` | e.g. `us-east-1` |
| `STORAGE_ACCESS_KEY_ID` | Storage access key |
| `STORAGE_SECRET_ACCESS_KEY` | Storage secret |
| `STORAGE_ENDPOINT` | e.g. Railway Buckets endpoint |

**Web service:**

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Same PostgreSQL URL (used for Auth.js adapter if needed) |
| `AUTH_SECRET` | Same secret as API |
| `AUTH_URL` | Public URL of the web service (e.g. `https://web.railway.app`) |
| `INTERNAL_API_URL` | Private Railway URL of the API service (`http://api.railway.internal:3001`) |
| `NEXT_PUBLIC_API_URL` | Public URL of the API service |

### Migration Strategy

The API Docker CMD runs `drizzle-kit migrate` before starting. To add a new migration:

1. Edit `packages/db/src/schema/`
2. Run `npm run db:generate` locally
3. Commit the generated SQL in `packages/db/drizzle/`
4. Deploy — the API container will apply the migration on startup

---

## Error Handling

### Frontend

- **Error boundaries**: `apps/web/src/app/dashboard/error.tsx` and `apps/web/src/app/event/error.tsx` — catch render errors per route segment with a retry button
- **Toast notifications**: Sonner (`import { toast } from "sonner"`) — use `toast.success()` / `toast.error()` in mutation callbacks; `<Toaster>` is mounted in the root layout
- **404 page**: `apps/web/src/app/not-found.tsx` — triggered by `notFound()` in server components
- **Invalid QR**: `apps/web/src/app/join/invalid/page.tsx` — redirect here for expired/invalid tokens

### Backend

- `NotFoundException` → 404
- `ForbiddenException` → 403
- `BadRequestException` → 400
- `UnauthorizedException` → 401 (thrown by JWT guard)
- All thrown from service layer; controller stays thin
