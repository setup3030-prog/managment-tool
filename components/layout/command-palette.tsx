"use client";
import { useRouter } from "next/navigation";
import { Wrench, Users, LayoutDashboard, BarChart3, Settings2, Building2, DollarSign, AlertTriangle, Users2, Factory, Target } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { CUSTOMERS } from "@/data/seed-data";

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
      <CommandInput placeholder="Search customers, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/tooling")}>
            <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Tooling Business</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/injection")}>
            <Factory className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Injection Business</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/sales")}>
            <Target className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Sales / RFQ</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/financial")}>
            <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Financial Overview</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/risks")}>
            <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Risks / Actions</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/org-chart")}>
            <Users2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Org Chart</span>
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
      </CommandList>
    </CommandDialog>
  );
}
