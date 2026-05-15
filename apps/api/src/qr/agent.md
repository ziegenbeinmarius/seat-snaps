# QR Module

## Purpose

Generates QR codes for attendees and events. Supports single PNG, bulk print-ready HTML, and event-level QR.

## Files

- `qr.module.ts` — Module registration
- `qr.controller.ts` — REST endpoints
- `qr.service.ts` — Implements `IQrService`
- `domain/IQrService.ts` — Interface + `QR_SERVICE` token

## Endpoints

- `POST /api/events/:eventId/attendees/:attendeeId/qr` (JWT + member) — Single attendee QR PNG
- `GET /api/events/:eventId/qr/bulk` (JWT + member) — Print-ready HTML with all QR codes as data URL images
- `GET /api/events/:eventId/qr/event` (JWT + member) — Event join QR PNG

## Patterns

- Uses `qrcode` npm package (`toBuffer` for PNG, `toDataURL` for HTML embeds)
- Attendee QR encodes: `{APP_URL}/join/{attendee.qrToken}`
- Event QR encodes: `{APP_URL}/join/event/{eventId}`
- Bulk HTML is browser-printable to PDF (no ZIP dependency)
