"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <AlertOctagon className="w-7 h-7 text-destructive" />
      </div>
      <div>
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm mt-1">{error.message ?? "An unexpected error occurred"}</p>
      </div>
      <Button onClick={reset} size="sm">Try again</Button>
    </div>
  );
}
