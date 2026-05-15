# Backend — NestJS API

## Purpose

NestJS 10 REST API (Fastify adapter) serving organizer and attendee endpoints. Global prefix `/api`. All routes are JWT-protected by default; use `@Public()` to opt out.

## Key Files

- `src/main.ts` — Bootstrap, CORS, global ValidationPipe, `@fastify/cookie` registration, port config
- `src/app.module.ts` — Root module; imports all feature modules
- `src/database/database.module.ts` — Global module; provides all `*_REPOSITORY` tokens via Drizzle implementations
- `src/domain/repositories/` — Repository interfaces with injection token symbols
- `src/infrastructure/repositories/` — Drizzle implementations of all repository interfaces

## Feature Modules

Each module in `src/<name>/` has its own `agent.md` with specifics. Current modules:

| Module | Path | Purpose |
|---|---|---|
| auth | `src/auth/` | Registration, credential validation, JWT/roles guards |
| events | `src/events/` | CRUD for events, public event info |
| event-memberships | `src/event-memberships/` | List/remove event members |
| organizer-invites | `src/organizer-invites/` | Create/accept organizer invite links |
| attendees | `src/attendees/` | Attendee CRUD, CSV import, public list |
| tables | `src/tables/` | Table CRUD with auto-generated seats, public view |
| seats | `src/seats/` | Seat assignment/unassignment |
| qr | `src/qr/` | QR code generation (single, bulk HTML, event) |
| schedule-items | `src/schedule-items/` | Event schedule CRUD |
| attendee-sessions | `src/attendee-sessions/` | Attendee device sessions (QR/manual join) |
| health | `src/health/` | `GET /api/health` for Railway health checks |

## Patterns & Conventions

- **Module structure**: `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `domain/I<Name>Service.ts`, `dto/*.dto.ts`
- **Clean architecture**: Controller → Service (via interface + DI token) → Repository (via interface + DI token)
- **Guards** (global via `APP_GUARD`): `JwtAuthGuard` (skip with `@Public()`), `RolesGuard` (enforce with `@Roles(...)`)
- **Decorators**: `@CurrentUser()` extracts JWT user, `@CurrentAttendee()` extracts attendee session
- **Validation**: `ValidationPipe` with whitelist + transform + forbidNonWhitelisted
- **Event membership check**: Services query `event_memberships` to verify access; ownership != JWT role

## How to Add a New Module

1. Create `src/<name>/` with `module.ts`, `controller.ts`, `service.ts`
2. Define `domain/I<Name>Service.ts` with interface + injection token symbol
3. Create DTOs in `dto/` using class-validator decorators
4. Add repository interface in `src/domain/repositories/I<Name>Repository.ts`
5. Add Drizzle implementation in `src/infrastructure/repositories/Drizzle<Name>Repository.ts`
6. Register repository provider in `src/database/database.module.ts`
7. Import module in `src/app.module.ts`
8. Add Zod schemas to `packages/shared`
9. Create `agent.md` in the new module directory
