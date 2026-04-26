"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ToolingProject, RiskAction, CashFlowItem, InjectionPart } from "@/types";
import {
  TOOLING_PROJECTS as SEED_PROJECTS,
  RISK_ACTIONS as SEED_RISKS,
  CASH_FLOW_ITEMS as SEED_CASH,
  INJECTION_PARTS as SEED_PARTS,
} from "@/data/seed-data";

// ─── localStorage keys ────────────────────────────────────────────────────────
const KEYS = {
  projects:  "shapers_projects",
  risks:     "shapers_risks",
  cashflow:  "shapers_cashflow",
  parts:     "shapers_parts",
  overrideProjects: "shapers_override_projects",
  overrideRisks:    "shapers_override_risks",
  deleted:   "shapers_deleted",
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
  injectionParts: InjectionPart[];
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
  // Injection parts
  addInjectionPart: (p: Omit<InjectionPart, "id">) => void;
  updateInjectionPart: (id: string, p: Partial<InjectionPart>) => void;
  deleteInjectionPart: (id: string) => void;
  // Reset
  resetToSeedData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: React.ReactNode }) {
  // User-added items
  const [localProjects, setLocalProjects] = useState<ToolingProject[]>([]);
  const [localRisks,    setLocalRisks]    = useState<RiskAction[]>([]);
  const [localCash,     setLocalCash]     = useState<CashFlowItem[]>([]);
  const [localParts,    setLocalParts]    = useState<InjectionPart[]>([]);

  // Overrides for seed items (edits to existing seed data)
  const [overrideProjects, setOverrideProjects] = useState<Record<string, ToolingProject>>({});
  const [overrideRisks,    setOverrideRisks]    = useState<Record<string, RiskAction>>({});

  // IDs deleted from seed data
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Hydrate from localStorage on mount
  useEffect(() => {
    setLocalProjects(load<ToolingProject>(KEYS.projects));
    setLocalRisks(load<RiskAction>(KEYS.risks));
    setLocalCash(load<CashFlowItem>(KEYS.cashflow));
    setLocalParts(load<InjectionPart>(KEYS.parts));
    setOverrideProjects(loadMap<ToolingProject>(KEYS.overrideProjects));
    setOverrideRisks(loadMap<RiskAction>(KEYS.overrideRisks));
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

  const injectionParts: InjectionPart[] = [
    ...SEED_PARTS.filter(p => !deletedIds.has(p.id)),
    ...localParts,
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

  // ── Injection Parts ──
  const addInjectionPart = useCallback((data: Omit<InjectionPart, "id">) => {
    const item: InjectionPart = { ...data, id: `ip-${Date.now()}` };
    setLocalParts(prev => { const next = [...prev, item]; save(KEYS.parts, next); return next; });
  }, []);

  const updateInjectionPart = useCallback((id: string, updates: Partial<InjectionPart>) => {
    setLocalParts(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      save(KEYS.parts, next);
      return next;
    });
  }, []);

  const deleteInjectionPart = useCallback((id: string) => {
    markDeleted(id);
    setLocalParts(prev => { const next = prev.filter(p => p.id !== id); save(KEYS.parts, next); return next; });
  }, [deletedIds]);

  // ── Reset ──
  const resetToSeedData = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setLocalProjects([]); setLocalRisks([]); setLocalCash([]); setLocalParts([]);
    setOverrideProjects({}); setOverrideRisks({});
    setDeletedIds(new Set());
  }, []);

  return (
    <DataContext.Provider value={{
      toolingProjects, riskActions, cashFlowItems, injectionParts,
      addToolingProject, updateToolingProject, deleteToolingProject,
      addRiskAction, updateRiskAction, deleteRiskAction,
      addCashFlowItem, deleteCashFlowItem,
      addInjectionPart, updateInjectionPart, deleteInjectionPart,
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
