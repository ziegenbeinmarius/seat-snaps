# Schedule Items Module

## Purpose

CRUD for event schedule entries (agenda items). Public read, organizer-only write.

## Files

- `schedule-items.module.ts` — Module registration
- `schedule-items.controller.ts` — REST endpoints
- `schedule-items.service.ts` — Implements `IScheduleItemService`
- `domain/IScheduleItemService.ts` — Interface + `SCHEDULE_ITEM_SERVICE` token
- `dto/create-schedule-item.dto.ts`, `dto/update-schedule-item.dto.ts` — Request DTOs

## Endpoints

- `GET /api/events/:eventId/schedule` (public) — List items sorted by position, then startTime
- `GET /api/events/:eventId/schedule/:id` (public) — Single item
- `POST /api/events/:eventId/schedule` (JWT + member) — Create item
- `PATCH /api/events/:eventId/schedule/:id` (JWT + member) — Update item
- `DELETE /api/events/:eventId/schedule/:id` (JWT + member) — Delete item

## Patterns

- Read endpoints are public (attendees view schedule without organizer auth)
- Write endpoints require event membership
