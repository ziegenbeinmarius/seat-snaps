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
│   ├── web/          # Next.js 15 frontend (port 3005)
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
- **Schema directory**: `src/schema/` — one file per table group, re-exported from `src/schema/index.ts`
- **Config**: `drizzle.config.ts` — reads `DATABASE_URL` from env; schema glob `./src/schema/*.ts`
- **Migration output**: `drizzle/` directory (committed; apply with `npm run db:migrate`)
- **Factory**: `createDb(databaseUrl)` — call once at app startup in `apps/api`
- **Seed**: `src/seed.ts` — run with `npm run db:seed` from `packages/db`; requires `DATABASE_URL`
- **Note**: Drizzle-kit scripts use `tsx` to resolve ESM `.js` imports — do not revert to bare `drizzle-kit` binary

#### Database Schema Overview

| Table | Purpose |
|---|---|
| `users` | Organizers and admin accounts (email, hashed password, avatar) |
| `events` | Top-level event records (title, date, type enum, JSONB settings) |
| `event_memberships` | Links users to events with roles (owner/organizer); composite unique on (userId, eventId) |
| `organizer_invites` | Email-based invite tokens for adding organizers; unique non-guessable token |
| `attendees` | Per-event guest records (QR token, group label, conversation starters as text[]) |
| `tables` | Seating tables within an event (label, capacity, XY position for floor-plan) |
| `seats` | Individual seats within a table; `attendeeId` FK tracks assignment |
| `attendee_sessions` | Device sessions for attendees (JWT-style token + fingerprint + expiry) |
| `photos` | Photo uploads per attendee (S3 key, thumbnail key, approval status enum) |
| `broadcasts` | Organizer messages targeting all / a table / a custom list |
| `event_themes` | One-to-one event branding (colors, logo, background, custom CSS) |

**Key relationships:**
- `events` is the root; all child tables cascade-delete on event removal
- `seats.attendeeId` → `attendees.id` (set null on attendee delete) — source of truth for seat assignment
- `attendees.tableId` / `attendees.seatId` are denormalized UUIDs (no FK) to avoid circular FK chains
- `event_themes` has a unique constraint on `eventId` (one theme per event)

**Indexes:** All child tables index `eventId`; `event_memberships` has composite unique index on `(userId, eventId)`; `attendees.qrToken` and `organizer_invites.token` are unique.

## Architecture Principles

### Clean Architecture
- **Domain logic** lives in NestJS services, not controllers
- **Controllers** handle HTTP only — delegate to services
- **Repositories** encapsulate DB access — services depend on interfaces, not Drizzle directly

### SOLID
- **Single Responsibility**: each module, service, and component has one job
- **Open/Closed**: extend behavior via new modules/providers, not modifying existing ones
- **Interface-Driven**: define interfaces for services before implementation

### Separation of Concerns
- `apps/web` — presentation only; fetch data via API calls to `apps/api`
- `apps/api` — business logic, validation, orchestration
- `packages/db` — data access only; no business logic
- `packages/shared` — pure types and schemas; no side effects

## Domain Layer — Repository Interfaces

Defined in `apps/api/src/domain/repositories/`. Each interface has a matching injection token symbol.

| Interface | Token | Key methods |
|---|---|---|
| `IUserRepository` | `USER_REPOSITORY` | findById, findByEmail, create, update, delete |
| `IEventRepository` | `EVENT_REPOSITORY` | findById, findAll, findByMemberId, create, update, delete |
| `IAttendeeRepository` | `ATTENDEE_REPOSITORY` | findById, findByQrToken, findByEventId, create, update, delete |
| `ITableRepository` | `TABLE_REPOSITORY` | findById, findByEventId, create, update, delete |
| `ISeatRepository` | `SEAT_REPOSITORY` | findById, findByTableId, findByEventId, assignAttendee, unassignAttendee, create, update, delete |
| `IPhotoRepository` | `PHOTO_REPOSITORY` | findById, findByEventId (with status filter), findByAttendeeId, create, updateStatus, delete |
| `IBroadcastRepository` | `BROADCAST_REPOSITORY` | findById, findByEventId, create, delete |

All interfaces use the inferred Drizzle types from `@seat-snaps/db` (`User`, `Event`, `Attendee`, etc.) as entity types.

## Infrastructure Layer — Drizzle Implementations

Concrete implementations in `apps/api/src/infrastructure/repositories/`. Each class implements the corresponding domain interface using the `Database` type from `@seat-snaps/db`.

- `DrizzleUserRepository`, `DrizzleEventRepository`, `DrizzleAttendeeRepository`
- `DrizzleTableRepository`, `DrizzleSeatRepository`, `DrizzlePhotoRepository`
- `DrizzleBroadcastRepository`

**Usage pattern:** inject `Database` via constructor; register as NestJS providers using the `*_REPOSITORY` symbol tokens as the injection key and the Drizzle class as the implementation.

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

- **`apps/web/Dockerfile`** — multi-stage build, Next.js standalone output, port 3005
- **`apps/api/Dockerfile`** — multi-stage build, NestJS compiled dist, port 3001
- Railway detects Dockerfiles automatically; configure `DATABASE_URL` and other env vars in Railway project settings
- Health check endpoint: `GET /api/health` (returns 200 when service is up)

## Authentication & Authorization (Sprint 3)

### Auth.js v5 (Next.js)

- **Package**: `next-auth@5.0.0-beta.x`
- **Config**: `apps/web/src/auth.ts` — exports `{ handlers, auth, signIn, signOut }`
- **Route handler**: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- **Middleware**: `apps/web/middleware.ts` — protects `/dashboard`, redirects authenticated users away from `/login` and `/register`
- **Session strategy**: JWT (signed with `AUTH_SECRET` using HS256 — standard JWS, not encrypted JWE, so NestJS can verify directly)
- **Token flow**: Credentials provider calls NestJS `POST /api/auth/validate` → NestJS checks bcrypt hash → returns `SessionUser` → Auth.js creates JWT session
- **Session shape**: `{ user: { id, email, name, image, role } }` — `role` is from active event membership context (null by default)
- **Pages**: `/login`, `/register` (unauthenticated); `/dashboard` (authenticated)
- **Server actions**: `apps/web/src/actions/auth.ts` — `loginAction`, `registerAction`, `logoutAction`
- **API helper**: `apps/web/src/lib/api.ts` — `apiRequest()` and `getSessionToken()` for authenticated server-to-API calls (reads raw JWT from `authjs.session-token` cookie)

### NestJS Auth

- **Module**: `apps/api/src/auth/auth.module.ts` — registers `JwtModule`, `AuthService`, and global guards
- **Service**: `apps/api/src/auth/auth.service.ts` implements `IAuthService`:
  - `register(data)` — bcrypt-hashes password, creates user, returns `SessionUser`
  - `validateCredentials(email, password)` — bcrypt-compares, returns `SessionUser | null`
- **Controller**: `apps/api/src/auth/auth.controller.ts` — public endpoints:
  - `POST /api/auth/register` — creates a new user account
  - `POST /api/auth/validate` — validates credentials (called by Auth.js credentials provider)
- **Guards** (registered globally via `APP_GUARD`):
  - `JwtAuthGuard` — verifies `Authorization: Bearer <jwt>` on every request (skip with `@Public()`)
  - `RolesGuard` — enforces `@Roles(...)` metadata after JWT validation
- **Decorators**:
  - `@Public()` — marks a controller/handler as unauthenticated (skips JwtAuthGuard)
  - `@CurrentUser()` — param decorator that extracts the verified user from `request.user`
  - `@Roles(...roles)` — metadata decorator for role-based access control
- **Interface**: `apps/api/src/auth/domain/IAuthService.ts` (token: `AUTH_SERVICE`)
- **JWT secret**: `process.env.AUTH_SECRET` — must match the `AUTH_SECRET` in `apps/web`

### Database Module

- **Module**: `apps/api/src/database/database.module.ts` — global, provides `USER_REPOSITORY` (and future repositories) via the Drizzle `Database` instance
- **Pattern**: Inject `DATABASE_URL` at startup; each repository is a NestJS provider using its `*_REPOSITORY` symbol token

### Shared Auth Types (`packages/shared`)

- `MembershipRoleSchema` / `MembershipRole` — `"owner" | "organizer"` enum
- `SessionUserSchema` / `SessionUser` — `{ id, email, name, role? }` shape used in session and API responses
- `RegisterSchema` / `RegisterInput` — validated input for registration
- `LoginSchema` / `LoginInput` — validated input for login (used in Auth.js credentials provider)

### Environment Variables (Auth-related)

| Variable | Description |
|---|---|
| `AUTH_SECRET` | HS256 signing secret shared by Auth.js (web) and NestJS JWT guard (api); min 32 chars |
| `AUTH_URL` | Base URL of the Next.js app (e.g. `http://localhost:3005`); required in production |
| `INTERNAL_API_URL` | NestJS base URL used by server-side Next.js code (default: `http://localhost:3001`) |

### Usage Patterns

**Protect a NestJS route** (JWT required by default):
```typescript
@Get("me")
getMe(@CurrentUser() user: SessionUser) { ... }
```

**Allow unauthenticated access**:
```typescript
@Public()
@Get("public-data")
getPublic() { ... }
```

**Require a specific role**:
```typescript
@Roles("owner")
@Delete(":id")
deleteEvent(...) { ... }
```

**Make an authenticated server-side API call from Next.js**:
```typescript
import { apiRequest } from "@/lib/api";
const data = await apiRequest<MyType>("/events");
```

**Read session in a Server Component**:
```typescript
import { auth } from "@/auth";
const session = await auth();
```

## Adding a New Feature Module

1. Create `apps/api/src/<feature>/<feature>.module.ts`, `.controller.ts`, `.service.ts`
2. Import the module in `apps/api/src/app.module.ts`
3. Add any new Zod schemas to `packages/shared/src/schemas/`
4. Add database tables to `packages/db/src/schema.ts`
5. Run `npm run db:generate` to create the migration

## Event & Organiser Management (Sprint 4)

### Event Module (`apps/api/src/events/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events` | JWT | List events where the caller is a member |
| `POST` | `/api/events` | JWT | Create event; creator auto-assigned as `owner` via `event_memberships` |
| `GET` | `/api/events/:id` | JWT + member | Get event detail |
| `PATCH` | `/api/events/:id` | JWT + owner | Update event fields |
| `DELETE` | `/api/events/:id` | JWT + owner | Delete event (cascades all children) |

**Service contract (`IEventService`):**
- `listForUser(userId)` → `Event[]` — queries via `findByMemberId`
- `getById(id, userId)` — throws `403` if not a member
- `create(data, userId)` — inserts event + owner membership in one logical operation
- `update(id, data, userId)` — throws `403` if caller is not `owner`
- `delete(id, userId)` — throws `403` if caller is not `owner`

**Business rules:**
- Event list is always scoped to the requesting user's memberships
- Ownership is checked by querying `event_memberships` (not from the JWT role)
- `DELETE /api/events/:id` triggers cascade delete on all child tables (attendees, seats, tables, invites, etc.)

### EventMembership Module (`apps/api/src/event-memberships/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events/:eventId/members` | JWT + member | List all members with user details |
| `DELETE` | `/api/events/:eventId/members/:userId` | JWT + owner | Remove a member |

**Service contract (`IEventMembershipService`):**
- `listMembers(eventId, requesterId)` → `MemberWithUser[]` — joins `event_memberships` + `users`
- `removeMember(eventId, targetUserId, requesterId)` — throws `403` if requester is not `owner`; throws `400` if owner tries to remove themselves

### OrganizerInvite Module (`apps/api/src/organizer-invites/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events/:eventId/invites` | JWT + member | List invites for an event |
| `POST` | `/api/events/:eventId/invites` | JWT + owner | Create invite link |
| `GET` | `/api/invites/:token` | Public | Validate token and return invite + event details |
| `POST` | `/api/invites/:token/accept` | JWT | Accept invite, create membership, mark invite accepted |

**Invite flow:**
1. Owner POSTs to `/api/events/:eventId/invites` with `{ email, role: "organizer", expiresInDays }` (default 7 days)
2. API generates a 32-byte hex token (`crypto.randomBytes(32).toString("hex")`) and stores invite
3. Frontend builds share URL: `https://<app>/invite/<token>`
4. Recipient opens URL, frontend calls `GET /api/invites/:token` to fetch invite + event details
5. Recipient (must be logged in) POSTs to `/api/invites/:token/accept`
6. API checks expiry, creates `event_membership` (role from invite), marks invite `accepted`

**Expiry check:** Both `getByToken` and `acceptInvite` check `new Date() > invite.expiresAt`. If expired and status is still `pending`, the row is updated to `expired` before the error is thrown.

**Service contract (`IOrganizerInviteService`):**
- `listForEvent(eventId, requesterId)` — member-only
- `createInvite(eventId, email, role, expiresInDays, requesterId)` — owner-only
- `getByToken(token)` → `InviteWithEvent` — public; throws `400` on expired/accepted
- `acceptInvite(token, userId)` — throws `409` if user already a member

### New Repository Interfaces

| Interface | Token | Key methods |
|---|---|---|
| `IEventMembershipRepository` | `EVENT_MEMBERSHIP_REPOSITORY` | findByEventId, findByEventIdWithUsers, findByUserAndEvent, create, remove |
| `IOrganizerInviteRepository` | `ORGANIZER_INVITE_REPOSITORY` | findByEventId, findByToken, create, markAccepted, markExpired |

### Shared Zod Schemas (`packages/shared/src/schemas/event.schema.ts`)

- `CreateEventSchema` / `CreateEventInput` — POST /events body
- `UpdateEventSchema` / `UpdateEventInput` — PATCH /events/:id body (all fields optional)
- `EventResponseSchema` / `EventResponse` — API response shape
- `EventMemberSchema` / `EventMember` — membership with nested user
- `CreateInviteSchema` / `CreateInviteInput` — POST invites body
- `InviteResponseSchema` / `InviteResponse` — invite API response
- `InviteDetailSchema` / `InviteDetail` — invite + nested event (from `GET /invites/:token`)

### Frontend Dashboard (Sprint 4)

**Pages:**
| Route | Component | Type | Description |
|---|---|---|---|
| `/dashboard` | `DashboardPage` | Server | Grid of user's events; links to detail |
| `/dashboard/events/new` | `NewEventPage` + `NewEventForm` | Server + Client | Create event form (React Hook Form + Zod) |
| `/dashboard/events/[id]` | `EventDetailPage` | Server | Event overview with sidebar nav |
| `/dashboard/events/[id]/team` | `TeamPage` + `TeamPanel` | Server + Client | Member table + invite management |
| `/invite/[token]` | `InvitePage` + `AcceptInvitePanel` | Server + Client | Public invite acceptance page |

**API client (`apps/web/src/lib/api/`):**
- `events.ts` — React Query hooks: `useEvents`, `useEvent`, `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent`, `useEventMembers`, `useRemoveMember`
- `invites.ts` — React Query hooks: `useEventInvites`, `useCreateInvite`, `useInviteByToken`, `useAcceptInvite`
- All hooks use `NEXT_PUBLIC_API_URL` (client-side) with `credentials: "include"`
- Server components use `apiRequest()` from `apps/web/src/lib/api.ts` (reads JWT cookie)

**React Query setup:** `ReactQueryProvider` in `apps/web/src/lib/query-client.tsx` is mounted in `apps/web/src/app/layout.tsx`.

**shadcn/ui components added (`apps/web/src/components/ui/`):**
- `button.tsx` — Button with variants (default, destructive, outline, secondary, ghost, link) and sizes; supports `asChild` prop via React.cloneElement
- `card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `input.tsx` — Input (text, email, date, number)
- `select.tsx` — Native select styled as shadcn Select
- `badge.tsx` — Badge with variants (default, secondary, destructive, outline)
- `table.tsx` — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- `dialog.tsx` — Lightweight Dialog with overlay (Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter)

## Attendee & Seating Management (Sprint 5)

### Attendee Module (`apps/api/src/attendees/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events/:eventId/attendees` | JWT + member | List all attendees for event |
| `POST` | `/api/events/:eventId/attendees` | JWT + member | Create single attendee |
| `POST` | `/api/events/:eventId/attendees/import` | JWT + member | Bulk import from CSV (name, email, group columns) |
| `GET` | `/api/events/:eventId/attendees/:attendeeId` | JWT + member | Get attendee detail |
| `PATCH` | `/api/events/:eventId/attendees/:attendeeId` | JWT + member | Update attendee fields |
| `DELETE` | `/api/events/:eventId/attendees/:attendeeId` | JWT + member | Delete attendee |

**Service contract (`IAttendeeService`):**
- `listForEvent(eventId, userId)` — member check; returns all attendees
- `getById(attendeeId, eventId, userId)` — verifies attendee belongs to event
- `create(eventId, data, userId)` — generates unique `qrToken` (UUID)
- `bulkImport(eventId, csv, userId)` — parses CSV rows (name, email, group columns); skips rows without name
- `update(attendeeId, eventId, data, userId)`
- `delete(attendeeId, eventId, userId)`

**Business rules:**
- All operations require event membership (any role)
- `qrToken` is auto-generated as UUID on create; unique across the workspace
- CSV import body: `{ csv: "<csv string>" }` — parsed with `csv-parse/sync`

### Table Module (`apps/api/src/tables/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events/:eventId/tables` | JWT + member | List tables with seats |
| `POST` | `/api/events/:eventId/tables` | JWT + member | Create table; auto-generates seats if capacity provided |
| `GET` | `/api/events/:eventId/tables/:tableId` | JWT + member | Get table with seats |
| `PATCH` | `/api/events/:eventId/tables/:tableId` | JWT + member | Update table metadata |
| `DELETE` | `/api/events/:eventId/tables/:tableId` | JWT + member | Delete table (cascades seats) |

**Service contract (`ITableService`):**
- `listForEvent(eventId, userId)` → `TableWithSeats[]`
- `create(eventId, data, userId)` — auto-generates `capacity` seats labelled "Seat 1" … "Seat N"
- `update`, `delete` — member-only

**Business rules:**
- Seats are auto-generated when a table is created with `capacity > 0`
- Table delete cascades to seats (via DB FK onDelete cascade)

### Seat Module (`apps/api/src/seats/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events/:eventId/seats` | JWT + member | List all seats for event |
| `PATCH` | `/api/events/:eventId/seats/:seatId/assign` | JWT + member | Assign attendee to seat; body: `{ attendeeId }` |
| `PATCH` | `/api/events/:eventId/seats/:seatId/unassign` | JWT + member | Remove attendee from seat |

**Service contract (`ISeatService`):**
- `assign(seatId, eventId, attendeeId, userId)` — throws `409` if seat occupied or attendee already seated; updates both `seats.attendeeId` and `attendees.tableId/seatId` (denormalized sync)
- `unassign(seatId, eventId, userId)` — clears `seats.attendeeId` and the attendee's `tableId/seatId`

### QR Module (`apps/api/src/qr/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/events/:eventId/attendees/:attendeeId/qr` | JWT + member | Generate QR PNG for one attendee |
| `GET` | `/api/events/:eventId/qr/bulk` | JWT + member | Generate print-ready HTML with all QR codes |
| `GET` | `/api/events/:eventId/qr/event` | JWT + member | Generate QR PNG for event join URL |

**URL format:**
- Attendee QR encodes: `{APP_URL}/join/{attendee.qrToken}`
- Event QR encodes: `{APP_URL}/join/event/{eventId}`
- `APP_URL` env var (default: `http://localhost:3005`)

**Implementation:**
- Uses `qrcode` npm package (`toBuffer` for PNG, `toDataURL` for embedded HTML)
- Bulk endpoint returns an HTML file with all QR codes as `<img>` data URLs in a grid — browser-printable to PDF
- No ZIP dependency; HTML is lightweight and print-ready

### New Service Interfaces

| Interface | Token | Location |
|---|---|---|
| `IAttendeeService` | `ATTENDEE_SERVICE` | `apps/api/src/attendees/domain/IAttendeeService.ts` |
| `ITableService` | `TABLE_SERVICE` | `apps/api/src/tables/domain/ITableService.ts` |
| `ISeatService` | `SEAT_SERVICE` | `apps/api/src/seats/domain/ISeatService.ts` |
| `IQrService` | `QR_SERVICE` | `apps/api/src/qr/domain/IQrService.ts` |

### Shared Zod Schemas (`packages/shared/src/schemas/attendee.schema.ts`)

- `CreateAttendeeSchema` / `CreateAttendeeInput`
- `UpdateAttendeeSchema` / `UpdateAttendeeInput`
- `AttendeeResponseSchema` / `AttendeeResponse`
- `CreateTableSchema` / `CreateTableInput`
- `UpdateTableSchema` / `UpdateTableInput`
- `TableResponseSchema` / `TableResponse` (includes optional `seats` array)
- `SeatResponseSchema` / `SeatResponse`
- `AssignSeatSchema` / `AssignSeatInput`

### Database Module

`apps/api/src/database/database.module.ts` now registers `ATTENDEE_REPOSITORY`, `TABLE_REPOSITORY`, and `SEAT_REPOSITORY` providers (Drizzle implementations already existed).

### Frontend Dashboard (Sprint 5)

**Pages:**
| Route | Component | Type | Description |
|---|---|---|---|
| `/dashboard/events/[id]/attendees` | `AttendeesPage` + `AttendeesPanel` | Server + Client | Attendee list with add/edit/delete + CSV import |
| `/dashboard/events/[id]/seating` | `SeatingPage` + `SeatingPanel` | Server + Client | Table grid with seat assignment per-seat |
| `/dashboard/events/[id]/seating/qr` | `QrPage` + `QrPanel` | Server + Client | Per-attendee QR download + bulk HTML download |

**API client hooks (`apps/web/src/lib/api/`):**
- `attendees.ts` — `useAttendees`, `useCreateAttendee`, `useImportAttendees`, `useUpdateAttendee`, `useDeleteAttendee`
- `tables.ts` — `useTables`, `useCreateTable`, `useUpdateTable`, `useDeleteTable`, `useSeats`, `useAssignSeat`, `useUnassignSeat`

**Seating plan (no drag-drop):**
The seating panel renders each table as a card with its seats listed. Each seat shows an "Assign" or "Remove" button. Assigning opens a dialog to select from unassigned attendees.

### Build Fixes (pre-existing issues resolved)

- `next.config.ts`: added `webpack.resolve.extensionAlias` to resolve `.js` imports to `.ts` for the shared package
- `next.config.ts`: moved `typedRoutes` from `experimental` to top-level (Next.js 15 breaking change)
- `src/app/globals.css`: migrated from Tailwind CSS v3 `@apply` pattern to Tailwind CSS v4 `@theme inline` token registration
- `src/components/ui/button.tsx`: added `asChild` support via `React.cloneElement`
- `src/auth.ts`: fixed `NextAuthResult` export type portability issue (next-auth v5 quirk)
- `middleware.ts`: typed `auth` callback parameter to avoid implicit `any`
- `src/app/dashboard/events/[id]/team/team-panel.tsx`: fixed zod v3/v4 form resolver type mismatch

## Attendee PWA & QR Entry (Sprint 6)

### PWA Configuration (`apps/web`)

- **Manifest**: `public/manifest.json` — name, short_name, display: standalone, icons, theme_color (#3b82f6)
- **Service worker**: `public/sw.js` — cache-first for static assets, network-first for /api and /auth; registered in `src/components/sw-register.tsx` (client component mounted in root layout)
- **Metadata**: `apps/web/src/app/layout.tsx` exports `metadata.manifest` and `viewport.themeColor`; `appleWebApp.capable: true` enables iOS Add to Home Screen

### Attendee Session Module (`apps/api/src/attendee-sessions/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/attendee-sessions` | Public | Create session from qrToken or attendeeId+eventId; sets HTTP-only `attendee-session` cookie |
| `GET` | `/api/attendee-sessions/me` | Attendee session cookie or Bearer | Get current attendee from session token |

**Session flow:**
1. Attendee scans QR → browser opens `/join/{qrToken}`
2. Server POSTs to `/api/attendee-sessions` with `{ qrToken }` → validates token, creates session row, returns `{ token, attendeeId, eventId, name }`
3. Server sets `attendee-session` HTTP-only cookie (90-day TTL)
4. Server redirects to `/event/{eventId}`
5. All attendee pages call `getCurrentAttendee()` (server) or `useCurrentAttendee()` (client) to read session

**Manual join flow** (`/join/event/[eventId]`):
- Fetches public event info (`GET /api/events/:id/info`) and public attendee list (`GET /api/events/:eventId/attendees/public`)
- Attendee selects their name → POSTs `{ attendeeId, eventId }` to create session

**Service contract (`IAttendeeSessionService`):**
- `createFromQrToken(qrToken, deviceFingerprint?)` — looks up attendee by `qrToken`; throws 404 if invalid
- `createFromManualSelection(attendeeId, eventId, deviceFingerprint?)` — validates attendee belongs to event
- `getByToken(token)` — validates token not expired; throws 401 if invalid/expired

**AttendeeSessionGuard:**
- Reads `attendee-session` cookie or `Authorization: Bearer <token>` header
- Sets `request.attendee` and `request.attendeeSession` on the Fastify request object
- Used with `@UseGuards(AttendeeSessionGuard)` on routes requiring attendee auth

**Decorator:** `@CurrentAttendee()` param decorator reads `request.attendee`

**Cookie setup:** `@fastify/cookie` registered in `apps/api/src/main.ts` via `app.register(fastifyCookie)`

### Schedule Items Module (`apps/api/src/schedule-items/`)

**Endpoints:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events/:eventId/schedule` | Public | List schedule items (sorted by position, then startTime) |
| `GET` | `/api/events/:eventId/schedule/:id` | Public | Get single schedule item |
| `POST` | `/api/events/:eventId/schedule` | JWT + member | Create schedule item |
| `PATCH` | `/api/events/:eventId/schedule/:id` | JWT + member | Update schedule item |
| `DELETE` | `/api/events/:eventId/schedule/:id` | JWT + member | Delete schedule item |

**Database:** `schedule_items` table added to `packages/db/src/schema/schedule-items.ts`; migration in `packages/db/drizzle/0001_schedule_items.sql`

**Service contract (`IScheduleItemService`):** `listForEvent`, `getById`, `create`, `update`, `delete`

### Public Endpoints Added to Existing Modules

| Endpoint | Module | Purpose |
|---|---|---|
| `GET /api/events/:id/info` | Events | Public event info (title, date, location, type) for attendee join flow |
| `GET /api/events/:eventId/attendees/public` | Attendees | Public attendee list (id, name, groupLabel, tableId) for join search and attendee directory |
| `GET /api/events/:eventId/tables/public` | Tables | Public tables+seats for attendee seating view |

### New Repository Interfaces & Implementations

| Interface | Token | Location |
|---|---|---|
| `IAttendeeSessionRepository` | `ATTENDEE_SESSION_REPOSITORY` | `apps/api/src/domain/repositories/IAttendeeSessionRepository.ts` |
| `IScheduleItemRepository` | `SCHEDULE_ITEM_REPOSITORY` | `apps/api/src/domain/repositories/IScheduleItemRepository.ts` |

Drizzle implementations: `DrizzleAttendeeSessionRepository`, `DrizzleScheduleItemRepository` in `apps/api/src/infrastructure/repositories/`.
Both registered in `DatabaseModule`.

### Shared Zod Schemas (`packages/shared/src/schemas/schedule-item.schema.ts`)

- `CreateScheduleItemSchema` / `CreateScheduleItemInput`
- `UpdateScheduleItemSchema` / `UpdateScheduleItemInput`
- `ScheduleItemResponseSchema` / `ScheduleItemResponse`
- `CreateAttendeeSessionSchema` / `CreateAttendeeSessionInput`
- `AttendeeSessionResponseSchema` / `AttendeeSessionResponse`

### QR Entry Flow Pages (`apps/web/src/app/join/`)

| Route | Description |
|---|---|
| `/join/[qrToken]` | Server page: calls `POST /api/attendee-sessions`, sets cookie, redirects to `/event/{eventId}` |
| `/join/event/[eventId]` | Server page + `JoinEventClient`: shows event title + attendee search, creates session on selection |

### Attendee Pages (`apps/web/src/app/event/[eventId]/`)

**Layout** (`layout.tsx`): Server component; reads `attendee-session` cookie via `getCurrentAttendee()`; redirects to `/join/event/{eventId}` if no session. Renders `AttendeeNav` bottom nav.

**Bottom nav** (`attendee-nav.tsx`): Client component; links to Home, Schedule, Guests, Seating.

| Route | Component | Description |
|---|---|---|
| `/event/[eventId]` | Server | Home screen: event header (title, date, location, type badge), current/next schedule item, My Seat card, quick-action grid |
| `/event/[eventId]/schedule` | Server | Timeline of schedule items; active item highlighted in blue |
| `/event/[eventId]/attendees` | Server + `AttendeesClient` | Searchable attendee directory with name, group, conversation starters |
| `/event/[eventId]/seating` | Server | Read-only seating plan; current attendee's seat highlighted in blue |

**Session utility:** `apps/web/src/lib/attendee-session.ts` — `getAttendeeSessionToken()` reads cookie; `getCurrentAttendee()` calls `GET /api/attendee-sessions/me` with Bearer token.

**API client hooks** (`apps/web/src/lib/api/attendee-session.ts`):
- `useCreateAttendeeSession` — POST /attendee-sessions
- `useCurrentAttendee` — GET /attendee-sessions/me
- `useEventAttendeesPublic` — GET /events/:eventId/attendees
- `useScheduleItems` — GET /events/:eventId/schedule
