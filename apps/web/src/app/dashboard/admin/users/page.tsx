import type { Metadata } from "next";
import { AdminUsersPanel } from "./admin-users-panel";

export const metadata: Metadata = { title: "Admin - Users" };

export default function AdminUsersPage() {
  return <AdminUsersPanel />;
}
