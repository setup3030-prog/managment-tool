"use client";
import { useRouter } from "next/navigation";
import { FileText, Users, LayoutDashboard, BarChart3, Settings2, Building2 } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { CUSTOMERS, getEnrichedRfqs } from "@/data/seed-data";
const ENRICHED_RFQS = getEnrichedRfqs();

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  function navigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search RFQs, customers, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/rfq")}>
            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>RFQ / Quoting</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/rfq/new")}>
            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>New RFQ</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/crm")}>
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>CRM Pipeline</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/reports")}>
            <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Reports</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/settings")}>
            <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Customers">
          {CUSTOMERS.map((customer) => (
            <CommandItem
              key={customer.id}
              onSelect={() => navigate(`/crm/${customer.id}`)}
            >
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{customer.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{customer.country}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent RFQs">
          {ENRICHED_RFQS.slice(0, 8).map((rfq) => (
            <CommandItem
              key={rfq.id}
              onSelect={() => navigate(`/rfq/${rfq.id}`)}
            >
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{rfq.rfqNumber}</span>
              <span className="ml-2 text-xs text-muted-foreground truncate">{rfq.projectName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
