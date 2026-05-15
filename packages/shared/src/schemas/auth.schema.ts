import { z } from "zod";

export const MembershipRoleSchema = z.enum(["owner", "organizer"]);
export type MembershipRole = z.infer<typeof MembershipRoleSchema>;

export const SessionUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: MembershipRoleSchema.nullable().optional(),
});
export type SessionUser = z.infer<typeof SessionUserSchema>;

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;
