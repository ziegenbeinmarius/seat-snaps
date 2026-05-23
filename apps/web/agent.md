# Frontend — Next.js Web App

## Purpose

Next.js 15 (App Router) frontend serving two user experiences: an organizer dashboard (authenticated, JWT) and an attendee PWA (session cookie from QR scan).

## Key Directories

- `src/app/` — App Router pages and layouts
  - `dashboard/` — Organizer pages (auth-protected via middleware)
  - `event/[eventId]/` — Attendee-facing pages (session cookie-protected via layout)
  - `join/` — QR entry flow (creates attendee session)
  - `invite/[token]/` — Organizer invite acceptance
  - `login/`, `register/`, `logout/` — Auth pages
  - `api/auth/[...nextauth]/` — Auth.js route handler
- `src/components/` — Shared components
  - `ui/` — shadcn/ui components (button, card, input, select, badge, table, dialog)
  - `auth/` — Login/register forms
  - `sw-register.tsx` — Service worker registration
- `src/lib/` — Utilities
  - `api.ts` — Server-side `apiRequest()` with JWT from cookie
  - `api/` — Client-side React Query hooks per domain (events, attendees, tables, invites, attendee-session)
  - `attendee-session.ts` — `getAttendeeSessionToken()`, `getCurrentAttendee()`
  - `query-client.tsx` — React Query provider
  - `utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/actions/` — Server actions (auth, invites)
- `src/auth.ts` — Auth.js v5 config (credentials provider, JWT strategy)
- `src/proxy.ts` — Protects `/dashboard`, applies next-intl locale rewrites (Next.js 16 `proxy` convention, formerly `middleware`)

## Patterns & Conventions

- **Server vs Client**: Server components for data fetching, client components (`"use client"`) for interactivity. Pages are server; panels/forms are client.
- **API calls from server**: Use `apiRequest<T>("/path")` from `src/lib/api.ts` (reads JWT cookie)
- **API calls from client**: Use React Query hooks from `src/lib/api/<domain>.ts` (uses `NEXT_PUBLIC_API_URL` with `credentials: "include"`)
- **Styling**: Tailwind CSS 4 (CSS-based config via `@import "tailwindcss"`), `cn()` for merging classes
- **Forms**: React Hook Form + Zod for validation
- **PWA**: `public/manifest.json`, `public/sw.js` (cache-first static, network-first API)

## How to Add a New Page

1. Create `src/app/<route>/page.tsx` (server component)
2. If interactive, create a client panel component alongside it
3. For API data: use `apiRequest()` in server components, React Query hooks in client components
4. For organizer pages: place under `dashboard/`; middleware auto-protects
5. For attendee pages: place under `event/[eventId]/`; layout checks session cookie

## How to Add a New API Hook

1. Create or update `src/lib/api/<domain>.ts`
2. Define fetch function using `${NEXT_PUBLIC_API_URL}/api/<path>`
3. Wrap in `useQuery` / `useMutation` with appropriate query key
4. Export the hook

## Current Pages

**Organizer (dashboard):** Event list, create event, event detail, team management, attendee list, seating plan, QR codes
**Attendee (event):** Home, schedule, guest directory, seating view
**Auth:** Login, register, logout
**Entry:** QR scan join, manual event join, invite acceptance
