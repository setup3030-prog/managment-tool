"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ToolingProject, RiskAction, CashFlowItem, OrgEmployee, RFQ } from "@/types";
import {
  TOOLING_PROJECTS as SEED_PROJECTS,
  RISK_ACTIONS as SEED_RISKS,
  CASH_FLOW_ITEMS as SEED_CASH,
  EMPLOYEES as SEED_EMPLOYEES,
  RFQS as SEED_RFQS,
} from "@/data/seed-data";

// ─── localStorage keys ────────────────────────────────────────────────────────
const KEYS = {
  projects:  "rocco_tools_projects",
  risks:     "rocco_tools_risks",
  cashflow:  "rocco_tools_cashflow",
  overrideProjects:  "rocco_tools_override_projects",
  overrideRisks:     "rocco_tools_override_risks",
  employees:         "rocco_tools_employees",
  overrideEmployees: "rocco_tools_override_employees",
  rfqs:              "rocco_tools_rfqs",
  overrideRfqs:      "rocco_tools_override_rfqs",
  deleted:   "rocco_tools_deleted",
};

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); }
  catch { return []; }
}
function loadMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(key) ?? "{}"); }
  catch { return {}; }
}
function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Context types ────────────────────────────────────────────────────────────
interface DataContextType {
  // Data
  toolingProjects: ToolingProject[];
  riskActions: RiskAction[];
  cashFlowItems: CashFlowItem[];
  employees: OrgEmployee[];
  rfqs: RFQ[];
  // Tooling projects
  addToolingProject: (p: Omit<ToolingProject, "id">) => void;
  updateToolingProject: (id: string, p: Partial<ToolingProject>) => void;
  deleteToolingProject: (id: string) => void;
  // Risks
  addRiskAction: (r: Omit<RiskAction, "id">) => void;
  updateRiskAction: (id: string, r: Partial<RiskAction>) => void;
  deleteRiskAction: (id: string) => void;
  // Cash flow
  addCashFlowItem: (c: Omit<CashFlowItem, "id">) => void;
  deleteCashFlowItem: (id: string) => void;
  // Employees
  addEmployee: (e: Omit<OrgEmployee, "id">) => void;
  updateEmployee: (id: string, e: Partial<OrgEmployee>) => void;
  deleteEmployee: (id: string) => void;
  // RFQs
  addRfq: (r: Omit<RFQ, "id">) => void;
  updateRfq: (id: string, r: Partial<RFQ>) => void;
  deleteRfq: (id: string) => void;
  // Reset
  resetToSeedData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: React.ReactNode }) {
  // User-added items
  const [localProjects,   setLocalProjects]   = useState<ToolingProject[]>([]);
  const [localRisks,      setLocalRisks]      = useState<RiskAction[]>([]);
  const [localCash,       setLocalCash]       = useState<CashFlowItem[]>([]);
  const [localEmployees,  setLocalEmployees]  = useState<OrgEmployee[]>([]);
  const [localRfqs,       setLocalRfqs]       = useState<RFQ[]>([]);

  // Overrides for seed items (edits to existing seed data)
  const [overrideProjects,   setOverrideProjects]   = useState<Record<string, ToolingProject>>({});
  const [overrideRisks,      setOverrideRisks]      = useState<Record<string, RiskAction>>({});
  const [overrideEmployees,  setOverrideEmployees]  = useState<Record<string, OrgEmployee>>({});
  const [overrideRfqs,       setOverrideRfqs]       = useState<Record<string, RFQ>>({});

  // IDs deleted from seed data
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Hydrate from localStorage on mount
  useEffect(() => {
    setLocalProjects(load<ToolingProject>(KEYS.projects));
    setLocalRisks(load<RiskAction>(KEYS.risks));
    setLocalCash(load<CashFlowItem>(KEYS.cashflow));
    setLocalEmployees(load<OrgEmployee>(KEYS.employees));
    setLocalRfqs(load<RFQ>(KEYS.rfqs));
    setOverrideProjects(loadMap<ToolingProject>(KEYS.overrideProjects));
    setOverrideRisks(loadMap<RiskAction>(KEYS.overrideRisks));
    setOverrideEmployees(loadMap<OrgEmployee>(KEYS.overrideEmployees));
    setOverrideRfqs(loadMap<RFQ>(KEYS.overrideRfqs));
    setDeletedIds(new Set(load<string>(KEYS.deleted)));
  }, []);

  // ── Merged views ──
  const toolingProjects: ToolingProject[] = [
    ...SEED_PROJECTS
      .filter(p => !deletedIds.has(p.id))
      .map(p => overrideProjects[p.id] ?? p),
    ...localProjects,
  ];

  const riskActions: RiskAction[] = [
    ...SEED_RISKS
      .filter(r => !deletedIds.has(r.id))
      .map(r => overrideRisks[r.id] ?? r),
    ...localRisks,
  ];

  const cashFlowItems: CashFlowItem[] = [
    ...SEED_CASH.filter(c => !deletedIds.has(c.id)),
    ...localCash,
  ];

  const employees: OrgEmployee[] = [
    ...SEED_EMPLOYEES
      .filter(e => !deletedIds.has(e.id))
      .map(e => overrideEmployees[e.id] ?? e),
    ...localEmployees,
  ];

  const rfqs: RFQ[] = [
    ...SEED_RFQS
      .filter(r => !deletedIds.has(r.id))
      .map(r => overrideRfqs[r.id] ?? r),
    ...localRfqs,
  ];

  // ── Helpers ──
  function markDeleted(id: string) {
    const next = new Set([...deletedIds, id]);
    setDeletedIds(next);
    save(KEYS.deleted, [...next]);
  }

  // ── Tooling Projects ──
  const addToolingProject = useCallback((data: Omit<ToolingProject, "id">) => {
    const item: ToolingProject = { ...data, id: `tp-${Date.now()}` };
    setLocalProjects(prev => { const next = [...prev, item]; save(KEYS.projects, next); return next; });
  }, []);

  const updateToolingProject = useCallback((id: string, updates: Partial<ToolingProject>) => {
    const isSeed = SEED_PROJECTS.some(p => p.id === id);
    if (isSeed) {
      setOverrideProjects(prev => {
        const base = prev[id] ?? SEED_PROJECTS.find(p => p.id === id)!;
        const next = { ...prev, [id]: { ...base, ...updates } };
        save(KEYS.overrideProjects, next);
        return next;
      });
    } else {
      setLocalProjects(prev => {
        const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
        save(KEYS.projects, next);
        return next;
      });
    }
  }, []);

  const deleteToolingProject = useCallback((id: string) => {
    markDeleted(id);
    setLocalProjects(prev => { const next = prev.filter(p => p.id !== id); save(KEYS.projects, next); return next; });
  }, [deletedIds]);

  // ── Risk Actions ──
  const addRiskAction = useCallback((data: Omit<RiskAction, "id">) => {
    const item: RiskAction = { ...data, id: `ra-${Date.now()}` };
    setLocalRisks(prev => { const next = [...prev, item]; save(KEYS.risks, next); return next; });
  }, []);

  const updateRiskAction = useCallback((id: string, updates: Partial<RiskAction>) => {
    const isSeed = SEED_RISKS.some(r => r.id === id);
    if (isSeed) {
      setOverrideRisks(prev => {
        const base = prev[id] ?? SEED_RISKS.find(r => r.id === id)!;
        const next = { ...prev, [id]: { ...base, ...updates } };
        save(KEYS.overrideRisks, next);
        return next;
      });
    } else {
      setLocalRisks(prev => {
        const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
        save(KEYS.risks, next);
        return next;
      });
    }
  }, []);

  const deleteRiskAction = useCallback((id: string) => {
    markDeleted(id);
    setLocalRisks(prev => { const next = prev.filter(r => r.id !== id); save(KEYS.risks, next); return next; });
  }, [deletedIds]);

  // ── Cash Flow ──
  const addCashFlowItem = useCallback((data: Omit<CashFlowItem, "id">) => {
    const item: CashFlowItem = { ...data, id: `cf-${Date.now()}` };
    setLocalCash(prev => { const next = [...prev, item]; save(KEYS.cashflow, next); return next; });
  }, []);

  const deleteCashFlowItem = useCallback((id: string) => {
    markDeleted(id);
    setLocalCash(prev => { const next = prev.filter(c => c.id !== id); save(KEYS.cashflow, next); return next; });
  }, [deletedIds]);

  // ── Employees ──
  const addEmployee = useCallback((data: Omit<OrgEmployee, "id">) => {
    const item: OrgEmployee = { ...data, id: `emp-${Date.now()}` };
    setLocalEmployees(prev => { const next = [...prev, item]; save(KEYS.employees, next); return next; });
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<OrgEmployee>) => {
    const isSeed = SEED_EMPLOYEES.some(e => e.id === id);
    if (isSeed) {
      setOverrideEmployees(prev => {
        const base = prev[id] ?? SEED_EMPLOYEES.find(e => e.id === id)!;
        const next = { ...prev, [id]: { ...base, ...updates } };
        save(KEYS.overrideEmployees, next);
        return next;
      });
    } else {
      setLocalEmployees(prev => {
        const next = prev.map(e => e.id === id ? { ...e, ...updates } : e);
        save(KEYS.employees, next);
        return next;
      });
    }
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    markDeleted(id);
    setLocalEmployees(prev => { const next = prev.filter(e => e.id !== id); save(KEYS.employees, next); return next; });
  }, [deletedIds]);

  // ── RFQs ──
  const addRfq = useCallback((data: Omit<RFQ, "id">) => {
    const item: RFQ = { ...data, id: `rq-${Date.now()}` };
    setLocalRfqs(prev => { const next = [...prev, item]; save(KEYS.rfqs, next); return next; });
  }, []);

  const updateRfq = useCallback((id: string, updates: Partial<RFQ>) => {
    const isSeed = SEED_RFQS.some(r => r.id === id);
    if (isSeed) {
      setOverrideRfqs(prev => {
        const base = prev[id] ?? SEED_RFQS.find(r => r.id === id)!;
        const next = { ...prev, [id]: { ...base, ...updates } };
        save(KEYS.overrideRfqs, next);
        return next;
      });
    } else {
      setLocalRfqs(prev => {
        const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
        save(KEYS.rfqs, next);
        return next;
      });
    }
  }, []);

  const deleteRfq = useCallback((id: string) => {
    markDeleted(id);
    setLocalRfqs(prev => { const next = prev.filter(r => r.id !== id); save(KEYS.rfqs, next); return next; });
  }, [deletedIds]);

  // ── Reset ──
  const resetToSeedData = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setLocalProjects([]); setLocalRisks([]); setLocalCash([]); setLocalEmployees([]); setLocalRfqs([]);
    setOverrideProjects({}); setOverrideRisks({}); setOverrideEmployees({}); setOverrideRfqs({});
    setDeletedIds(new Set());
  }, []);

  return (
    <DataContext.Provider value={{
      toolingProjects, riskActions, cashFlowItems, employees, rfqs,
      addToolingProject, updateToolingProject, deleteToolingProject,
      addRiskAction, updateRiskAction, deleteRiskAction,
      addCashFlowItem, deleteCashFlowItem,
      addEmployee, updateEmployee, deleteEmployee,
      addRfq, updateRfq, deleteRfq,
      resetToSeedData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within <DataProvider>");
  return ctx;
}
