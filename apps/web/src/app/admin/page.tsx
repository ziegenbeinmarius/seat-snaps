import type { Metadata } from "next";
import { AdminOverviewPanel } from "./admin-overview-panel";

export const metadata: Metadata = { title: "Admin Overview" };

export default function AdminPage() {
  return <AdminOverviewPanel />;
}
