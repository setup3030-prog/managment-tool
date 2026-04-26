import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-8xl font-bold text-muted-foreground/20">404</p>
        <h2 className="text-xl font-bold">Page not found</h2>
        <p className="text-muted-foreground text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard">
          <Button size="sm" className="gap-2"><Home size={14} />Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
