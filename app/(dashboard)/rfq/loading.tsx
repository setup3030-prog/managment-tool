import { Skeleton } from "@/components/ui/skeleton";

export default function RfqLoading() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-2">
        {[52, 44, 40, 32].map((w, i) => <Skeleton key={i} className={`h-9 w-${w}`} />)}
      </div>
      <Skeleton className="h-[500px] rounded-xl" />
    </div>
  );
}
