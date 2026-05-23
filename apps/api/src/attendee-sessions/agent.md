# Attendee Sessions Module

## Purpose

Manages device sessions for attendees. Created when an attendee scans a QR code. Provides the `AttendeeSessionGuard` and `@CurrentAttendee()` decorator.

## Files

- `attendee-sessions.module.ts` — Module registration
- `attendee-sessions.controller.ts` — REST endpoints
- `attendee-sessions.service.ts` — Implements `IAttendeeSessionService`
- `domain/IAttendeeSessionService.ts` — Interface + `ATTENDEE_SESSION_SERVICE` token
- `guards/attendee-session.guard.ts` — Reads `attendee-session` cookie or `Authorization: Bearer` header
- `decorators/current-attendee.decorator.ts` — `@CurrentAttendee()` param decorator
- `dto/create-attendee-session.dto.ts` — Request DTO

## Endpoints

- `POST /api/attendee-sessions` (public, rate-limited) — Create session via `qrToken` only; returns `{ token, attendeeId, eventId, name, csrfToken }` + sets HTTP-only cookie
- `GET /api/attendee-sessions/me` (attendee session) — Get current attendee from session token
- `PATCH /api/attendee-sessions/me` (attendee session + CSRF) — Update own description / conversation starters

## Patterns

- Only `qrToken` is accepted; the old `attendeeId + eventId` path has been removed (IDOR fix)
- Session flow: QR scan → `POST /api/attendee-sessions { qrToken }` → returns session data + sets `attendee-session` cookie (90-day TTL)
- RSVP flow auto-creates a session via `createFromQrToken(attendee.qrToken)` in the attendees controller
- Guard reads cookie first, falls back to Bearer header
- `@fastify/cookie` must be registered in `main.ts`
