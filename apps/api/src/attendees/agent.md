# Attendees Module

## Purpose

CRUD for event attendees (guests). Supports individual creation, CSV bulk import, and a public attendee list for the join flow.

## Files

- `attendees.module.ts` — Module registration
- `attendees.controller.ts` — REST endpoints
- `attendees.service.ts` — Implements `IAttendeeService`
- `domain/IAttendeeService.ts` — Interface + `ATTENDEE_SERVICE` token
- `dto/create-attendee.dto.ts`, `dto/update-attendee.dto.ts` — Request DTOs

## Endpoints

- `GET /api/events/:eventId/attendees` (JWT + member) — List all attendees
- `POST /api/events/:eventId/attendees` (JWT + member) — Create single attendee
- `POST /api/events/:eventId/attendees/import` (JWT + member) — Bulk CSV import
- `GET /api/events/:eventId/attendees/:attendeeId` (JWT + member) — Attendee detail
- `PATCH /api/events/:eventId/attendees/:attendeeId` (JWT + member) — Update
- `DELETE /api/events/:eventId/attendees/:attendeeId` (JWT + member) — Delete
- `GET /api/events/:eventId/attendees/public` (public) — Public list for join flow

## Patterns

- All operations require event membership (any role)
- `qrToken` auto-generated as UUID on create
- CSV import uses `csv-parse/sync`; body: `{ csv: "<csv string>" }`; skips rows without name
