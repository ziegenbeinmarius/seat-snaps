import { Injectable, ConflictException, Inject } from "@nestjs/common";
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
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new ConflictException("Email already in use");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    return { id: user.id, email: user.email, name: user.name, role: null };
  }

  async validateCredentials(email: string, password: string): Promise<SessionUser | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return { id: user.id, email: user.email, name: user.name, role: null };
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return Boolean(user);
  }
}
