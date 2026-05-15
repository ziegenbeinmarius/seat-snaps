import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/api";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json(null, { status: 401 });
  return NextResponse.json({ token });
}
