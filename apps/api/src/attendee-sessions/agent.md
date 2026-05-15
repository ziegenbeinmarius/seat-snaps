# Attendee Sessions Module

## Purpose

Manages device sessions for attendees. Created when an attendee scans a QR code or manually selects their name. Provides the `AttendeeSessionGuard` and `@CurrentAttendee()` decorator.

## Files

- `attendee-sessions.module.ts` — Module registration
- `attendee-sessions.controller.ts` — REST endpoints
- `attendee-sessions.service.ts` — Implements `IAttendeeSessionService`
- `domain/IAttendeeSessionService.ts` — Interface + `ATTENDEE_SESSION_SERVICE` token
- `guards/attendee-session.guard.ts` — Reads `attendee-session` cookie or `Authorization: Bearer` header
- `decorators/current-attendee.decorator.ts` — `@CurrentAttendee()` param decorator
- `dto/create-attendee-session.dto.ts` — Request DTO

## Endpoints

- `POST /api/attendee-sessions` (public) — Create session from qrToken or attendeeId+eventId; sets HTTP-only cookie
- `GET /api/attendee-sessions/me` (attendee session) — Get current attendee from session token

## Patterns

- Session flow: QR scan → `POST /api/attendee-sessions { qrToken }` → returns `{ token, attendeeId, eventId, name }` + sets `attendee-session` cookie (90-day TTL)
- Manual join: `POST { attendeeId, eventId }` (attendee selects name from public list)
- Guard reads cookie first, falls back to Bearer header
- `@fastify/cookie` must be registered in `main.ts`
