# Broadcasts Module

## Purpose

Real-time broadcast announcements from organizers to attendees. Broadcasts are persisted to the DB and also emitted live via Socket.io.

## Files

- `broadcasts.controller.ts` — REST endpoints under `events/:id/broadcasts`
- `broadcasts.service.ts` — Business logic; creates broadcasts and emits via gateway
- `broadcasts.gateway.ts` — Socket.io WebSocket gateway (runs on `SOCKET_PORT`, default 3002)
- `domain/IBroadcastService.ts` — Service interface + injection token
- `dto/create-broadcast.dto.ts` — Validated DTO for broadcast creation

## REST Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/events/:id/broadcasts` | JWT (organizer) | Create and send a broadcast |
| `GET` | `/api/events/:id/broadcasts` | JWT (organizer) | List all broadcasts for an event |
| `GET` | `/api/events/:id/broadcasts/feed` | AttendeeSessionGuard | List broadcasts for attendees |

## WebSocket Gateway

- Port: `SOCKET_PORT` env var (default `3002`)
- The client sends `{ token, eventId }` in handshake `auth`
- Attendee session tokens: gateway looks up session, assigns socket to `event:{eventId}` room and `event:{eventId}:table:{tableId}` if attendee has a table
- Organizer JWT tokens: gateway verifies JWT and event membership, assigns socket to `event:{eventId}` room
- Emits `broadcast` event to the appropriate room(s) on create

## Room Structure

- `event:{eventId}` — all attendees and organizers for the event
- `event:{eventId}:table:{tableId}` — attendees at a specific table

## Broadcast Flow

1. Organizer POSTs to `/api/events/:id/broadcasts`
2. Service validates membership, persists to DB
3. Service calls gateway to emit to the appropriate room(s)
4. Connected clients receive the `broadcast` event in real time
