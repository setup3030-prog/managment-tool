import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-56 mb-2" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
