"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CUSTOMERS } from "@/data/seed-data";
import type { RfqStatus } from "@/types";
import { useCallback, useTransition } from "react";

const STATUSES: { value: RfqStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "COSTING", label: "Costing" },
  { value: "WAITING_FOR_SUPPLIER", label: "Waiting for Supplier" },
  { value: "SENT", label: "Sent" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

export function RfqFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const customer = searchParams.get("customer") ?? "";
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`/rfq?${params.toString()}`));
  }

  function reset() {
    startTransition(() => router.replace("/rfq"));
  }

  const hasFilters = customer || status || search;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search RFQ, project, customer..."
        value={search}
        onChange={(e) => update("search", e.target.value)}
        className="h-9 w-52"
      />
      <Select value={customer} onValueChange={(v) => update("customer", v === "_all" ? "" : v)}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="All customers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All customers</SelectItem>
          {CUSTOMERS.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={(v) => update("status", v === "_all" ? "" : v)}>
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={reset} className="h-9 gap-1.5 text-muted-foreground">
          <X size={13} />
          Reset
        </Button>
      )}
    </div>
  );
}
