"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Pencil, Trash2, Users2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEPT_COLORS } from "./org-node";
import { useData } from "@/context/data-context";
import { toast } from "sonner";
import type { OrgEmployee } from "@/types";

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

interface Props {
  employee: OrgEmployee | null;
  onClose: () => void;
  onEdit: (employee: OrgEmployee) => void;
}

export function EmployeeDetail({ employee, onClose, onEdit }: Props) {
  const { employees, deleteEmployee } = useData();

  if (!employee) return null;
  const emp = employee; // local non-nullable for use inside closures

  const colors = DEPT_COLORS[emp.department];
  const manager = emp.reportsTo ? employees.find(e => e.id === emp.reportsTo) : null;
  const directReports = employees.filter(e => e.reportsTo === emp.id);

  function getChain(id: string): OrgEmployee[] {
    const e = employees.find(x => x.id === id);
    if (!e || !e.reportsTo) return e ? [e] : [];
    return [...getChain(e.reportsTo), e];
  }
  const chain = getChain(emp.id);

  function handleDelete() {
    if (directReports.length > 0) {
      toast.error(`Nie można usunąć`, {
        description: `${emp.name} ma ${directReports.length} bezpośrednich podwładnych. Najpierw zmień im przełożonego.`,
      });
      return;
    }
    if (!confirm(`Usunąć ${emp.name}?`)) return;
    deleteEmployee(emp.id);
    toast.success("Pracownik usunięty");
    onClose();
  }

  return (
    <Dialog open={!!employee} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Szczegóły pracownika</DialogTitle>
        </DialogHeader>

        {/* Header card */}
        <div className={cn("rounded-xl border p-4 flex items-start gap-4", colors.bg, colors.border)}>
          <div className={cn(
            "w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold shrink-0",
            colors.avatar,
          )}>
            {getInitials(emp.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold leading-tight">{emp.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{emp.position}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded", colors.bg, colors.text)}>
                {emp.department}
              </span>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {emp.role}
              </span>
              {emp.hireYear && (
                <span className="text-[10px] text-muted-foreground">od {emp.hireYear}</span>
              )}
            </div>
          </div>
        </div>

        {/* Reporting chain */}
        {chain.length > 1 && (
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mb-2">Ścieżka hierarchii</p>
            <div className="flex items-center gap-1 flex-wrap text-xs">
              {chain.map((e, i) => (
                <span key={e.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  <span className={cn("font-medium", e.id === emp.id && colors.text)}>{e.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Manager */}
        {manager && (
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mb-1">Przełożony</p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
              <div className={cn(
                "w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0",
                DEPT_COLORS[manager.department].avatar,
              )}>
                {getInitials(manager.name)}
              </div>
              <div>
                <p className="text-xs font-semibold">{manager.name}</p>
                <p className="text-[10px] text-muted-foreground">{manager.position}</p>
              </div>
            </div>
          </div>
        )}

        {/* Direct reports */}
        {directReports.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mb-2">
              Bezpośredni podwładni ({directReports.length})
            </p>
            <div className="space-y-1.5">
              {directReports.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                  <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0",
                    DEPT_COLORS[r.department].avatar,
                  )}>
                    {getInitials(r.name)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div>
          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mb-2">Kontakt</p>
          <div className="space-y-1.5">
            <a href={`mailto:${emp.email}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-3.5 h-3.5" /> {emp.email}
            </a>
            {emp.phone && (
              <a href={`tel:${emp.phone}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-3.5 h-3.5" /> {emp.phone}
              </a>
            )}
          </div>
        </div>

        {/* Team size (if manager) */}
        {directReports.length > 0 && (
          <div className={cn("flex items-center gap-2 p-3 rounded-xl border", colors.bg, colors.border)}>
            <Users2 className={cn("w-4 h-4", colors.text)} />
            <p className="text-xs">
              <span className="font-bold">{directReports.length}</span>
              <span className="text-muted-foreground"> bezpośrednich podwładnych</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { onClose(); onEdit(emp); }}>
            <Pencil className="w-3.5 h-3.5" /> Edytuj
          </Button>
          <Button variant="outline" size="sm"
            className="gap-1.5 text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
            onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" /> Usuń
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
