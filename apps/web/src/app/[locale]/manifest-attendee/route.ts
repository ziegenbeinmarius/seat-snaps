import { NextResponse } from "next/server";

const BASE_MANIFEST = {
  name: "SeatSnaps",
  short_name: "SeatSnaps",
  description: "Your event companion — schedule, seating, and more",
  scope: "/",
  display: "standalone",
  background_color: "#f5ede0",
  theme_color: "#a07850",
  orientation: "portrait",
  categories: ["entertainment", "lifestyle"],
};

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId")?.trim();

  const safeEventId = eventId && /^[a-zA-Z0-9-]+$/.test(eventId) ? eventId : null;
  const startUrl = safeEventId ? `/event/${safeEventId}` : "/attend";

  return NextResponse.json({
    ...BASE_MANIFEST,
    start_url: startUrl,
  });
}
