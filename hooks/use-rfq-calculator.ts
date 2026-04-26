import type { RfqCalculatorInputs, RfqCalculatorResult } from "@/types";

export function calculateRfq(inputs: RfqCalculatorInputs): RfqCalculatorResult {
  const {
    partWeight,
    cycleTime,
    cavities,
    scrapPct,
    materialCostPerKg,
    machineRate,
    laborCost,
    packagingCost,
    logisticsCost,
    toolingCost,
    sgaPct,
    targetMarginPct,
    annualVolume,
  } = inputs;

  const safeVol = annualVolume > 0 ? annualVolume : 1;
  const safeCycleTime = cycleTime > 0 ? cycleTime : 1;
  const safeCavities = cavities > 0 ? cavities : 1;
  const safeScrap = Math.min(Math.max(scrapPct, 0), 99) / 100;

  const partsPerHour = (3600 / safeCycleTime) * safeCavities;

  const rawMaterialCost = partWeight * materialCostPerKg;
  const materialCostPerPart = rawMaterialCost / (1 - safeScrap);
  const scrapAllowance = materialCostPerPart - rawMaterialCost;

  const machineCostPerPart = partsPerHour > 0 ? machineRate / partsPerHour : 0;
  const laborCostPerPart = partsPerHour > 0 ? laborCost / partsPerHour : 0;

  const directCostPerPart =
    materialCostPerPart +
    machineCostPerPart +
    laborCostPerPart +
    packagingCost +
    logisticsCost;

  const toolingPerPart = toolingCost / safeVol;
  const totalVariableCost = directCostPerPart + toolingPerPart;

  const sgaPerPart = totalVariableCost * (sgaPct / 100);
  const partCost = totalVariableCost + sgaPerPart;

  const safeMargin = Math.min(Math.max(targetMarginPct, 0), 99.9) / 100;
  const salesPrice = partCost / (1 - safeMargin);

  const grossMargin = salesPrice - partCost;
  const grossMarginPct = salesPrice > 0 ? (grossMargin / salesPrice) * 100 : 0;

  const annualRevenue = salesPrice * safeVol;
  const annualProfit = grossMargin * safeVol;

  const contributionMargin = salesPrice - directCostPerPart - sgaPerPart;
  const breakevenQty =
    contributionMargin > 0 ? toolingCost / contributionMargin : Infinity;

  return {
    materialCostPerPart,
    machineCostPerPart,
    laborCostPerPart,
    scrapAllowance,
    directCostPerPart,
    toolingPerPart,
    totalVariableCost,
    sgaPerPart,
    partCost,
    salesPrice,
    grossMargin,
    grossMarginPct,
    annualRevenue,
    annualProfit,
    breakevenQty,
    contributionMargin,
  };
}
