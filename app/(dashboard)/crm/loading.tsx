import { Skeleton } from "@/components/ui/skeleton";

export default function CrmLoading() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="flex gap-4 overflow-x-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-64 shrink-0 space-y-2">
            <Skeleton className="h-8 rounded-lg" />
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, j) => (
              <Skeleton key={j} className="h-28 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
