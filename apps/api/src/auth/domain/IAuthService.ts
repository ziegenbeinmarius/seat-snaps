import type { SessionUser, RegisterInput } from "@seat-snaps/shared";

export interface IAuthService {
  register(data: RegisterInput): Promise<SessionUser>;
  validateCredentials(email: string, password: string): Promise<SessionUser | null>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  getTokenVersion(userId: string): Promise<number | null>;
}

export const AUTH_SERVICE = Symbol("IAuthService");
