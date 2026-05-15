# Tables Module

## Purpose

CRUD for seating tables within an event. Auto-generates seats when a table is created with capacity.

## Files

- `tables.module.ts` — Module registration
- `tables.controller.ts` — REST endpoints
- `tables.service.ts` — Implements `ITableService`
- `domain/ITableService.ts` — Interface + `TABLE_SERVICE` token
- `dto/create-table.dto.ts`, `dto/update-table.dto.ts` — Request DTOs

## Endpoints

- `GET /api/events/:eventId/tables` (JWT + member) — List tables with seats
- `POST /api/events/:eventId/tables` (JWT + member) — Create table (auto-generates seats)
- `GET /api/events/:eventId/tables/:tableId` (JWT + member) — Table detail with seats
- `PATCH /api/events/:eventId/tables/:tableId` (JWT + member) — Update metadata
- `DELETE /api/events/:eventId/tables/:tableId` (JWT + member) — Delete (cascades seats)
- `GET /api/events/:eventId/tables/public` (public) — Public tables+seats for attendee view

## Patterns

- Creating a table with `capacity > 0` auto-generates seats labelled "Seat 1" … "Seat N"
- Table delete cascades to seats via DB FK
