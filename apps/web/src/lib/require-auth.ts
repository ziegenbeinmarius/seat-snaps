import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAuth() {
  let session: Awaited<ReturnType<typeof auth>> | null = null;
  try {
    session = await auth();
  } catch {
    redirect("/login");
  }
  if (!session) redirect("/login");
  return session;
}
