import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="p-6 space-y-5">
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
