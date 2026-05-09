"use client";
import { useState, useMemo } from "react";
import {
  Users2, ZoomIn, ZoomOut, RotateCcw, Search,
  Plus, LayoutList, Network, ChevronsUpDown, ChevronsDownUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useData } from "@/context/data-context";
import { OrgTree } from "@/components/org-chart/org-tree";
import { OrgList } from "@/components/org-chart/org-list";
import { DEPT_COLORS } from "@/components/org-chart/org-node";
import { EmployeeForm } from "@/components/forms/employee-form";
import { EmployeeDetail } from "@/components/org-chart/employee-detail";
import type { OrgEmployee, OrgDepartment } from "@/types";

const DEPARTMENTS: Array<"ALL" | OrgDepartment> = [
  "ALL", "Management", "Technical", "Design", "Sales", "Finance", "Quality",
];

const DEPT_LABELS: Record<string, string> = {
  ALL: "Wszystkie",
  Management: "Zarząd",
  Technical: "Produkcja",
  Design: "Konstrukcja",
  Sales: "Sprzedaż",
  Finance: "Finanse",
  Quality: "Jakość",
};

type View = "tree" | "list";

export default function OrgChartPage() {
  const { employees } = useData();

  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<"ALL" | OrgDepartment>("ALL");
  const [view, setView] = useState<View>("tree");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<OrgEmployee | undefined>();
  const [detailEmployee, setDetailEmployee] = useState<OrgEmployee | null>(null);

  // Module-level stats (recomputed only when employees changes)
  const stats = useMemo(() => {
    const total = employees.length;
    const depts = new Set(employees.map(e => e.department)).size;

    function calcDepth(id: string, depth = 0): number {
      const children = employees.filter(e => e.reportsTo === id);
      if (!children.length) return depth;
      return Math.max(...children.map(c => calcDepth(c.id, depth + 1)));
    }
    const root = employees.find(e => !e.reportsTo);
    const levels = root ? calcDepth(root.id) + 1 : 1;

    const reportCounts = new Map<string, number>();
    for (const e of employees) {
      if (e.reportsTo) reportCounts.set(e.reportsTo, (reportCounts.get(e.reportsTo) ?? 0) + 1);
    }
    const managerCounts = [...reportCounts.values()];
    const avgSpan = managerCounts.length
      ? +(managerCounts.reduce((s, n) => s + n, 0) / managerCounts.length).toFixed(1)
      : 0;

    return { total, depts, levels, avgSpan };
  }, [employees]);

  // All employee IDs with children (for expand all / collapse all)
  const parentIds = useMemo(
    () => new Set(employees.map(e => e.reportsTo).filter(Boolean) as string[]),
    [employees],
  );

  function adjustZoom(delta: number) {
    setZoom(z => Math.min(1.5, Math.max(0.4, +(z + delta).toFixed(1))));
  }

  function handleAddNew() { setEditEmployee(undefined); setFormOpen(true); }
  function handleEdit(e: OrgEmployee) { setEditEmployee(e); setFormOpen(true); }
  function handleCardClick(e: OrgEmployee) { setDetailEmployee(e); }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users2 className="w-6 h-6 text-indigo-400" /> Org Chart
            </h1>
            <p className="text-sm text-muted-foreground">Shapers Poland · April 2026</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {[
              { label: "Pracownicy",        value: stats.total },
              { label: "Działy",             value: stats.depts },
              { label: "Poziomy hierarchii", value: stats.levels },
              { label: "Avg span",           value: stats.avgSpan },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Add employee button */}
          <Button size="sm" className="gap-1.5" onClick={handleAddNew}>
            <Plus className="w-3.5 h-3.5" /> Dodaj pracownika
          </Button>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj pracownika..."
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-52"
            />
          </div>

          {/* Dept filter */}
          <div className="flex gap-1 flex-wrap">
            {DEPARTMENTS.map(d => {
              const colors = d !== "ALL" ? DEPT_COLORS[d as OrgDepartment] : null;
              return (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                    dept === d
                      ? colors
                        ? cn(colors.bg, colors.border, colors.text)
                        : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {DEPT_LABELS[d]}
                </button>
              );
            })}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Tree-only controls */}
            {view === "tree" && (
              <>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"
                  onClick={() => setCollapsed(new Set())}
                  title="Rozwiń wszystko">
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  Rozwiń
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"
                  onClick={() => setCollapsed(new Set(parentIds))}
                  title="Zwiń wszystko">
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                  Zwiń
                </Button>

                {/* Zoom */}
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjustZoom(-0.1)}>
                    <ZoomOut className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjustZoom(0.1)}>
                    <ZoomIn className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </>
            )}

            {/* View toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView("tree")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors",
                  view === "tree" ? "bg-indigo-500/15 text-indigo-300" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Network className="w-3.5 h-3.5" /> Drzewo
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs border-l border-border transition-colors",
                  view === "list" ? "bg-indigo-500/15 text-indigo-300" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <LayoutList className="w-3.5 h-3.5" /> Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      {view === "tree" ? (
        <div className="flex-1 overflow-auto bg-[hsl(var(--sidebar-background))]">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            className="transition-transform duration-150"
          >
            <OrgTree
              employees={employees}
              searchQuery={search}
              deptFilter={dept}
              collapsed={collapsed}
              onCollapsedChange={setCollapsed}
              onCardClick={handleCardClick}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <OrgList
            employees={employees.filter(e => {
              const matchDept = dept === "ALL" || e.department === dept;
              const matchSearch = !search ||
                e.name.toLowerCase().includes(search.toLowerCase()) ||
                e.position.toLowerCase().includes(search.toLowerCase());
              return matchDept && matchSearch;
            })}
            onEdit={handleEdit}
            onCardClick={handleCardClick}
          />
        </div>
      )}

      {/* Modals */}
      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        employee={editEmployee}
      />
      <EmployeeDetail
        employee={detailEmployee}
        onClose={() => setDetailEmployee(null)}
        onEdit={handleEdit}
      />
    </div>
  );
}
