"use client";
import { ChevronDown, ChevronRight, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgEmployee, OrgDepartment } from "@/types";

export const DEPT_COLORS: Record<OrgDepartment, { bg: string; border: string; ring: string; text: string; avatar: string }> = {
  Management: {
    bg: "bg-indigo-500/10", border: "border-indigo-500/30", ring: "ring-indigo-500/30",
    text: "text-indigo-300", avatar: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  Technical: {
    bg: "bg-blue-500/10", border: "border-blue-500/30", ring: "ring-blue-500/30",
    text: "text-blue-300", avatar: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  Design: {
    bg: "bg-violet-500/10", border: "border-violet-500/30", ring: "ring-violet-500/30",
    text: "text-violet-300", avatar: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  Sales: {
    bg: "bg-emerald-500/10", border: "border-emerald-500/30", ring: "ring-emerald-500/30",
    text: "text-emerald-300", avatar: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  Finance: {
    bg: "bg-amber-500/10", border: "border-amber-500/30", ring: "ring-amber-500/30",
    text: "text-amber-300", avatar: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  Quality: {
    bg: "bg-rose-500/10", border: "border-rose-500/30", ring: "ring-rose-500/30",
    text: "text-rose-300", avatar: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
};

export function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

interface OrgNodeProps {
  employee: OrgEmployee;
  directReports: number;
  collapsed: boolean;
  onToggle: () => void;
  onCardClick: (employee: OrgEmployee) => void;
  highlighted: boolean;
  dimmed: boolean;
}

export function OrgNode({ employee, directReports, collapsed, onToggle, onCardClick, highlighted, dimmed }: OrgNodeProps) {
  const colors = DEPT_COLORS[employee.department];
  const hasChildren = directReports > 0;

  return (
    <div
      className={cn(
        "group relative w-44 rounded-xl border p-3 transition-all duration-200 select-none cursor-pointer",
        "bg-card hover:shadow-lg",
        highlighted ? cn(colors.bg, colors.border, "ring-1", colors.ring) : "border-border",
        dimmed && "opacity-30",
      )}
      onClick={() => onCardClick(employee)}
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className={cn(
          "w-9 h-9 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold",
          colors.avatar,
        )}>
          {getInitials(employee.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight truncate">{employee.name}</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
            {employee.position}
          </p>
        </div>
      </div>

      {/* Dept badge + collapse toggle */}
      <div className="flex items-center justify-between gap-1">
        <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded", colors.bg, colors.text)}>
          {employee.department}
        </span>
        {hasChildren && (
          <button
            className={cn("flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded")}
            onClick={e => { e.stopPropagation(); onToggle(); }}
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{directReports}</span>
          </button>
        )}
      </div>

      {/* Contact icons on hover */}
      <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={`mailto:${employee.email}`} onClick={e => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground">
          <Mail className="w-3 h-3" />
        </a>
        {employee.phone && (
          <a href={`tel:${employee.phone}`} onClick={e => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground">
            <Phone className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
