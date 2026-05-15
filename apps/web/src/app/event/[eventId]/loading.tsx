import { Skeleton } from "@/components/ui/skeleton";

const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.18)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  borderRadius: "1rem",
  padding: "1rem",
};

export default function AttendeeLoading() {
  return (
    <div className="min-h-screen px-4 pb-6 pt-10">
      {/* Hero skeleton — directly on gradient, so white shimmer */}
      <div className="mb-6 space-y-2 px-2">
        <Skeleton className="h-6 w-24 rounded-full bg-white/15" />
        <Skeleton className="h-8 w-3/4 bg-white/20" />
        <Skeleton className="mt-1 h-4 w-1/2 bg-white/15" />
        <Skeleton className="mt-3 h-5 w-1/3 bg-white/15" />
      </div>

      <div className="space-y-3">
        <div style={glassCard} className="space-y-3">
          <Skeleton className="h-3 w-20 bg-white/20" />
          <Skeleton className="h-16 w-full rounded-xl bg-white/15" />
        </div>
        <div style={glassCard} className="space-y-3">
          <Skeleton className="h-3 w-16 bg-white/20" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl bg-white/15" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2 bg-white/20" />
              <Skeleton className="h-4 w-1/3 bg-white/15" />
            </div>
          </div>
        </div>
        <div style={glassCard} className="space-y-3">
          <Skeleton className="h-3 w-14 bg-white/20" />
          <Skeleton className="h-4 w-full bg-white/15" />
          <Skeleton className="h-4 w-5/6 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
