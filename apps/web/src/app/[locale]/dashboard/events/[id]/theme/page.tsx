import type { Metadata } from "next";
import { ThemeEditor } from "./theme-editor";

export const metadata: Metadata = { title: "Theme" };

export default async function ThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Event theme</h2>
        <p className="text-sm text-muted-foreground">
          Customize colors and branding shown to attendees.
        </p>
      </div>
      <ThemeEditor eventId={id} />
    </div>
  );
}
