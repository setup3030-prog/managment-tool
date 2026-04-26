import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerProfile } from "@/components/crm/customer-profile";
import { CUSTOMERS } from "@/data/seed-data";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const customer = CUSTOMERS.find((c) => c.id === id);
  return { title: customer?.name ?? "Customer" };
}

export default async function CustomerPage({ params }: Props) {
  const { id } = await params;
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) notFound();

  return (
    <div className="p-6 max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/crm">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft size={14} />
            Pipeline
          </Button>
        </Link>
      </div>
      <CustomerProfile customer={customer} />
    </div>
  );
}
