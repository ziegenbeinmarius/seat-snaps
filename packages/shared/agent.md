# Shared Package — Types & Schemas

## Purpose

Pure Zod schemas, TypeScript types, and DTOs consumed by both `apps/web` and `apps/api`. No side effects, no runtime dependencies beyond Zod. Published as `@seat-snaps/shared`.

## Key Files

- `src/index.ts` — Re-exports everything from `src/schemas/`
- `src/schemas/index.ts` — Barrel export for all schema files
- `src/schemas/common.schema.ts` — `UuidSchema`, `TimestampSchema`, `ApiErrorSchema`, `SuccessResponseSchema`
- `src/schemas/pagination.schema.ts` — `PaginationQuerySchema`, `PaginatedResponse<T>`
- `src/schemas/auth.schema.ts` — `LoginSchema`, `RegisterSchema`, `SessionUserSchema`, `MembershipRoleSchema`
- `src/schemas/event.schema.ts` — `CreateEventSchema`, `UpdateEventSchema`, `EventResponseSchema`, `EventMemberSchema`, `CreateInviteSchema`, `InviteResponseSchema`, `InviteDetailSchema`
- `src/schemas/attendee.schema.ts` — `CreateAttendeeSchema`, `UpdateAttendeeSchema`, `AttendeeResponseSchema`, `CreateTableSchema`, `UpdateTableSchema`, `TableResponseSchema`, `SeatResponseSchema`, `AssignSeatSchema`
- `src/schemas/schedule-item.schema.ts` — `CreateScheduleItemSchema`, `UpdateScheduleItemSchema`, `ScheduleItemResponseSchema`, `CreateAttendeeSessionSchema`, `AttendeeSessionResponseSchema`

## Patterns

- Each domain gets a `<domain>.schema.ts` file
- Every schema exports both the Zod schema object and its inferred TypeScript type
- Naming convention: `Create<Entity>Schema`, `Update<Entity>Schema`, `<Entity>ResponseSchema`

## How to Add a New Schema

1. Create `src/schemas/<domain>.schema.ts`
2. Define Zod schemas + infer types: `export type MyType = z.infer<typeof MyTypeSchema>`
3. Export from `src/schemas/index.ts`
4. It's auto-available via `@seat-snaps/shared` in both apps
