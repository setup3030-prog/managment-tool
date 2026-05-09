"use client";
import { useState } from "react";
import { Pencil, Trash2, Mail, Phone, ChevronUp, ChevronDown as ChevronDownSort } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEPT_COLORS } from "./org-node";
import { useData } from "@/context/data-context";
import { toast } from "sonner";
import type { OrgEmployee } from "@/types";

type SortKey = "name" | "position" | "department" | "manager" | "hireYear";
type SortDir = "asc" | "desc";

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

interface Props {
  employees: OrgEmployee[];
  onEdit: (e: OrgEmployee) => void;
  onCardClick: (e: OrgEmployee) => void;
}

export function OrgList({ employees, onEdit, onCardClick }: Props) {
  const { deleteEmployee } = useData();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });

  function toggleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  function handleDelete(e: OrgEmployee) {
    const reports = employees.filter(emp => emp.reportsTo === e.id);
    if (reports.length > 0) {
      toast.error("Nie można usunąć", {
        description: `${e.name} ma ${reports.length} bezpośrednich podwładnych.`,
      });
      return;
    }
    if (!confirm(`Usunąć ${e.name}?`)) return;
    deleteEmployee(e.id);
    toast.success("Pracownik usunięty");
  }

  const managerMap = new Map(employees.map(e => [e.id, e.name]));

  const sorted = [...employees].sort((a, b) => {
    let va = "", vb = "";
    switch (sort.key) {
      case "name":       va = a.name;                         vb = b.name; break;
      case "position":   va = a.position;                     vb = b.position; break;
      case "department": va = a.department;                   vb = b.department; break;
      case "manager":    va = managerMap.get(a.reportsTo ?? "") ?? ""; vb = managerMap.get(b.reportsTo ?? "") ?? ""; break;
      case "hireYear":   va = String(a.hireYear ?? 0);        vb = String(b.hireYear ?? 0); break;
    }
    return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  function Th({ label, sortKey }: { label: string; sortKey: SortKey }) {
    const active = sort.key === sortKey;
    return (
      <th
        className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => toggleSort(sortKey)}
      >
        <span className="flex items-center gap-1">
          {label}
          {active
            ? sort.dir === "asc"
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDownSort className="w-3 h-3" />
            : <ChevronUp className="w-3 h-3 opacity-20" />}
        </span>
      </th>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <Th label="Pracownik" sortKey="name" />
            <Th label="Stanowisko" sortKey="position" />
            <Th label="Dział" sortKey="department" />
            <Th label="Przełożony" sortKey="manager" />
            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Kontakt</th>
            <Th label="Od roku" sortKey="hireYear" />
            <th className="px-3 py-2.5 w-20" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(e => {
            const colors = DEPT_COLORS[e.department];
            const managerName = e.reportsTo ? managerMap.get(e.reportsTo) : null;
            return (
              <tr
                key={e.id}
                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onCardClick(e)}
              >
                {/* Name + avatar */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0",
                      colors.avatar,
                    )}>
                      {getInitials(e.name)}
                    </div>
                    <span className="font-medium text-xs whitespace-nowrap">{e.name}</span>
                  </div>
                </td>
                {/* Position */}
                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{e.position}</td>
                {/* Dept badge */}
                <td className="px-3 py-2.5">
                  <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded whitespace-nowrap", colors.bg, colors.text)}>
                    {e.department}
                  </span>
                </td>
                {/* Manager */}
                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {managerName ?? <span className="text-muted-foreground/40">—</span>}
                </td>
                {/* Contact */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2" onClick={ev => ev.stopPropagation()}>
                    <a href={`mailto:${e.email}`} className="text-muted-foreground hover:text-foreground">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    {e.phone && (
                      <a href={`tel:${e.phone}`} className="text-muted-foreground hover:text-foreground">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </td>
                {/* Hire year */}
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{e.hireYear ?? "—"}</td>
                {/* Actions */}
                <td className="px-3 py-2.5" onClick={ev => ev.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => onEdit(e)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      onClick={() => handleDelete(e)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Brak pracowników spełniających kryteria.</p>
        </div>
      )}
    </div>
  );
}
