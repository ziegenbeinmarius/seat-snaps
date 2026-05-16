import type { Metadata } from "next";
import { AdminEventsPanel } from "./admin-events-panel";

export const metadata: Metadata = { title: "Admin - Events" };

export default function AdminEventsPage() {
  return <AdminEventsPanel />;
}
