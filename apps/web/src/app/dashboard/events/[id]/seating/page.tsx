import type { Metadata } from "next";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeatingPanel } from "./seating-panel";

export const metadata: Metadata = { title: "Seating Plan" };

export default async function SeatingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/events/${id}/seating/qr`}>
            <QrCode className="h-4 w-4" />
            QR Codes
          </Link>
        </Button>
      </div>

      <SeatingPanel eventId={id} />
    </div>
  );
}
