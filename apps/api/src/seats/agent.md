# Seats Module

## Purpose

Manages seat assignment and unassignment. Seats belong to tables; each seat can hold one attendee.

## Files

- `seats.module.ts` — Module registration
- `seats.controller.ts` — REST endpoints
- `seats.service.ts` — Implements `ISeatService`
- `domain/ISeatService.ts` — Interface + `SEAT_SERVICE` token
- `dto/assign-seat.dto.ts` — Request DTO

## Endpoints

- `GET /api/events/:eventId/seats` (JWT + member) — List all seats for event
- `PATCH /api/events/:eventId/seats/:seatId/assign` (JWT + member) — Assign attendee; body: `{ attendeeId }`
- `PATCH /api/events/:eventId/seats/:seatId/unassign` (JWT + member) — Remove attendee from seat

## Patterns

- Assign throws 409 if seat is occupied or attendee is already seated elsewhere
- Assignment updates both `seats.attendeeId` and `attendees.tableId/seatId` (denormalized sync)
- Unassign clears both sides
