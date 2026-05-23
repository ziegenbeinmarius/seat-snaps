import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { QrPanel } from "./qr-panel";

export const metadata: Metadata = { title: "QR Codes" };

export default async function QrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/events/${id}/seating`}>
            <ArrowLeft className="h-4 w-4" />
            Seating Plan
          </Link>
        </Button>
      </div>
      <div className="text-muted-foreground text-sm">Bulk QR codes are now in the Attendees section.</div>
      {/* Deprecated QR codes button removed */}
    </div>
  );
}
