import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RfqForm } from "@/components/rfq/rfq-form";

export const metadata: Metadata = { title: "New RFQ" };

export default function NewRfqPage() {
  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/rfq">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft size={14} />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New RFQ</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create a new quotation request</p>
        </div>
      </div>
      <RfqForm mode="create" />
    </div>
  );
}
