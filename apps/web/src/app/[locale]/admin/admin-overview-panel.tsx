"use client";

import { useAdminMetrics } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminOverviewPanel() {
  const { data: metrics, isLoading, error } = useAdminMetrics();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <p className="text-destructive">Failed to load metrics: {error.message}</p>;
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={metrics.totalUsers} />
        <StatCard label="Total Events" value={metrics.totalEvents} />
        <StatCard label="Total Attendees" value={metrics.totalAttendees} />
        <StatCard label="Total Photos" value={metrics.totalPhotos} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="New Users This Month" value={metrics.usersThisMonth} />
        <StatCard label="New Events This Month" value={metrics.eventsThisMonth} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.eventsByType.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet</p>
            ) : (
              <div className="space-y-3">
                {metrics.eventsByType.map((entry) => (
                  <div key={entry.type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{entry.type}</span>
                    <span className="text-sm font-medium">{entry.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} &middot; {event.attendeeCount} attendees
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
