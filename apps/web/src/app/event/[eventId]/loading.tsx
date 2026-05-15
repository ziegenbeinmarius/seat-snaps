import { Skeleton } from "@/components/ui/skeleton";

export default function AttendeeLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 pb-8 pt-10">
        <Skeleton className="mb-2 h-5 w-24 bg-white/20" />
        <Skeleton className="h-8 w-3/4 bg-white/20" />
        <Skeleton className="mt-2 h-4 w-1/2 bg-white/20" />
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <Skeleton className="h-3 w-16" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
