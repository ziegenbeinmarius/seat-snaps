import type { SessionUser, RegisterInput } from "@seat-snaps/shared";

export interface IAuthService {
  register(data: RegisterInput): Promise<SessionUser>;
  validateCredentials(email: string, password: string): Promise<SessionUser | null>;
}

export const AUTH_SERVICE = Symbol("IAuthService");
