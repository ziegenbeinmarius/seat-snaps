import type { SessionUser, RegisterInput } from "@seat-snaps/shared";

export interface IAuthService {
  register(data: RegisterInput): Promise<SessionUser>;
  validateCredentials(email: string, password: string): Promise<SessionUser | null>;
  findOrCreateOAuthUser(data: { email: string; name: string; avatarUrl?: string }): Promise<SessionUser>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  getTokenVersion(userId: string): Promise<number | null>;
  getProfile(userId: string): Promise<{ id: string; email: string; name: string }>;
  updateProfile(userId: string, data: { name?: string; email?: string }): Promise<{ id: string; email: string; name: string }>;
}

export const AUTH_SERVICE = Symbol("IAuthService");
