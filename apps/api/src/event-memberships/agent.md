# Event Memberships Module

## Purpose

Manages organizer memberships for events. Links users to events with roles (`owner` or `organizer`).

## Files

- `event-memberships.module.ts` — Module registration
- `event-memberships.controller.ts` — REST endpoints
- `event-memberships.service.ts` — Implements `IEventMembershipService`
- `domain/IEventMembershipService.ts` — Interface + `EVENT_MEMBERSHIP_SERVICE` token

## Endpoints

- `GET /api/events/:eventId/members` (JWT + member) — List members with user details
- `DELETE /api/events/:eventId/members/:userId` (JWT + owner) — Remove a member

## Patterns

- `listMembers` joins `event_memberships` + `users`
- Owner cannot remove themselves
- Only owners can remove other members
