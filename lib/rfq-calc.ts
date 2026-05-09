import type { InjectionMaterial, RfqCostCalc } from "@/types";

export const MATERIAL_PRESETS: Record<InjectionMaterial, number> = {
  PP:       1.20,
  "PP+GF30": 1.80,
  PA66:     3.20,
  PA6:      2.80,
  ABS:      2.10,
  PC:       2.90,
  POM:      2.40,
  PBT:      3.10,
  PE:       1.10,
  TPE:      2.50,
};

export const INJECTION_MATERIALS: InjectionMaterial[] = [
  "PP", "PP+GF30", "PA66", "PA6", "ABS", "PC", "POM", "PBT", "PE", "TPE",
];

export interface RfqCostResults {
  partsPerHour: number;
  materialCostPerPart: number;
  machineCostPerPart: number;
  laborCostPerPart: number;
  directCostPerPart: number;
  toolingPerPart: number;
  variableCostPerPart: number;
  sgaPerPart: number;
  totalCostPerPart: number;
  salesPricePerPart: number;
  marginPerPart: number;
  grossMarginPct: number;
  bepUnits: number;
  annualRevenue: number;
  annualProfit: number;
  annualProfitPct: number;
}

export function calcRfqCosts(c: RfqCostCalc, toolingCost: number): RfqCostResults {
  const partsPerHour = c.cycleTimeSec > 0 ? (3600 / c.cycleTimeSec) * c.cavities : 0;
  const materialCostPerPart = partsPerHour > 0
    ? (c.weightGrams / 1000) * c.materialCostPerKg / (1 - Math.min(c.scrapPct, 99) / 100)
    : 0;
  const machineCostPerPart = partsPerHour > 0 ? c.machineRatePerHr / partsPerHour : 0;
  const laborCostPerPart  = partsPerHour > 0 ? c.laborRatePerHr  / partsPerHour : 0;
  const directCostPerPart = materialCostPerPart + machineCostPerPart + laborCostPerPart
    + c.packagingCostPerPart + c.logisticsCostPerPart;
  const toolingPerPart    = c.annualVolume > 0 ? toolingCost / c.annualVolume : 0;
  const variableCostPerPart = directCostPerPart + toolingPerPart;
  const sgaPerPart        = variableCostPerPart * (c.sgaPct / 100);
  const totalCostPerPart  = variableCostPerPart + sgaPerPart;
  const salesPricePerPart = c.targetMarginPct < 100
    ? totalCostPerPart / (1 - c.targetMarginPct / 100)
    : 0;
  const marginPerPart     = salesPricePerPart - totalCostPerPart;
  const grossMarginPct    = salesPricePerPart > 0
    ? ((salesPricePerPart - directCostPerPart) / salesPricePerPart) * 100
    : 0;
  const contribution      = salesPricePerPart - directCostPerPart - sgaPerPart;
  const bepUnits          = contribution > 0 ? Math.ceil(toolingCost / contribution) : 0;
  const annualRevenue     = salesPricePerPart * c.annualVolume;
  const annualProfit      = marginPerPart * c.annualVolume;
  const annualProfitPct   = annualRevenue > 0 ? (annualProfit / annualRevenue) * 100 : 0;

  return {
    partsPerHour, materialCostPerPart, machineCostPerPart, laborCostPerPart,
    directCostPerPart, toolingPerPart, variableCostPerPart, sgaPerPart,
    totalCostPerPart, salesPricePerPart, marginPerPart, grossMarginPct,
    bepUnits, annualRevenue, annualProfit, annualProfitPct,
  };
}
