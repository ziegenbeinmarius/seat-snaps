import { type NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/api";
import { cookies } from "next/headers";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
const ATTENDEE_SESSION_COOKIE = "attendee-session";

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const apiPath = `/api/${path.join("/")}`;
  const url = new URL(apiPath, API_URL);
  url.search = request.nextUrl.search;

  const headers: Record<string, string> = {};

  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const jwt = await getSessionToken();
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const cookieStore = await cookies();
  const attendeeToken = cookieStore.get(ATTENDEE_SESSION_COOKIE)?.value;
  if (attendeeToken) {
    headers["Cookie"] = `${ATTENDEE_SESSION_COOKIE}=${attendeeToken}`;
  }

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const upstream = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const forwardHeaders = ["content-type", "content-disposition", "set-cookie"];
  for (const name of forwardHeaders) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
