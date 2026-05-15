# Events Module

## Purpose

CRUD for events. Events are the root entity — all other resources (attendees, tables, seats, etc.) belong to an event.

## Files

- `events.module.ts` — Imports DatabaseModule, EventMembershipsModule
- `events.controller.ts` — REST endpoints under `/api/events`
- `events.service.ts` — Implements `IEventService`
- `domain/IEventService.ts` — Interface + `EVENT_SERVICE` token
- `dto/create-event.dto.ts`, `dto/update-event.dto.ts` — Request DTOs

## Endpoints

- `GET /api/events` (JWT) — List events where caller is a member
- `POST /api/events` (JWT) — Create event; creator auto-assigned as `owner`
- `GET /api/events/:id` (JWT + member) — Event detail
- `PATCH /api/events/:id` (JWT + owner) — Update event
- `DELETE /api/events/:id` (JWT + owner) — Delete event (cascades all children)
- `GET /api/events/:id/info` (public) — Public event info for attendee join flow

## Patterns

- Event list is scoped to requesting user's memberships
- Ownership checked via `event_memberships` table, not JWT role
- Delete cascades all child tables
