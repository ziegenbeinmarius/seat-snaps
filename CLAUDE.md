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
