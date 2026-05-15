# Database Package — Drizzle ORM

## Purpose

PostgreSQL database layer using Drizzle ORM. Provides schema definitions, migrations, DB client factory, and seed script. Consumed by `apps/api` via `@seat-snaps/db`.

## Key Files

- `src/index.ts` — Exports `createDb(databaseUrl)` factory and `Database` type
- `src/schema.ts` — Re-exports all schemas (legacy entry point)
- `src/schema/` — One file per table group, re-exported from `src/schema/index.ts`
- `src/seed.ts` — Seed script (`npm run db:seed`, requires `DATABASE_URL`)
- `drizzle.config.ts` — Drizzle Kit config (reads `DATABASE_URL`, schema glob `./src/schema/*.ts`)
- `drizzle/` — Generated migration SQL files (committed to repo)
- `drizzle/meta/` — Migration metadata

## Schema Files

| File | Tables |
|---|---|
| `users.ts` | `users` |
| `events.ts` | `events` |
| `event-memberships.ts` | `event_memberships` |
| `organizer-invites.ts` | `organizer_invites` |
| `attendees.ts` | `attendees` |
| `tables.ts` | `tables` |
| `seats.ts` | `seats` |
| `attendee-sessions.ts` | `attendee_sessions` |
| `photos.ts` | `photos` |
| `broadcasts.ts` | `broadcasts` |
| `event-themes.ts` | `event_themes` |
| `schedule-items.ts` | `schedule_items` |
| `relations.ts` | Drizzle relation definitions |

## Patterns

- One file per table group in `src/schema/`, re-exported from `index.ts`
- Drizzle-kit scripts use `tsx` to resolve ESM `.js` imports
- `events` is the root entity; child tables cascade-delete on event removal
- `seats.attendeeId` is the source of truth for seat assignment; `attendees.tableId/seatId` are denormalized

## How to Add a New Table

1. Create `src/schema/<name>.ts` with Drizzle table definition
2. Export from `src/schema/index.ts`
3. Add relations in `src/schema/relations.ts` if needed
4. Run `npm run db:generate` to create migration
5. Run `npm run db:migrate` to apply

## Commands

```bash
npm run db:generate   # Generate migration from schema diff
npm run db:migrate    # Apply pending migrations
npm run db:push       # Push schema directly (dev only)
npm run db:studio     # Visual DB browser
npm run db:seed       # Seed data (from packages/db dir)
```
