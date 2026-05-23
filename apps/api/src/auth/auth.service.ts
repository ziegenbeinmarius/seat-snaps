import { Injectable, ConflictException, UnauthorizedException, Inject } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import type { IUserRepository } from "../domain/repositories/IUserRepository";
import { USER_REPOSITORY } from "../domain/repositories/IUserRepository";
import type { IAuthService } from "./domain/IAuthService";
import type { SessionUser, RegisterInput } from "@seat-snaps/shared";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async register(data: RegisterInput): Promise<SessionUser> {
    const email = data.email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new ConflictException("Email already in use");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.userRepository.create({
      email,
      name: data.name,
      passwordHash,
    });

    return { id: user.id, email: user.email, name: user.name, role: null, isAdmin: user.isAdmin, tokenVersion: user.tokenVersion };
  }

  async validateCredentials(email: string, password: string): Promise<SessionUser | null> {
    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return { id: user.id, email: user.email, name: user.name, role: null, isAdmin: user.isAdmin, tokenVersion: user.tokenVersion };
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return Boolean(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException("User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, {
      passwordHash,
      tokenVersion: (user.tokenVersion ?? 0) + 1,
    });
  }

  async getTokenVersion(userId: string): Promise<number | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    return user.tokenVersion ?? 0;
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; name: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException("User not found");
    return { id: user.id, email: user.email, name: user.name };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<{ id: string; email: string; name: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException("User not found");

    if (data.email && data.email.toLowerCase().trim() !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email.toLowerCase().trim());
      if (existing) throw new ConflictException("Email already in use");
    }

    const updated = await this.userRepository.update(userId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email.toLowerCase().trim() }),
    });

    return { id: updated.id, email: updated.email, name: updated.name };
  }

  async getSessionState(userId: string): Promise<{ exists: boolean; tokenVersion: number | null; isAdmin: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { exists: false, tokenVersion: null, isAdmin: false };
    }

    return {
      exists: true,
      tokenVersion: user.tokenVersion ?? 0,
      isAdmin: user.isAdmin ?? false,
    };
  }
}
