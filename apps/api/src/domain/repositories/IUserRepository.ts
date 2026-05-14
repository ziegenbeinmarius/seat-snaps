import type { User, NewUser } from "@seat-snaps/db";

export type UpdateUserData = Partial<Pick<NewUser, "name" | "email" | "passwordHash" | "avatarUrl">>;

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: NewUser): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol("IUserRepository");
