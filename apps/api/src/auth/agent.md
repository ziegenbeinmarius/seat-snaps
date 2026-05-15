# Auth Module

## Purpose

Handles user registration, credential validation, and provides global JWT + role-based guards. All routes are JWT-protected by default via `APP_GUARD`.

## Files

- `auth.module.ts` — Registers JwtModule, AuthService, global guards (JwtAuthGuard, RolesGuard)
- `auth.controller.ts` — Public endpoints: `POST /api/auth/register`, `POST /api/auth/validate`
- `auth.service.ts` — Implements `IAuthService`: bcrypt hashing, credential validation
- `domain/IAuthService.ts` — Interface + `AUTH_SERVICE` token
- `guards/jwt-auth.guard.ts` — Verifies `Authorization: Bearer <jwt>`, skippable with `@Public()`
- `guards/roles.guard.ts` — Enforces `@Roles(...)` metadata
- `decorators/public.decorator.ts` — `@Public()` to skip JWT guard
- `decorators/current-user.decorator.ts` — `@CurrentUser()` param decorator
- `decorators/roles.decorator.ts` — `@Roles(...roles)` metadata decorator
- `dto/register.dto.ts`, `dto/validate.dto.ts` — Request DTOs

## Endpoints

- `POST /api/auth/register` (public) — Create user account
- `POST /api/auth/validate` (public) — Validate credentials (called by Auth.js on frontend)

## Patterns

- JWT secret: `process.env.AUTH_SECRET` (must match frontend Auth.js config)
- Session flow: Auth.js credentials provider → calls `POST /api/auth/validate` → NestJS returns `SessionUser` → Auth.js creates HS256 JWT
- Guards are global via `APP_GUARD`; individual routes opt out with `@Public()`
