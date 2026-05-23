import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { USER_REPOSITORY } from "../domain/repositories/IUserRepository";
import type { IUserRepository } from "../domain/repositories/IUserRepository";

vi.mock("bcryptjs", async () => {
  const actual = await vi.importActual<typeof import("bcryptjs")>("bcryptjs");
  return {
    ...actual,
    hash: vi.fn(),
    compare: vi.fn(),
  };
});

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "user-1",
    email: "alice@example.com",
    name: "Alice",
    passwordHash: "$2a$12$hashed",
    avatarUrl: null,
    isAdmin: false,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("AuthService", () => {
  let service: AuthService;
  let userRepo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    userRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: userRepo },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe("register", () => {
    it("creates a user and returns session data", async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("$2a$12$newhash" as never);
      const created = makeUser({ id: "user-new" });
      userRepo.create.mockResolvedValue(created);

      const result = await service.register({
        email: "Bob@Example.com",
        name: "Bob",
        password: "securepass",
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith("bob@example.com");
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "bob@example.com",
          name: "Bob",
          passwordHash: "$2a$12$newhash",
        }),
      );
      expect(result).toEqual({
        id: created.id,
        email: created.email,
        name: created.name,
        role: null,
        isAdmin: false,
        tokenVersion: 0,
      });
    });

    it("normalizes email to lowercase and trims whitespace", async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hash" as never);
      userRepo.create.mockResolvedValue(makeUser());

      await service.register({
        email: "  Alice@Example.COM  ",
        name: "Alice",
        password: "password123",
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith("alice@example.com");
    });

    it("throws ConflictException when email is already in use", async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());

      await expect(
        service.register({
          email: "alice@example.com",
          name: "Alice",
          password: "password",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("validateCredentials", () => {
    it("returns session user for valid credentials", async () => {
      const user = makeUser();
      userRepo.findByEmail.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.validateCredentials("alice@example.com", "correct");

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: null,
        isAdmin: false,
        tokenVersion: 0,
      });
    });

    it("returns null when user does not exist", async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      const result = await service.validateCredentials("nobody@example.com", "pass");

      expect(result).toBeNull();
    });

    it("returns null when password is incorrect", async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await service.validateCredentials("alice@example.com", "wrong");

      expect(result).toBeNull();
    });
  });

  describe("changePassword", () => {
    it("hashes new password and increments tokenVersion", async () => {
      const user = makeUser({ tokenVersion: 3 });
      userRepo.findById.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue("$2a$12$newpwhash" as never);
      userRepo.update.mockResolvedValue(user);

      await service.changePassword("user-1", "oldpass", "newpass");

      expect(userRepo.update).toHaveBeenCalledWith("user-1", {
        passwordHash: "$2a$12$newpwhash",
        tokenVersion: 4,
      });
    });

    it("throws when current password is incorrect", async () => {
      userRepo.findById.mockResolvedValue(makeUser());
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.changePassword("user-1", "wrong", "newpass"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("throws when user does not exist", async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        service.changePassword("no-user", "old", "new"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("userExists", () => {
    it("returns true when user exists", async () => {
      userRepo.findById.mockResolvedValue(makeUser());
      expect(await service.userExists("user-1")).toBe(true);
    });

    it("returns false when user does not exist", async () => {
      userRepo.findById.mockResolvedValue(null);
      expect(await service.userExists("no-user")).toBe(false);
    });
  });

  describe("getSessionState", () => {
    it("returns exists=true with tokenVersion and isAdmin", async () => {
      userRepo.findById.mockResolvedValue(makeUser({ tokenVersion: 5, isAdmin: true }));

      const result = await service.getSessionState("user-1");

      expect(result).toEqual({ exists: true, tokenVersion: 5, isAdmin: true });
    });

    it("returns exists=false when user is not found", async () => {
      userRepo.findById.mockResolvedValue(null);

      const result = await service.getSessionState("missing");

      expect(result).toEqual({ exists: false, tokenVersion: null, isAdmin: false });
    });
  });
});
