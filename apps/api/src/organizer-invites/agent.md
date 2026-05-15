# Organizer Invites Module

## Purpose

Creates and manages invite links for adding organizers to events. Token-based flow with expiry.

## Files

- `organizer-invites.module.ts` — Module registration
- `organizer-invites.controller.ts` — REST endpoints
- `organizer-invites.service.ts` — Implements `IOrganizerInviteService`
- `domain/IOrganizerInviteService.ts` — Interface + `ORGANIZER_INVITE_SERVICE` token
- `dto/create-invite.dto.ts` — Request DTO

## Endpoints

- `GET /api/events/:eventId/invites` (JWT + member) — List invites
- `POST /api/events/:eventId/invites` (JWT + owner) — Create invite with email, role, expiry
- `GET /api/invites/:token` (public) — Validate token, return invite + event details
- `POST /api/invites/:token/accept` (JWT) — Accept invite, create membership

## Patterns

- Token: 32-byte hex via `crypto.randomBytes(32).toString("hex")`
- Default expiry: 7 days
- Both `getByToken` and `acceptInvite` check expiry; auto-mark expired if past due
- Accepting creates `event_membership` row and marks invite `accepted`
- 409 if user already a member
