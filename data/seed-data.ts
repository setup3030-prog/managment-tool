import type {
  Customer, Claim, PipelineDeal, Material, KpiSnapshot,
  UserProfile, AppSettings, ToolingProject, WarrantyClaim, Machine,
  FinancialPeriod, CashFlowItem, RiskAction, CeoAlert, OrgEmployee,
  InjectionPart, InjectionPress, ProductionOrder, RFQ,
} from "@/types";

// ─── Customers ────────────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "BMW AG", shortName: "BMW", country: "DE", segment: "OEM",
    contacts: [{ name: "Klaus Richter", role: "Purchasing Manager", email: "k.richter@bmw.de", phone: "+49 89 382-0" }],
    annualRevenue: 1240000, creditLimit: 500000, paymentTerms: 60 },
  { id: "c2", name: "Robert Bosch GmbH", shortName: "Bosch", country: "DE", segment: "Tier1",
    contacts: [{ name: "Stefan Mayer", role: "SQE Manager", email: "s.mayer@bosch.com" }],
    annualRevenue: 890000, creditLimit: 400000, paymentTerms: 45 },
  { id: "c3", name: "Continental AG", shortName: "Continental", country: "DE", segment: "Tier1",
    contacts: [{ name: "Petra Schulz", role: "Procurement", email: "p.schulz@continental.com" }],
    annualRevenue: 760000, creditLimit: 350000, paymentTerms: 60 },
  { id: "c4", name: "Valeo Systems", shortName: "Valeo", country: "FR", segment: "Tier1",
    contacts: [{ name: "Pierre Dubois", role: "Tooling Manager", email: "p.dubois@valeo.com" }],
    annualRevenue: 540000, creditLimit: 250000, paymentTerms: 60 },
  { id: "c5", name: "Magna International", shortName: "Magna", country: "CA", segment: "Tier1",
    contacts: [{ name: "John Smith", role: "Tooling Engineer", email: "j.smith@magna.com" }],
    annualRevenue: 480000, creditLimit: 200000, paymentTerms: 45 },
  { id: "c6", name: "Faurecia SE", shortName: "Faurecia", country: "FR", segment: "Tier1",
    contacts: [{ name: "Antoine Martin", role: "PM", email: "a.martin@faurecia.com" }],
    annualRevenue: 420000, creditLimit: 200000, paymentTerms: 60 },
  { id: "c7", name: "Stellantis NV", shortName: "Stellantis", country: "NL", segment: "OEM",
    contacts: [{ name: "Marco Rossi", role: "SQA", email: "m.rossi@stellantis.com" }],
    annualRevenue: 380000, creditLimit: 180000, paymentTerms: 90 },
  { id: "c8", name: "ZF Friedrichshafen", shortName: "ZF", country: "DE", segment: "Tier1",
    contacts: [{ name: "Hans Weber", role: "Tooling Buyer", email: "h.weber@zf.com" }],
    annualRevenue: 520000, creditLimit: 250000, paymentTerms: 45 },
  { id: "c9", name: "Aptiv PLC", shortName: "Aptiv", country: "IE", segment: "Tier1",
    contacts: [{ name: "Brian O'Neill", role: "Engineering", email: "b.oneill@aptiv.com" }],
    annualRevenue: 310000, creditLimit: 150000, paymentTerms: 45 },
  { id: "c10", name: "Hella GmbH", shortName: "Hella", country: "DE", segment: "Tier1",
    contacts: [{ name: "Markus Lang", role: "PM", email: "m.lang@hella.com" }],
    annualRevenue: 430000, creditLimit: 200000, paymentTerms: 30 },
];

// ─── Tooling Projects ─────────────────────────────────────────────────────────

export const TOOLING_PROJECTS: ToolingProject[] = [
  {
    id: "tp1", toolNo: "T-2024-001", customer: "BMW AG",
    description: "Door Panel Inner – B-Pillar Bracket", serviceType: "NEW_TOOL",
    quotedRevenue: 87500, quotedCost: 71750, estimatedFinalCost: 94200,
    completionPct: 78, startDate: "2024-10-01", eta: "2026-06-15",
    riskLevel: "HIGH", status: "ACTIVE",
    costBreakdown: { steelCost: 24000, hotRunnerCost: 18500, purchasedComponents: 8000,
      designHoursPlanned: 180, designHoursActual: 185, camHoursPlanned: 120, camHoursActual: 128,
      cncHoursPlanned: 380, cncHoursActual: 405, edmHoursPlanned: 85, edmHoursActual: 88,
      fittingHoursPlanned: 220, fittingHoursActual: 265, tryoutLoops: 3 },
    milestones: [
      { name: "Down Payment 30%", pct: 30, plannedDate: "2024-10-15", actualDate: "2024-10-18", invoiceAmount: 26250, invoiceStatus: "PAID" },
      { name: "Design Approval 30%", pct: 30, plannedDate: "2025-01-31", actualDate: "2025-02-10", invoiceAmount: 26250, invoiceStatus: "PAID" },
      { name: "Steel Order 20%", pct: 20, plannedDate: "2025-06-30", actualDate: "2025-07-05", invoiceAmount: 17500, invoiceStatus: "PAID" },
      { name: "FAT / Delivery 20%", pct: 20, plannedDate: "2026-06-15", invoiceAmount: 17500, invoiceStatus: "PLANNED" },
    ],
    openECOs: 2, tryoutCount: 3, wip: 73400,
  },
  {
    id: "tp2", toolNo: "T-2024-002", customer: "Robert Bosch GmbH",
    description: "Connector Housing 4-Pin Series B", serviceType: "NEW_TOOL",
    quotedRevenue: 42000, quotedCost: 33600, estimatedFinalCost: 38200,
    completionPct: 95, startDate: "2024-11-15", eta: "2026-04-30",
    riskLevel: "LOW", status: "ACTIVE",
    costBreakdown: { steelCost: 10500, hotRunnerCost: 0, purchasedComponents: 3200,
      designHoursPlanned: 80, designHoursActual: 79, camHoursPlanned: 60, camHoursActual: 61,
      cncHoursPlanned: 180, cncHoursActual: 182, edmHoursPlanned: 40, edmHoursActual: 38,
      fittingHoursPlanned: 120, fittingHoursActual: 118, tryoutLoops: 1 },
    milestones: [
      { name: "Down Payment 30%", pct: 30, plannedDate: "2024-11-25", actualDate: "2024-11-28", invoiceAmount: 12600, invoiceStatus: "PAID" },
      { name: "T1 Sample 40%", pct: 40, plannedDate: "2025-03-31", actualDate: "2025-04-02", invoiceAmount: 16800, invoiceStatus: "PAID" },
      { name: "FAT / Delivery 30%", pct: 30, plannedDate: "2026-04-30", invoiceAmount: 12600, invoiceStatus: "ISSUED" },
    ],
    openECOs: 0, tryoutCount: 1, wip: 39900,
  },
  {
    id: "tp3", toolNo: "T-2025-003", customer: "Continental AG",
    description: "Sensor Bracket Left – Warranty Repair", serviceType: "WARRANTY_REPAIR",
    quotedRevenue: 0, quotedCost: 0, estimatedFinalCost: 8200,
    completionPct: 100, startDate: "2025-02-01", eta: "2025-03-15", actualDelivery: "2025-03-12",
    riskLevel: "LOW", status: "COMPLETED",
    costBreakdown: { steelCost: 1200, hotRunnerCost: 0, purchasedComponents: 800,
      designHoursPlanned: 8, designHoursActual: 8, camHoursPlanned: 12, camHoursActual: 12,
      cncHoursPlanned: 40, cncHoursActual: 38, edmHoursPlanned: 10, edmHoursActual: 10,
      fittingHoursPlanned: 60, fittingHoursActual: 62, tryoutLoops: 1 },
    milestones: [],
    openECOs: 0, tryoutCount: 1, wip: 0,
  },
  {
    id: "tp4", toolNo: "T-2025-004", customer: "Valeo Systems",
    description: "Mirror Housing Cover – Modification ECO #4", serviceType: "MODIFICATION_ECO",
    quotedRevenue: 28500, quotedCost: 22800, estimatedFinalCost: 22000,
    completionPct: 60, startDate: "2025-10-01", eta: "2026-05-31",
    riskLevel: "LOW", status: "ACTIVE",
    costBreakdown: { steelCost: 4200, hotRunnerCost: 0, purchasedComponents: 1500,
      designHoursPlanned: 45, designHoursActual: 42, camHoursPlanned: 35, camHoursActual: 34,
      cncHoursPlanned: 120, cncHoursActual: 108, edmHoursPlanned: 25, edmHoursActual: 22,
      fittingHoursPlanned: 90, fittingHoursActual: 85, tryoutLoops: 1 },
    milestones: [
      { name: "Advance 50%", pct: 50, plannedDate: "2025-10-15", actualDate: "2025-10-18", invoiceAmount: 14250, invoiceStatus: "PAID" },
      { name: "Delivery 50%", pct: 50, plannedDate: "2026-05-31", invoiceAmount: 14250, invoiceStatus: "PLANNED" },
    ],
    openECOs: 1, tryoutCount: 1, wip: 13200,
  },
  {
    id: "tp5", toolNo: "T-2025-005", customer: "Magna International",
    description: "Bumper Clip Assembly – 2-Cavity", serviceType: "NEW_TOOL",
    quotedRevenue: 65000, quotedCost: 52000, estimatedFinalCost: 58000,
    completionPct: 45, startDate: "2025-11-01", eta: "2026-07-31",
    riskLevel: "MEDIUM", status: "ACTIVE",
    costBreakdown: { steelCost: 16000, hotRunnerCost: 0, purchasedComponents: 4800,
      designHoursPlanned: 110, designHoursActual: 105, camHoursPlanned: 90, camHoursActual: 88,
      cncHoursPlanned: 260, cncHoursActual: 248, edmHoursPlanned: 60, edmHoursActual: 55,
      fittingHoursPlanned: 180, fittingHoursActual: 0, tryoutLoops: 0 },
    milestones: [
      { name: "Down Payment 30%", pct: 30, plannedDate: "2025-11-15", actualDate: "2025-11-20", invoiceAmount: 19500, invoiceStatus: "PAID" },
      { name: "Design Approval 30%", pct: 30, plannedDate: "2026-02-28", invoiceAmount: 19500, invoiceStatus: "ISSUED" },
      { name: "FAT 40%", pct: 40, plannedDate: "2026-07-31", invoiceAmount: 26000, invoiceStatus: "PLANNED" },
    ],
    openECOs: 1, tryoutCount: 0, wip: 26100,
  },
  {
    id: "tp6", toolNo: "T-2025-006", customer: "Faurecia SE",
    description: "Armrest Insert – Hot Runner 4-Drop", serviceType: "NEW_TOOL",
    quotedRevenue: 94000, quotedCost: 75200, estimatedFinalCost: 97500,
    completionPct: 35, startDate: "2025-09-01", eta: "2026-08-31",
    riskLevel: "HIGH", status: "ACTIVE",
    costBreakdown: { steelCost: 26000, hotRunnerCost: 22000, purchasedComponents: 9500,
      designHoursPlanned: 200, designHoursActual: 215, camHoursPlanned: 150, camHoursActual: 162,
      cncHoursPlanned: 420, cncHoursActual: 385, edmHoursPlanned: 100, edmHoursActual: 88,
      fittingHoursPlanned: 280, fittingHoursActual: 85, tryoutLoops: 0 },
    milestones: [
      { name: "Advance 25%", pct: 25, plannedDate: "2025-09-15", actualDate: "2025-09-18", invoiceAmount: 23500, invoiceStatus: "PAID" },
      { name: "Steel 25%", pct: 25, plannedDate: "2026-01-31", actualDate: "2026-02-15", invoiceAmount: 23500, invoiceStatus: "OVERDUE" },
      { name: "T1 Sample 25%", pct: 25, plannedDate: "2026-06-30", invoiceAmount: 23500, invoiceStatus: "PLANNED" },
      { name: "FAT 25%", pct: 25, plannedDate: "2026-08-31", invoiceAmount: 23500, invoiceStatus: "PLANNED" },
    ],
    openECOs: 3, tryoutCount: 0, wip: 34100,
  },
  {
    id: "tp7", toolNo: "T-2025-007", customer: "ZF Friedrichshafen",
    description: "Gearbox Cover Seal – 1-Cavity", serviceType: "NEW_TOOL",
    quotedRevenue: 118000, quotedCost: 94400, estimatedFinalCost: 105000,
    completionPct: 55, startDate: "2025-07-01", eta: "2026-06-30",
    riskLevel: "LOW", status: "ACTIVE",
    costBreakdown: { steelCost: 32000, hotRunnerCost: 14000, purchasedComponents: 11000,
      designHoursPlanned: 240, designHoursActual: 235, camHoursPlanned: 180, camHoursActual: 178,
      cncHoursPlanned: 500, cncHoursActual: 488, edmHoursPlanned: 120, edmHoursActual: 115,
      fittingHoursPlanned: 320, fittingHoursActual: 162, tryoutLoops: 1 },
    milestones: [
      { name: "Down Payment 30%", pct: 30, plannedDate: "2025-07-15", actualDate: "2025-07-18", invoiceAmount: 35400, invoiceStatus: "PAID" },
      { name: "Design + Steel 30%", pct: 30, plannedDate: "2025-11-30", actualDate: "2025-12-05", invoiceAmount: 35400, invoiceStatus: "PAID" },
      { name: "T1 Sample 20%", pct: 20, plannedDate: "2026-04-30", invoiceAmount: 23600, invoiceStatus: "ISSUED" },
      { name: "FAT 20%", pct: 20, plannedDate: "2026-06-30", invoiceAmount: 23600, invoiceStatus: "PLANNED" },
    ],
    openECOs: 0, tryoutCount: 1, wip: 64900,
  },
  {
    id: "tp8", toolNo: "T-2025-008", customer: "BMW AG",
    description: "B-Pillar Insert – China Tool Transfer & Adaptation", serviceType: "CHINA_TRANSFER",
    quotedRevenue: 38500, quotedCost: 30800, estimatedFinalCost: 35000,
    completionPct: 90, startDate: "2025-08-01", eta: "2026-04-30",
    riskLevel: "LOW", status: "ACTIVE",
    costBreakdown: { steelCost: 8500, hotRunnerCost: 0, purchasedComponents: 5200,
      designHoursPlanned: 60, designHoursActual: 58, camHoursPlanned: 45, camHoursActual: 44,
      cncHoursPlanned: 180, cncHoursActual: 172, edmHoursPlanned: 40, edmHoursActual: 38,
      fittingHoursPlanned: 140, fittingHoursActual: 128, tryoutLoops: 2 },
    milestones: [
      { name: "Advance 50%", pct: 50, plannedDate: "2025-08-15", actualDate: "2025-08-20", invoiceAmount: 19250, invoiceStatus: "PAID" },
      { name: "FAT Delivery 50%", pct: 50, plannedDate: "2026-04-30", invoiceAmount: 19250, invoiceStatus: "ISSUED" },
    ],
    openECOs: 0, tryoutCount: 2, wip: 34650,
  },
  {
    id: "tp9", toolNo: "T-2025-009", customer: "Stellantis NV",
    description: "Door Trim Clip – Spare Inserts Set", serviceType: "SPARE_PARTS",
    quotedRevenue: 7800, quotedCost: 5460, estimatedFinalCost: 5200,
    completionPct: 100, startDate: "2025-12-01", eta: "2026-01-31", actualDelivery: "2026-01-28",
    riskLevel: "LOW", status: "COMPLETED",
    costBreakdown: { steelCost: 1800, hotRunnerCost: 0, purchasedComponents: 400,
      designHoursPlanned: 10, designHoursActual: 10, camHoursPlanned: 15, camHoursActual: 14,
      cncHoursPlanned: 48, cncHoursActual: 46, edmHoursPlanned: 8, edmHoursActual: 8,
      fittingHoursPlanned: 30, fittingHoursActual: 28, tryoutLoops: 0 },
    milestones: [
      { name: "Full Payment", pct: 100, plannedDate: "2026-01-31", actualDate: "2026-01-28", invoiceAmount: 7800, invoiceStatus: "PAID" },
    ],
    openECOs: 0, tryoutCount: 0, wip: 0,
  },
  {
    id: "tp10", toolNo: "T-2025-010", customer: "BMW AG",
    description: "Air Duct Left – Warranty Repair Core Insert", serviceType: "WARRANTY_REPAIR",
    quotedRevenue: 0, quotedCost: 0, estimatedFinalCost: 4500,
    completionPct: 80, startDate: "2026-02-01", eta: "2026-04-30",
    riskLevel: "MEDIUM", status: "ACTIVE",
    costBreakdown: { steelCost: 600, hotRunnerCost: 0, purchasedComponents: 200,
      designHoursPlanned: 5, designHoursActual: 5, camHoursPlanned: 8, camHoursActual: 8,
      cncHoursPlanned: 30, cncHoursActual: 28, edmHoursPlanned: 6, edmHoursActual: 6,
      fittingHoursPlanned: 40, fittingHoursActual: 32, tryoutLoops: 0 },
    milestones: [],
    openECOs: 0, tryoutCount: 0, wip: 3600,
  },
  {
    id: "tp11", toolNo: "T-2025-011", customer: "Robert Bosch GmbH",
    description: "ECU Cover Bracket – 2-Cavity", serviceType: "NEW_TOOL",
    quotedRevenue: 72000, quotedCost: 57600, estimatedFinalCost: 68000,
    completionPct: 20, startDate: "2026-01-15", eta: "2026-09-30",
    riskLevel: "MEDIUM", status: "ACTIVE",
    costBreakdown: { steelCost: 18000, hotRunnerCost: 8500, purchasedComponents: 6200,
      designHoursPlanned: 160, designHoursActual: 155, camHoursPlanned: 120, camHoursActual: 85,
      cncHoursPlanned: 350, cncHoursActual: 65, edmHoursPlanned: 80, edmHoursActual: 10,
      fittingHoursPlanned: 240, fittingHoursActual: 0, tryoutLoops: 0 },
    milestones: [
      { name: "Down Payment 30%", pct: 30, plannedDate: "2026-01-31", actualDate: "2026-02-05", invoiceAmount: 21600, invoiceStatus: "PAID" },
      { name: "Design Approval 30%", pct: 30, plannedDate: "2026-05-31", invoiceAmount: 21600, invoiceStatus: "PLANNED" },
      { name: "FAT 40%", pct: 40, plannedDate: "2026-09-30", invoiceAmount: 28800, invoiceStatus: "PLANNED" },
    ],
    openECOs: 0, tryoutCount: 0, wip: 14400,
  },
  {
    id: "tp12", toolNo: "T-2025-012", customer: "Continental AG",
    description: "Switch Housing – Paid Repair Cavity Refurb", serviceType: "PAID_REPAIR",
    quotedRevenue: 18500, quotedCost: 14800, estimatedFinalCost: 14000,
    completionPct: 70, startDate: "2026-01-20", eta: "2026-05-15",
    riskLevel: "LOW", status: "ACTIVE",
    costBreakdown: { steelCost: 2800, hotRunnerCost: 0, purchasedComponents: 1200,
      designHoursPlanned: 20, designHoursActual: 18, camHoursPlanned: 25, camHoursActual: 22,
      cncHoursPlanned: 80, cncHoursActual: 74, edmHoursPlanned: 20, edmHoursActual: 18,
      fittingHoursPlanned: 80, fittingHoursActual: 55, tryoutLoops: 1 },
    milestones: [
      { name: "Advance 50%", pct: 50, plannedDate: "2026-02-01", actualDate: "2026-02-03", invoiceAmount: 9250, invoiceStatus: "PAID" },
      { name: "Delivery 50%", pct: 50, plannedDate: "2026-05-15", invoiceAmount: 9250, invoiceStatus: "PLANNED" },
    ],
    openECOs: 0, tryoutCount: 1, wip: 9800,
  },
  {
    id: "tp13", toolNo: "T-2026-013", customer: "Aptiv PLC",
    description: "Harness Connector Block – 4-Cavity", serviceType: "NEW_TOOL",
    quotedRevenue: 55000, quotedCost: 44000, estimatedFinalCost: 51000,
    completionPct: 10, startDate: "2026-03-01", eta: "2026-10-31",
    riskLevel: "LOW", status: "ACTIVE",
    costBreakdown: { steelCost: 14000, hotRunnerCost: 0, purchasedComponents: 4800,
      designHoursPlanned: 100, designHoursActual: 15, camHoursPlanned: 80, camHoursActual: 0,
      cncHoursPlanned: 280, cncHoursActual: 0, edmHoursPlanned: 60, edmHoursActual: 0,
      fittingHoursPlanned: 200, fittingHoursActual: 0, tryoutLoops: 0 },
    milestones: [
      { name: "Down Payment 30%", pct: 30, plannedDate: "2026-03-15", actualDate: "2026-03-18", invoiceAmount: 16500, invoiceStatus: "PAID" },
      { name: "Design Approval 30%", pct: 30, plannedDate: "2026-06-30", invoiceAmount: 16500, invoiceStatus: "PLANNED" },
      { name: "FAT 40%", pct: 40, plannedDate: "2026-10-31", invoiceAmount: 22000, invoiceStatus: "PLANNED" },
    ],
    openECOs: 0, tryoutCount: 0, wip: 5500,
  },
  {
    id: "tp14", toolNo: "T-2026-014", customer: "Hella GmbH",
    description: "Light Guide Housing – 1-Cavity Hot Runner", serviceType: "NEW_TOOL",
    quotedRevenue: 143000, quotedCost: 114400, estimatedFinalCost: 128000,
    completionPct: 65, startDate: "2025-06-01", eta: "2026-05-31",
    riskLevel: "MEDIUM", status: "ACTIVE",
    costBreakdown: { steelCost: 38000, hotRunnerCost: 26000, purchasedComponents: 14000,
      designHoursPlanned: 280, designHoursActual: 272, camHoursPlanned: 220, camHoursActual: 218,
      cncHoursPlanned: 580, cncHoursActual: 562, edmHoursPlanned: 140, edmHoursActual: 135,
      fittingHoursPlanned: 380, fittingHoursActual: 240, tryoutLoops: 2 },
    milestones: [
      { name: "Down Payment 25%", pct: 25, plannedDate: "2025-06-15", actualDate: "2025-06-20", invoiceAmount: 35750, invoiceStatus: "PAID" },
      { name: "Steel Order 25%", pct: 25, plannedDate: "2025-10-31", actualDate: "2025-11-05", invoiceAmount: 35750, invoiceStatus: "PAID" },
      { name: "T1 Sample 25%", pct: 25, plannedDate: "2026-03-31", actualDate: "2026-04-05", invoiceAmount: 35750, invoiceStatus: "ISSUED" },
      { name: "FAT 25%", pct: 25, plannedDate: "2026-05-31", invoiceAmount: 35750, invoiceStatus: "PLANNED" },
    ],
    openECOs: 1, tryoutCount: 2, wip: 92950,
  },
  {
    id: "tp15", toolNo: "T-2026-015", customer: "Continental AG",
    description: "ABS Sensor Housing – High Precision", serviceType: "NEW_TOOL",
    quotedRevenue: 48500, quotedCost: 38800, estimatedFinalCost: 52000,
    completionPct: 85, startDate: "2025-10-15", eta: "2026-04-30",
    riskLevel: "HIGH", status: "ACTIVE",
    costBreakdown: { steelCost: 13500, hotRunnerCost: 0, purchasedComponents: 5800,
      designHoursPlanned: 90, designHoursActual: 95, camHoursPlanned: 75, camHoursActual: 80,
      cncHoursPlanned: 250, cncHoursActual: 268, edmHoursPlanned: 60, edmHoursActual: 65,
      fittingHoursPlanned: 180, fittingHoursActual: 195, tryoutLoops: 2 },
    milestones: [
      { name: "Down Payment 30%", pct: 30, plannedDate: "2025-10-31", actualDate: "2025-11-02", invoiceAmount: 14550, invoiceStatus: "PAID" },
      { name: "T1 Sample 40%", pct: 40, plannedDate: "2026-02-28", actualDate: "2026-03-10", invoiceAmount: 19400, invoiceStatus: "ISSUED" },
      { name: "FAT 30%", pct: 30, plannedDate: "2026-04-30", invoiceAmount: 14550, invoiceStatus: "PLANNED" },
    ],
    openECOs: 0, tryoutCount: 2, wip: 41225,
  },
];

// ─── Warranty Claims ──────────────────────────────────────────────────────────

export const WARRANTY_CLAIMS: WarrantyClaim[] = [
  { id: "wc1", toolNo: "T-2023-008", customer: "BMW AG", description: "Core insert crack – premature wear",
    rootCause: "Insufficient hardness – material spec deviation", cost: 12400, recovered: 0,
    status: "OPEN", openDate: "2026-01-15", recoverable: false },
  { id: "wc2", toolNo: "T-2023-011", customer: "Bosch GmbH", description: "Slider mechanism failure",
    rootCause: "Lubrication channel undersized", cost: 8750, recovered: 8750,
    status: "CLOSED", openDate: "2025-11-20", closeDate: "2026-02-28", recoverable: true },
  { id: "wc3", toolNo: "T-2024-003", customer: "Continental AG", description: "Parting line flash – dimensional",
    rootCause: "Venting block insufficient", cost: 3200, recovered: 0,
    status: "IN_REPAIR", openDate: "2026-02-10", recoverable: false },
  { id: "wc4", toolNo: "T-2023-015", customer: "Valeo Systems", description: "Ejector pin breakage – 3 pins",
    rootCause: "Over-packing – process parameter drift", cost: 1850, recovered: 1850,
    status: "CLOSED", openDate: "2025-09-01", closeDate: "2025-10-15", recoverable: true },
  { id: "wc5", toolNo: "T-2024-001", customer: "BMW AG", description: "Hot runner gate tip wear",
    rootCause: "Abrasive material – PA6 GF30", cost: 6200, recovered: 0,
    status: "DISPUTED", openDate: "2026-03-05", recoverable: true },
  { id: "wc6", toolNo: "T-2023-022", customer: "Faurecia SE", description: "Cooling circuit blockage",
    rootCause: "Water quality – calcium deposits", cost: 4100, recovered: 2050,
    status: "CLOSED", openDate: "2025-08-12", closeDate: "2025-10-30", recoverable: true },
  { id: "wc7", toolNo: "T-2024-007", customer: "ZF Friedrichshafen", description: "Insert misalignment after ECO",
    rootCause: "Engineering change coordination gap", cost: 9800, recovered: 9800,
    status: "CLOSED", openDate: "2026-01-08", closeDate: "2026-03-20", recoverable: true },
  { id: "wc8", toolNo: "T-2025-010", customer: "BMW AG", description: "Air duct core insert – surface finish",
    rootCause: "EDM surface not re-polished post-repair", cost: 4500, recovered: 0,
    status: "IN_REPAIR", openDate: "2026-02-01", recoverable: false },
];

// ─── Machines (Capacity) ─────────────────────────────────────────────────────

export const MACHINES: Machine[] = [
  { id: "m1", name: "Makino D500 – 5-axis CNC", type: "CNC", utilizationPct: 87, plannedHours: 480, actualHours: 418, efficiency: 94, status: "RUNNING" },
  { id: "m2", name: "DMG Mori NHX4000 – CNC", type: "CNC", utilizationPct: 92, plannedHours: 480, actualHours: 442, efficiency: 96, status: "RUNNING" },
  { id: "m3", name: "FANUC Robodrill α-D21LiA", type: "CNC", utilizationPct: 78, plannedHours: 480, actualHours: 374, efficiency: 90, status: "IDLE" },
  { id: "m4", name: "Mitsubishi EA28V – Sinker EDM", type: "EDM", utilizationPct: 71, plannedHours: 480, actualHours: 341, efficiency: 88, status: "RUNNING" },
  { id: "m5", name: "GF AgieCharmilles CUT200 – Wire EDM", type: "EDM", utilizationPct: 64, plannedHours: 480, actualHours: 307, efficiency: 85, status: "RUNNING" },
  { id: "m6", name: "Zeiss Contura G2 – CMM", type: "CMM", utilizationPct: 55, plannedHours: 300, actualHours: 165, efficiency: 98, status: "IDLE" },
  { id: "m7", name: "Okuma LB3000 – CNC Lathe", type: "LATHE", utilizationPct: 60, plannedHours: 480, actualHours: 288, efficiency: 91, status: "MAINTENANCE" },
  { id: "m8", name: "Chevalier FSG-1224AD – Surface Grinder", type: "GRINDER", utilizationPct: 45, plannedHours: 300, actualHours: 135, efficiency: 89, status: "IDLE" },
];

// ─── Financial Periods (24 months) ───────────────────────────────────────────

function fp(
  month: string, label: string,
  tRev: number, tGMPct: number, tEBITDAPct: number,
  cash: number, arOvd: number, apOvd: number, wip: number,
  rfqW: number, rfqL: number, rfqS: number,
): FinancialPeriod {
  const tGP = Math.round(tRev * tGMPct / 100);
  const tEBITDA = Math.round(tRev * tEBITDAPct / 100);
  const netProfit = Math.round(tEBITDA * 0.75);
  return {
    month, label,
    toolingRevenue: tRev, toolingGP: tGP, toolingGMPct: tGMPct, toolingEBITDA: tEBITDA, toolingEBITDAPct: tEBITDAPct,
    revenue: tRev, grossProfit: tGP, gmPct: tGMPct, ebitda: tEBITDA, ebitdaPct: tEBITDAPct,
    netProfit, netProfitPct: Math.round(netProfit / tRev * 1000) / 10,
    cashBalance: cash, arOverdue: arOvd, apOverdue: apOvd, wip,
    rfqWon: rfqW, rfqLost: rfqL, rfqSent: rfqS,
  };
}

export const FINANCIAL_PERIODS: FinancialPeriod[] = [
  fp("2024-05","May '24",  358000,38.2,16.4, 1200000,  82000, 45000, 1850000, 3,2,7),
  fp("2024-06","Jun '24",  412000,40.1,18.2, 1420000,  95000, 38000, 2080000, 4,1,7),
  fp("2024-07","Jul '24",  287000,35.8,13.2, 1250000,  68000, 52000, 1920000, 2,3,6),
  fp("2024-08","Aug '24",  198000,32.5, 9.8, 1100000,  42000, 28000, 1640000, 1,1,4),
  fp("2024-09","Sep '24",  395000,39.5,17.8, 1350000,  88000, 42000, 2150000, 4,2,8),
  fp("2024-10","Oct '24",  445000,41.2,19.5, 1620000, 105000, 55000, 2380000, 5,1,8),
  fp("2024-11","Nov '24",  478000,42.0,20.2, 1850000, 118000, 62000, 2520000, 5,2,9),
  fp("2024-12","Dec '24",  325000,37.5,15.0, 1750000,  92000, 48000, 2180000, 3,2,7),
  fp("2025-01","Jan '25",  285000,34.8,12.5, 1600000,  78000, 42000, 1980000, 2,2,5),
  fp("2025-02","Feb '25",  340000,37.2,15.8, 1550000,  88000, 38000, 2120000, 3,1,6),
  fp("2025-03","Mar '25",  418000,39.8,17.5, 1720000,  95000, 48000, 2340000, 4,2,8),
  fp("2025-04","Apr '25",  462000,41.5,19.8, 1950000, 102000, 52000, 2580000, 5,1,8),
  fp("2025-05","May '25",  495000,42.8,21.2, 2100000, 115000, 58000, 2750000, 6,1,9),
  fp("2025-06","Jun '25",  518000,43.5,21.8, 2350000, 122000, 65000, 2890000, 5,2,9),
  fp("2025-07","Jul '25",  385000,40.2,18.5, 2200000,  98000, 55000, 2620000, 3,2,7),
  fp("2025-08","Aug '25",  215000,34.5,10.8, 1900000,  72000, 38000, 2150000, 2,2,5),
  fp("2025-09","Sep '25",  482000,41.8,20.2, 2150000, 112000, 62000, 2820000, 5,1,8),
  fp("2025-10","Oct '25",  525000,43.2,21.5, 2420000, 128000, 68000, 3050000, 6,1,9),
  fp("2025-11","Nov '25",  548000,44.1,22.5, 2680000, 142000, 72000, 3180000, 7,1,10),
  fp("2025-12","Dec '25",  395000,39.5,17.2, 2550000, 108000, 58000, 2920000, 4,2,8),
  fp("2026-01","Jan '26",  318000,37.8,15.5, 2380000,  92000, 48000, 2640000, 3,1,6),
  fp("2026-02","Feb '26",  385000,39.2,17.5, 2420000,  98000, 52000, 2780000, 4,1,7),
  fp("2026-03","Mar '26",  445000,41.5,19.8, 2680000, 115000, 62000, 3020000, 5,1,8),
  fp("2026-04","Apr '26",  428000,40.8,19.2, 2520000, 142000, 68000, 2950000, 4,2,8),
];

// ─── Cash Flow Items ──────────────────────────────────────────────────────────

export const CASH_FLOW_ITEMS: CashFlowItem[] = [
  { id: "cf1", description: "T-2025-008 – FAT Delivery 50%", customer: "BMW AG", amount: 19250,
    dueDate: "2026-04-30", type: "INFLOW", status: "CONFIRMED", category: "Tooling Invoice" },
  { id: "cf2", description: "T-2026-015 – T1 Sample 40%", customer: "Continental AG", amount: 19400,
    dueDate: "2026-04-20", type: "INFLOW", status: "OVERDUE", daysOverdue: 4, category: "Tooling Invoice" },
  { id: "cf3", description: "T-2025-007 – T1 Sample 20%", customer: "ZF Friedrichshafen", amount: 23600,
    dueDate: "2026-05-15", type: "INFLOW", status: "CONFIRMED", category: "Tooling Invoice" },
  { id: "cf4", description: "T-2025-014 – T1 Sample 25%", customer: "Hella GmbH", amount: 35750,
    dueDate: "2026-05-31", type: "INFLOW", status: "PLANNED", category: "Tooling Invoice" },
  { id: "cf9", description: "Steel purchase order – T-2026-013", customer: "Böhler Edelstahl", amount: -14200,
    dueDate: "2026-05-05", type: "OUTFLOW", status: "CONFIRMED", category: "Material Purchase" },
  { id: "cf10", description: "Hot runner – T-2025-006", customer: "HASCO Hasenclever", amount: -22000,
    dueDate: "2026-04-28", type: "OUTFLOW", status: "CONFIRMED", category: "Material Purchase" },
  { id: "cf11", description: "Monthly resin delivery – PP/PA6", customer: "BASF SE", amount: -48500,
    dueDate: "2026-05-08", type: "OUTFLOW", status: "PLANNED", category: "Raw Material" },
  { id: "cf12", description: "T-2025-006 – Steel milestone overdue", customer: "Faurecia SE", amount: 23500,
    dueDate: "2026-02-15", type: "INFLOW", status: "OVERDUE", daysOverdue: 68, category: "Tooling Invoice" },
  { id: "cf13", description: "Payroll – April 2026", customer: "Internal", amount: -185000,
    dueDate: "2026-04-29", type: "OUTFLOW", status: "CONFIRMED", category: "Payroll" },
  { id: "cf14", description: "Leasing installments – machinery", customer: "BNP Paribas Leasing", amount: -18400,
    dueDate: "2026-05-01", type: "OUTFLOW", status: "CONFIRMED", category: "Leasing" },
  { id: "cf15", description: "Tax advance payment – CIT", customer: "Tax Authority", amount: -32000,
    dueDate: "2026-05-20", type: "OUTFLOW", status: "PLANNED", category: "Tax" },
  { id: "cf16", description: "T-2024-002 – FAT Delivery 30%", customer: "Robert Bosch GmbH", amount: 12600,
    dueDate: "2026-04-30", type: "INFLOW", status: "ISSUED", category: "Tooling Invoice" },
  { id: "cf17", description: "Annual tool service contract", customer: "BMW AG", amount: 28500,
    dueDate: "2026-06-30", type: "INFLOW", status: "PLANNED", category: "Service Contract" },
  { id: "cf18", description: "T-2025-005 – Design Approval 30%", customer: "Magna International", amount: 19500,
    dueDate: "2026-05-10", type: "INFLOW", status: "ISSUED", category: "Tooling Invoice" },
];

// ─── Risk / Action Items ──────────────────────────────────────────────────────

export const RISK_ACTIONS: RiskAction[] = [
  {
    id: "ra1", title: "T-2024-001 Margin Collapse – BMW Door Panel",
    description: "Project T-2024-001 is running €6,700 over quoted cost due to excessive fitting hours (+45h) and 3rd tryout loop. Estimated final cost €94,200 vs. quoted €87,500 → margin turning negative.",
    severity: "CRITICAL", category: "FINANCIAL", impactEur: -9200,
    owner: "Marcin Kowalski", dueDate: "2026-05-15", status: "IN_PROGRESS",
    linkedProject: "T-2024-001", linkedCustomer: "BMW AG",
    actions: [
      "Negotiate ECO surcharge with BMW purchasing (€4,500 recovery target)",
      "Freeze any further design changes without written ECO order",
      "Review fitting process – bring in external fitter to accelerate",
    ],
  },
  {
    id: "ra2", title: "Faurecia T-2025-006 – Overdue Milestone Invoice €23,500",
    description: "The Steel milestone invoice for T-2025-006 (€23,500) was due 2026-02-15 and is now 68 days overdue. Faurecia claims ECO dispute is blocking payment approval.",
    severity: "CRITICAL", category: "FINANCIAL", impactEur: -23500,
    owner: "Anna Nowak", dueDate: "2026-04-30", status: "OPEN",
    linkedProject: "T-2025-006", linkedCustomer: "Faurecia SE",
    actions: [
      "Escalate to Faurecia PM – send formal payment demand",
      "Engage legal counsel if payment not confirmed by 2026-04-30",
      "Hold delivery of next tooling phase until payment confirmed",
    ],
  },
  {
    id: "ra3", title: "T-2026-015 Continental – Over Budget, Delivery Risk",
    description: "ABS Sensor Housing project running 34% over planned cost. EFC €52k vs quoted €48.5k. Dimensional issues at 2nd tryout require steel welding, which delays FAT by 3 weeks.",
    severity: "HIGH", category: "DELIVERY", impactEur: -3500,
    owner: "Piotr Wiśniewski", dueDate: "2026-05-05", status: "IN_PROGRESS",
    linkedProject: "T-2026-015", linkedCustomer: "Continental AG",
    actions: [
      "Weld and re-machine cavity – schedule EDM rework by 2026-04-28",
      "Submit formal delay notice to Continental – request FAT postponement",
      "Claim partial cost recovery for design change (ECO-22)",
    ],
  },
  {
    id: "ra7", title: "T-2025-006 Design Over-Run – Faurecia Armrest",
    description: "Design and CAM hours on T-2025-006 already 10% over plan at only 35% completion. Extrapolation indicates €8,500 design overrun by project end. Three open ECOs pending.",
    severity: "MEDIUM", category: "FINANCIAL", impactEur: -8500,
    owner: "Marcin Kowalski", dueDate: "2026-05-31", status: "MONITORING",
    linkedProject: "T-2025-006", linkedCustomer: "Faurecia SE",
    actions: [
      "Freeze non-billable design changes – require ECO sign-off before any modifications",
      "Submit change request to Faurecia for 2 of 3 pending ECOs",
    ],
  },
  {
    id: "ra9", title: "CMM Capacity Bottleneck – Lead Time Risk",
    description: "Zeiss CMM utilization at 55% but queue growing due to tryout season. 3 projects (T-2024-001, T-2025-006, T-2026-015) all requiring CMM support in May 2026. Risk of measurement backlog.",
    severity: "MEDIUM", category: "OPERATIONAL", impactEur: -15000,
    owner: "Piotr Wiśniewski", dueDate: "2026-05-15", status: "OPEN",
    linkedProject: undefined, linkedCustomer: undefined,
    actions: [
      "Schedule CMM shifts for weekends in May",
      "Qualify external CMM service provider as overflow capacity",
    ],
  },
  {
    id: "ra10", title: "T-2025-002 Bosch FAT Invoice Blocked – Process",
    description: "Final invoice for T-2024-002 (€12,600) is ready to issue but blocked because FAT sign-off form has not been returned by Bosch. Tool delivered 2026-04-05, no customer sign-off yet.",
    severity: "LOW", category: "DELIVERY", impactEur: -12600,
    owner: "Marcin Kowalski", dueDate: "2026-04-30", status: "IN_PROGRESS",
    linkedProject: "T-2024-002", linkedCustomer: "Robert Bosch GmbH",
    actions: [
      "Follow up with Bosch SQE for FAT acceptance document",
      "Obtain email confirmation as interim acceptance if form delayed",
    ],
  },
];

// ─── CEO Alerts ───────────────────────────────────────────────────────────────

export const CEO_ALERTS: CeoAlert[] = [
  { id: "a1", type: "CRITICAL", title: "Faurecia invoice €23,500 overdue 68 days",
    detail: "T-2025-006 Steel milestone. Legal escalation required.", timestamp: "2026-04-24T08:00:00" },
  { id: "a2", type: "CRITICAL", title: "T-2024-001 BMW – margin now negative (-5.4%)",
    detail: "EFC exceeded quoted price. Recovery negotiation active.", timestamp: "2026-04-23T14:30:00" },
  { id: "a6", type: "INFO", title: "ZF T-2025-007 T1 Sample accepted – invoice €23,600",
    detail: "Milestone invoice issued. Payment due 2026-05-15.", timestamp: "2026-04-18T16:00:00" },
];

// ─── Pipeline Deals (CRM Kanban) ─────────────────────────────────────────────

export const PIPELINE_DEALS: PipelineDeal[] = [
  { id: "d1", customerId: "c1", title: "BMW – Platform X New Tools (3 tools)", stage: "NEGOTIATION", value: 285000, probability: 75, expectedClose: "2026-05-31", ownerId: "u2" },
  { id: "d2", customerId: "c2", title: "Bosch – Injection Series 2026-2028", stage: "PROPOSAL", value: 1200000, probability: 55, expectedClose: "2026-06-30", ownerId: "u2" },
  { id: "d3", customerId: "c3", title: "Continental – ECU Bracket Array (5 parts)", stage: "QUALIFIED", value: 450000, probability: 40, expectedClose: "2026-07-31", ownerId: "u2" },
  { id: "d4", customerId: "c8", title: "ZF – Driveshaft Boot 4cav New", stage: "PROPOSAL", value: 145000, probability: 60, expectedClose: "2026-05-15", ownerId: "u2" },
  { id: "d5", customerId: "c10", title: "Hella – Rear Lamp Housing Series", stage: "NEGOTIATION", value: 125000, probability: 80, expectedClose: "2026-05-31", ownerId: "u2" },
  { id: "d6", customerId: "c5", title: "Magna – EV Battery Clips Production", stage: "LEAD", value: 680000, probability: 25, expectedClose: "2026-09-30", ownerId: "u2" },
  { id: "d7", customerId: "c4", title: "Valeo – ADAS Camera Tools x2", stage: "QUALIFIED", value: 195000, probability: 45, expectedClose: "2026-06-30", ownerId: "u2" },
  { id: "d8", customerId: "c6", title: "Faurecia – Armrest LTA 2026-2029", stage: "WON", value: 1580000, probability: 100, expectedClose: "2026-04-15", ownerId: "u2" },
  { id: "d9", customerId: "c9", title: "Aptiv – Connector Production Contract", stage: "PROPOSAL", value: 108000, probability: 50, expectedClose: "2026-05-31", ownerId: "u2" },
  { id: "d10", customerId: "c7", title: "Stellantis – Platform 3 Door Trim Tools", stage: "LEAD", value: 320000, probability: 20, expectedClose: "2026-10-31", ownerId: "u2" },
  { id: "d11", customerId: "c1", title: "BMW – Series 5 Facelift Spare Parts", stage: "QUALIFIED", value: 48000, probability: 85, expectedClose: "2026-04-30", ownerId: "u2" },
  { id: "d12", customerId: "c3", title: "Continental – ABS Sensor Tool Repair", stage: "WON", value: 18500, probability: 100, expectedClose: "2026-04-10", ownerId: "u2" },
];

// ─── Materials ────────────────────────────────────────────────────────────────

export const MATERIALS: Material[] = [
  { code: "PP", name: "Polypropylene (PP Copolymer)", pricePerKg: 1.45, trend: 2.1, supplier: "SABIC",
    priceHistory: [
      { month: "2025-10", price: 1.38 }, { month: "2025-11", price: 1.40 },
      { month: "2025-12", price: 1.42 }, { month: "2026-01", price: 1.43 },
      { month: "2026-02", price: 1.44 }, { month: "2026-03", price: 1.44 },
      { month: "2026-04", price: 1.45 },
    ] },
  { code: "PA6", name: "Polyamide 6 (Nylon)", pricePerKg: 2.85, trend: -0.7, supplier: "BASF",
    priceHistory: [
      { month: "2025-10", price: 2.92 }, { month: "2025-11", price: 2.90 },
      { month: "2025-12", price: 2.88 }, { month: "2026-01", price: 2.87 },
      { month: "2026-02", price: 2.86 }, { month: "2026-03", price: 2.85 },
      { month: "2026-04", price: 2.85 },
    ] },
  { code: "ABS", name: "Acrylonitrile Butadiene Styrene", pricePerKg: 1.95, trend: 8.0, supplier: "BASF",
    priceHistory: [
      { month: "2025-10", price: 1.80 }, { month: "2025-11", price: 1.82 },
      { month: "2025-12", price: 1.85 }, { month: "2026-01", price: 1.88 },
      { month: "2026-02", price: 1.90 }, { month: "2026-03", price: 1.92 },
      { month: "2026-04", price: 1.95 },
    ] },
  { code: "PC", name: "Polycarbonate (Optical Grade)", pricePerKg: 3.85, trend: 1.3, supplier: "Covestro",
    priceHistory: [
      { month: "2025-10", price: 3.78 }, { month: "2025-11", price: 3.79 },
      { month: "2025-12", price: 3.81 }, { month: "2026-01", price: 3.82 },
      { month: "2026-02", price: 3.83 }, { month: "2026-03", price: 3.84 },
      { month: "2026-04", price: 3.85 },
    ] },
  { code: "POM", name: "Polyoxymethylene (Acetal)", pricePerKg: 2.20, trend: 0.5, supplier: "DuPont",
    priceHistory: [
      { month: "2025-10", price: 2.17 }, { month: "2025-11", price: 2.18 },
      { month: "2025-12", price: 2.18 }, { month: "2026-01", price: 2.19 },
      { month: "2026-02", price: 2.19 }, { month: "2026-03", price: 2.20 },
      { month: "2026-04", price: 2.20 },
    ] },
];

// ─── KPI Snapshots (legacy, derived from FINANCIAL_PERIODS) ──────────────────

export const KPI_SNAPSHOTS: KpiSnapshot[] = FINANCIAL_PERIODS.map(fp => ({
  month: fp.month,
  revenue: fp.revenue,
  grossMarginPct: fp.gmPct,
  oee: 84 + Math.random() * 8, // 84-92%
  scrapRate: 1.2 + Math.random() * 1.5,
  onTimeDelivery: 91 + Math.random() * 7,
  cashBalance: fp.cashBalance,
  rfqWon: fp.rfqWon,
  rfqLost: fp.rfqLost,
  rfqSent: fp.rfqSent,
  claimsOpen: 2 + Math.round(Math.random() * 4),
  claimsValue: 8000 + Math.round(Math.random() * 30000),
}));

// ─── Claims (legacy) ──────────────────────────────────────────────────────────

export const CLAIMS: Claim[] = [
  { id: "cl1", customerId: "c1", description: "Surface scratch on B-pillar insert", status: "OPEN",
    priority: "HIGH", value: 12400, openDate: "2026-01-15", rootCause: "Material defect" },
  { id: "cl2", customerId: "c2", description: "Dimensional deviation – gate area", status: "IN_PROGRESS",
    priority: "MEDIUM", value: 3200, openDate: "2026-02-10", rootCause: "Venting issue" },
  { id: "cl3", customerId: "c6", description: "Hot runner gate leak at startup", status: "RESOLVED",
    priority: "HIGH", value: 6200, openDate: "2026-03-05", closeDate: "2026-04-10", rootCause: "Gate tip wear" },
  { id: "cl4", customerId: "c3", description: "Weld line visible on sensor housing", status: "OPEN",
    priority: "MEDIUM", value: 1850, openDate: "2026-03-20", rootCause: "Gate position" },
  { id: "cl5", customerId: "c7", description: "Short shot on door trim – 2 cavities", status: "CLOSED",
    priority: "LOW", value: 950, openDate: "2026-01-08", closeDate: "2026-02-15" },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const USERS: UserProfile[] = [
  { id: "u1", name: "Thomas Keller", email: "thomas.keller@shapers.eu", role: "ADMIN", department: "Management" },
  { id: "u2", name: "Anna Nowak", email: "a.nowak@shapers.eu", role: "SALES", department: "Sales & Commercial" },
  { id: "u3", name: "Marcin Kowalski", email: "m.kowalski@shapers.eu", role: "ENGINEER", department: "Tooling Engineering" },
  { id: "u4", name: "Piotr Wiśniewski", email: "p.wisniewski@shapers.eu", role: "ENGINEER", department: "Production" },
  { id: "u5", name: "Katarzyna Zając", email: "k.zajac@shapers.eu", role: "FINANCE", department: "Finance & Controlling" },
];

// ─── App Settings ─────────────────────────────────────────────────────────────

export const APP_SETTINGS = {
  companyName: "Shapers Polska Sp. z o.o.",
  currency: "EUR",
  rfqValidityDays: 60,
  marginGreenThreshold: 25,
  marginYellowThreshold: 15,
  oeeGreenThreshold: 85,
  oeeYellowThreshold: 75,
  otdGreenThreshold: 95,
  otdYellowThreshold: 88,
  scrapGreenThreshold: 2.0,
  scrapYellowThreshold: 3.5,
  notifyOnNewRfq: true,
  notifyOnWonLost: true,
  notifyOnClaimOpened: true,
  notifyOnOverdueInvoice: true,
  notifyOnLowMargin: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getCustomerById = (id: string) => CUSTOMERS.find(c => c.id === id);
export const getClaimsByCustomer = (id: string) => CLAIMS.filter(c => c.customerId === id);
export const getDealsByStage = (stage: string) => PIPELINE_DEALS.filter(d => d.stage === stage);
export const getLatestKpi = () => FINANCIAL_PERIODS[FINANCIAL_PERIODS.length - 1];
export const getPreviousKpi = () => FINANCIAL_PERIODS[FINANCIAL_PERIODS.length - 2];

export const getEnrichedClaims = () =>
  CLAIMS.map(c => ({ ...c, customer: getCustomerById(c.customerId) }));
export const getEnrichedDeals = () =>
  PIPELINE_DEALS.map(d => ({ ...d, customer: getCustomerById(d.customerId) }));

// ─── Org Chart ────────────────────────────────────────────────────────────────

export const EMPLOYEES: OrgEmployee[] = [
  // ── Management
  {
    id: "e1", name: "Tomasz Keller", position: "Managing Director",
    department: "Management", email: "t.keller@shapers.pl",
    phone: "+48 600 100 001", role: "ADMIN", hireYear: 2010,
  },
  // ── Technical
  {
    id: "e2", name: "Marek Wiśniewski", position: "Technical Director",
    department: "Technical", email: "m.wisniewski@shapers.pl",
    phone: "+48 600 100 002", reportsTo: "e1", role: "ENGINEER", hireYear: 2012,
  },
  {
    id: "e3", name: "Artur Nowak", position: "CNC Workshop Lead",
    department: "Technical", email: "a.nowak@shapers.pl",
    phone: "+48 600 100 003", reportsTo: "e2", role: "ENGINEER", hireYear: 2014,
  },
  {
    id: "e4", name: "Piotr Kowalski", position: "CNC Machinist",
    department: "Technical", email: "p.kowalski@shapers.pl",
    reportsTo: "e3", role: "VIEWER", hireYear: 2016,
  },
  {
    id: "e5", name: "Łukasz Zając", position: "CNC Machinist",
    department: "Technical", email: "l.zajac@shapers.pl",
    reportsTo: "e3", role: "VIEWER", hireYear: 2018,
  },
  {
    id: "e6", name: "Dawid Sikora", position: "CNC Machinist",
    department: "Technical", email: "d.sikora@shapers.pl",
    reportsTo: "e3", role: "VIEWER", hireYear: 2020,
  },
  {
    id: "e7", name: "Rafał Kubiak", position: "EDM Operator Senior",
    department: "Technical", email: "r.kubiak@shapers.pl",
    phone: "+48 600 100 007", reportsTo: "e2", role: "ENGINEER", hireYear: 2013,
  },
  {
    id: "e8", name: "Michał Dąbrowski", position: "EDM Operator",
    department: "Technical", email: "m.dabrowski@shapers.pl",
    reportsTo: "e7", role: "VIEWER", hireYear: 2019,
  },
  // ── Design
  {
    id: "e9", name: "Katarzyna Jankowska", position: "Design & CAM Lead",
    department: "Design", email: "k.jankowska@shapers.pl",
    phone: "+48 600 100 009", reportsTo: "e2", role: "ENGINEER", hireYear: 2015,
  },
  {
    id: "e10", name: "Tomasz Wróbel", position: "CAD Designer",
    department: "Design", email: "t.wrobel@shapers.pl",
    reportsTo: "e9", role: "ENGINEER", hireYear: 2017,
  },
  {
    id: "e11", name: "Mateusz Kaczmarek", position: "CAM Engineer",
    department: "Design", email: "m.kaczmarek@shapers.pl",
    reportsTo: "e9", role: "ENGINEER", hireYear: 2021,
  },
  // ── Sales
  {
    id: "e12", name: "Anna Kowalczyk", position: "Sales & Commercial Director",
    department: "Sales", email: "a.kowalczyk@shapers.pl",
    phone: "+48 600 100 012", reportsTo: "e1", role: "SALES", hireYear: 2013,
  },
  {
    id: "e13", name: "Bartosz Mazur", position: "Key Account Manager (OEM)",
    department: "Sales", email: "b.mazur@shapers.pl",
    phone: "+48 600 100 013", reportsTo: "e12", role: "SALES", hireYear: 2016,
  },
  {
    id: "e14", name: "Karolina Lis", position: "Key Account Manager (Tier1)",
    department: "Sales", email: "k.lis@shapers.pl",
    phone: "+48 600 100 014", reportsTo: "e12", role: "SALES", hireYear: 2018,
  },
  // ── Finance
  {
    id: "e15", name: "Ewa Adamczyk", position: "Finance & HR Manager",
    department: "Finance", email: "e.adamczyk@shapers.pl",
    phone: "+48 600 100 015", reportsTo: "e1", role: "FINANCE", hireYear: 2014,
  },
  {
    id: "e16", name: "Paweł Zielonka", position: "Financial Controller",
    department: "Finance", email: "p.zielonka@shapers.pl",
    reportsTo: "e15", role: "FINANCE", hireYear: 2019,
  },
  // ── Quality
  {
    id: "e17", name: "Krzysztof Pawlak", position: "Quality Manager",
    department: "Quality", email: "k.pawlak@shapers.pl",
    phone: "+48 600 100 017", reportsTo: "e1", role: "ENGINEER", hireYear: 2015,
  },
  {
    id: "e18", name: "Joanna Wierzbicka", position: "QC Engineer",
    department: "Quality", email: "j.wierzbicka@shapers.pl",
    reportsTo: "e17", role: "ENGINEER", hireYear: 2022,
  },
];

// ─── Injection Presses ────────────────────────────────────────────────────────

export const INJECTION_PRESSES: InjectionPress[] = [
  { id: "pr1", name: "ARBURG 370S – 80T",      tonnage: 80,  status: "RUNNING",     currentPartId: "ip2",  utilizationPct: 88, oee: 87, plannedHours: 168, actualHours: 148 },
  { id: "pr2", name: "ENGEL E-MOTION – 150T",  tonnage: 150, status: "RUNNING",     currentPartId: "ip1",  utilizationPct: 82, oee: 83, plannedHours: 168, actualHours: 138 },
  { id: "pr3", name: "KraussMaffei – 250T",    tonnage: 250, status: "RUNNING",     currentPartId: "ip4",  utilizationPct: 79, oee: 81, plannedHours: 168, actualHours: 133 },
  { id: "pr4", name: "DEMAG D350 – 350T",      tonnage: 350, status: "MAINTENANCE", currentPartId: undefined, utilizationPct: 0, oee: 0, plannedHours: 168, actualHours: 0 },
  { id: "pr5", name: "HAITIAN MA500 – 500T",   tonnage: 500, status: "RUNNING",     currentPartId: "ip9",  utilizationPct: 71, oee: 79, plannedHours: 168, actualHours: 119 },
  { id: "pr6", name: "ENGEL DUO 800 – 800T",   tonnage: 800, status: "IDLE",        currentPartId: undefined, utilizationPct: 45, oee: 0, plannedHours: 168, actualHours: 76 },
];

// ─── Injection Parts ──────────────────────────────────────────────────────────

export const INJECTION_PARTS: InjectionPart[] = [
  { id: "ip1",  partNo: "IP-BMW-001",  description: "Door Panel Clip Set",           customerId: "c1",  material: "PP",      weightGrams: 45,  cycleTimeSec: 28, cavities: 4,  annualVolume: 840000,  pricePerPiece: 0.38, materialCostPerPiece: 0.09, status: "ACTIVE",    pressId: "pr2", launchDate: "2024-03-01", toolNo: "T-2023-008" },
  { id: "ip2",  partNo: "IP-BSH-001",  description: "Connector Housing 8-Pin",       customerId: "c2",  material: "PA66",    weightGrams: 12,  cycleTimeSec: 18, cavities: 8,  annualVolume: 4800000, pricePerPiece: 0.22, materialCostPerPiece: 0.05, status: "ACTIVE",    pressId: "pr1", launchDate: "2024-01-15", toolNo: "T-2023-004" },
  { id: "ip3",  partNo: "IP-CON-001",  description: "Air Intake Bracket",            customerId: "c3",  material: "PP+GF30", weightGrams: 68,  cycleTimeSec: 35, cavities: 2,  annualVolume: 180000,  pricePerPiece: 1.12, materialCostPerPiece: 0.28, status: "ACTIVE",    pressId: "pr2", launchDate: "2024-06-01", toolNo: "T-2023-011" },
  { id: "ip4",  partNo: "IP-VAL-001",  description: "Airbag Cover Retainer",         customerId: "c4",  material: "PC",      weightGrams: 185, cycleTimeSec: 48, cavities: 1,  annualVolume: 95000,   pricePerPiece: 2.85, materialCostPerPiece: 0.82, status: "ACTIVE",    pressId: "pr3", launchDate: "2024-09-01", toolNo: "T-2024-003" },
  { id: "ip5",  partNo: "IP-APT-001",  description: "Sensor Bracket Housing",        customerId: "c9",  material: "PA6",     weightGrams: 32,  cycleTimeSec: 22, cavities: 4,  annualVolume: 620000,  pricePerPiece: 0.58, materialCostPerPiece: 0.14, status: "ACTIVE",    pressId: "pr1", launchDate: "2025-02-01", toolNo: "T-2024-009" },
  { id: "ip6",  partNo: "IP-HEL-001",  description: "Lighting Clip Assembly",        customerId: "c10", material: "POM",     weightGrams: 8,   cycleTimeSec: 12, cavities: 16, annualVolume: 9600000, pricePerPiece: 0.11, materialCostPerPiece: 0.03, status: "ACTIVE",    pressId: "pr1", launchDate: "2023-11-01" },
  { id: "ip7",  partNo: "IP-ZF-001",   description: "Cable Routing Bracket",         customerId: "c8",  material: "PP",      weightGrams: 55,  cycleTimeSec: 30, cavities: 2,  annualVolume: 260000,  pricePerPiece: 0.72, materialCostPerPiece: 0.11, status: "ACTIVE",    pressId: "pr2", launchDate: "2024-04-01", toolNo: "T-2023-015" },
  { id: "ip8",  partNo: "IP-BMW-002",  description: "B-Pillar Trim Lower",           customerId: "c1",  material: "ABS",     weightGrams: 295, cycleTimeSec: 65, cavities: 1,  annualVolume: 120000,  pricePerPiece: 3.20, materialCostPerPiece: 0.95, status: "ACTIVE",    pressId: "pr5", launchDate: "2025-01-15", toolNo: "T-2024-007" },
  { id: "ip9",  partNo: "IP-CON-002",  description: "Blower Housing Half-Shell",     customerId: "c3",  material: "PP",      weightGrams: 420, cycleTimeSec: 72, cavities: 1,  annualVolume: 88000,   pricePerPiece: 4.15, materialCostPerPiece: 0.86, status: "ACTIVE",    pressId: "pr5", launchDate: "2025-03-01", toolNo: "T-2025-001" },
  { id: "ip10", partNo: "IP-MAG-001",  description: "Handle Escutcheon Set",         customerId: "c5",  material: "ABS",     weightGrams: 120, cycleTimeSec: 42, cavities: 2,  annualVolume: 310000,  pricePerPiece: 1.45, materialCostPerPiece: 0.38, status: "ACTIVE",    pressId: "pr3", launchDate: "2024-07-01", toolNo: "T-2024-005" },
  { id: "ip11", partNo: "IP-FAU-001",  description: "Door Armrest Insert",           customerId: "c6",  material: "PP",      weightGrams: 215, cycleTimeSec: 52, cavities: 1,  annualVolume: 75000,   pricePerPiece: 2.60, materialCostPerPiece: 0.44, status: "NPI",       pressId: "pr3", launchDate: "2026-07-01", toolNo: "T-2025-006" },
  { id: "ip12", partNo: "IP-STE-001",  description: "Instrument Panel Clip Row",     customerId: "c7",  material: "PP",      weightGrams: 22,  cycleTimeSec: 20, cavities: 8,  annualVolume: 1200000, pricePerPiece: 0.28, materialCostPerPiece: 0.05, status: "PHASE_OUT", pressId: "pr2", launchDate: "2021-06-01" },
];

// ─── Production Orders ────────────────────────────────────────────────────────

export const PRODUCTION_ORDERS: ProductionOrder[] = [
  { id: "po1",  orderNo: "PO-2026-041", partId: "ip2",  pressId: "pr1", plannedQty: 480000, actualQty: 318400, scrapQty: 6820,  plannedStart: "2026-04-01", plannedEnd: "2026-04-30", status: "RUNNING",   oee: 87, shift: "A" },
  { id: "po2",  orderNo: "PO-2026-042", partId: "ip6",  pressId: "pr1", plannedQty: 960000, actualQty: 845200, scrapQty: 6920,  plannedStart: "2026-04-01", plannedEnd: "2026-04-30", status: "RUNNING",   oee: 89, shift: "B" },
  { id: "po3",  orderNo: "PO-2026-043", partId: "ip1",  pressId: "pr2", plannedQty: 85000,  actualQty: 52000,  scrapQty: 810,   plannedStart: "2026-04-10", plannedEnd: "2026-05-15", status: "RUNNING",   oee: 83, shift: "A" },
  { id: "po4",  orderNo: "PO-2026-044", partId: "ip3",  pressId: "pr2", plannedQty: 32000,  actualQty: 21500,  scrapQty: 620,   plannedStart: "2026-04-08", plannedEnd: "2026-05-20", status: "RUNNING",   oee: 79, shift: "A" },
  { id: "po5",  orderNo: "PO-2026-045", partId: "ip4",  pressId: "pr3", plannedQty: 18000,  actualQty: 11200,  scrapQty: 138,   plannedStart: "2026-04-05", plannedEnd: "2026-05-10", status: "RUNNING",   oee: 82, shift: "B" },
  { id: "po6",  orderNo: "PO-2026-046", partId: "ip10", pressId: "pr3", plannedQty: 25000,  actualQty: 17800,  scrapQty: 326,   plannedStart: "2026-04-12", plannedEnd: "2026-05-25", status: "RUNNING",   oee: 80, shift: "A" },
  { id: "po7",  orderNo: "PO-2026-040", partId: "ip8",  pressId: "pr5", plannedQty: 22000,  actualQty: 21800,  scrapQty: 198,   plannedStart: "2026-03-20", plannedEnd: "2026-04-25", actualEnd: "2026-04-23", status: "COMPLETED", oee: 84, shift: "C" },
  { id: "po8",  orderNo: "PO-2026-048", partId: "ip9",  pressId: "pr5", plannedQty: 8500,   actualQty: 5200,   scrapQty: 172,   plannedStart: "2026-04-14", plannedEnd: "2026-05-28", status: "RUNNING",   oee: 76, shift: "A" },
  { id: "po9",  orderNo: "PO-2026-047", partId: "ip5",  pressId: "pr1", plannedQty: 180000, actualQty: 0,      scrapQty: 0,     plannedStart: "2026-05-02", plannedEnd: "2026-05-31", status: "PLANNED",   oee: 0,  shift: "A" },
  { id: "po10", orderNo: "PO-2026-038", partId: "ip7",  pressId: "pr2", plannedQty: 45000,  actualQty: 44200,  scrapQty: 820,   plannedStart: "2026-03-15", plannedEnd: "2026-04-18", actualEnd: "2026-04-20", status: "COMPLETED", oee: 85, shift: "B" },
];

// ─── RFQs ─────────────────────────────────────────────────────────────────────

export const RFQS: RFQ[] = [
  { id: "rq1",  rfqNo: "RFQ-2026-001", customerId: "c1",  description: "BMW Platform X – Front Door Panel Complete Set (5 parts)",         status: "WON",       requestDate: "2026-01-10", dueDate: "2026-02-14", sentDate: "2026-02-12", decisionDate: "2026-03-05", toolingValue: 285000, serialValuePA: 420000, estimatedToolingCost: 228000, marginPct: 20.0, partsCount: 5 },
  { id: "rq2",  rfqNo: "RFQ-2026-002", customerId: "c2",  description: "Bosch Connector Housing Family – 4-Series Platform (3 tools)",      status: "WON",       requestDate: "2026-01-18", dueDate: "2026-02-28", sentDate: "2026-02-25", decisionDate: "2026-03-15", toolingValue: 82000,  serialValuePA: 185000, estimatedToolingCost: 63000,  marginPct: 23.2, partsCount: 3 },
  { id: "rq3",  rfqNo: "RFQ-2025-018", customerId: "c3",  description: "Continental Air Management Duct Set – Generation 4",              status: "WON",       requestDate: "2025-10-05", dueDate: "2025-11-15", sentDate: "2025-11-12", decisionDate: "2025-12-10", toolingValue: 145000, serialValuePA: 210000, estimatedToolingCost: 112000, marginPct: 22.8, partsCount: 4 },
  { id: "rq4",  rfqNo: "RFQ-2025-022", customerId: "c9",  description: "Aptiv Sensor Bracket Platform A – Full Family (4 variants)",       status: "WON",       requestDate: "2025-11-20", dueDate: "2025-12-31", sentDate: "2025-12-28", decisionDate: "2026-01-20", toolingValue: 96000,  serialValuePA: 245000, estimatedToolingCost: 74500,  marginPct: 22.4, partsCount: 4 },
  { id: "rq5",  rfqNo: "RFQ-2026-005", customerId: "c8",  description: "ZF Transmission Bracket Family – 3 variants",                     status: "WON",       requestDate: "2026-02-08", dueDate: "2026-03-14", sentDate: "2026-03-12", decisionDate: "2026-04-02", toolingValue: 118000, serialValuePA: 165000, estimatedToolingCost: 89500,  marginPct: 24.2, partsCount: 3 },
  { id: "rq6",  rfqNo: "RFQ-2026-003", customerId: "c4",  description: "Valeo Airbag Module Housing – new platform",                      status: "LOST",      requestDate: "2026-01-22", dueDate: "2026-02-28", sentDate: "2026-02-26", decisionDate: "2026-03-18", toolingValue: 195000, serialValuePA: 320000, estimatedToolingCost: 152000, marginPct: 22.1, lostReason: "Price – competitor 12% lower", partsCount: 6 },
  { id: "rq7",  rfqNo: "RFQ-2025-019", customerId: "c5",  description: "Magna Handle Panel Set – 2 parts",                               status: "LOST",      requestDate: "2025-11-01", dueDate: "2025-12-01", sentDate: "2025-11-28", decisionDate: "2025-12-20", toolingValue: 58000,  serialValuePA: 95000,  estimatedToolingCost: 47000,  marginPct: 19.0, lostReason: "Customer in-house tooling preferred", partsCount: 2 },
  { id: "rq8",  rfqNo: "RFQ-2026-006", customerId: "c7",  description: "Stellantis Trim Set Complete – 7 parts",                         status: "LOST",      requestDate: "2026-02-15", dueDate: "2026-03-20", sentDate: "2026-03-18", decisionDate: "2026-04-10", toolingValue: 320000, serialValuePA: 580000, estimatedToolingCost: 258000, marginPct: 19.4, lostReason: "Program moved to Asia", partsCount: 7 },
  { id: "rq9",  rfqNo: "RFQ-2026-008", customerId: "c1",  description: "BMW Platform X – Rear Door Panel (3 parts) + B-Pillar",          status: "SENT",      requestDate: "2026-03-05", dueDate: "2026-04-30", sentDate: "2026-04-25", partsCount: 4, toolingValue: 245000, serialValuePA: 385000, estimatedToolingCost: 192000, marginPct: 21.6,
    costCalc: { material: "PP", materialCostPerKg: 1.20, weightGrams: 285, cycleTimeSec: 58, cavities: 2, annualVolume: 180000, machineRatePerHr: 38, laborRatePerHr: 18, scrapPct: 2.0, packagingCostPerPart: 0.08, logisticsCostPerPart: 0.04, sgaPct: 8, targetMarginPct: 20 } },
  { id: "rq10", rfqNo: "RFQ-2026-009", customerId: "c10", description: "Hella Lighting Carrier Module – LED Matrix platform",             status: "SENT",      requestDate: "2026-03-12", dueDate: "2026-05-02", sentDate: "2026-04-28", partsCount: 2, toolingValue: 68000,  serialValuePA: 140000, estimatedToolingCost: 53000,  marginPct: 22.1 },
  { id: "rq11", rfqNo: "RFQ-2026-010", customerId: "c3",  description: "Continental Dashboard Component Set – 5 variants",               status: "SENT",      requestDate: "2026-03-20", dueDate: "2026-05-10", sentDate: "2026-05-02", partsCount: 5, toolingValue: 178000, serialValuePA: 295000, estimatedToolingCost: 139000, marginPct: 21.9 },
  { id: "rq12", rfqNo: "RFQ-2026-011", customerId: "c6",  description: "Faurecia Door Armrest Cover – 2 color variants",                 status: "COSTING",   requestDate: "2026-04-08", dueDate: "2026-05-20", partsCount: 2, toolingValue: 92000,  serialValuePA: 160000, estimatedToolingCost: 72000,  marginPct: 21.7,
    costCalc: { material: "ABS", materialCostPerKg: 2.10, weightGrams: 165, cycleTimeSec: 42, cavities: 2, annualVolume: 120000, machineRatePerHr: 35, laborRatePerHr: 18, scrapPct: 1.8, packagingCostPerPart: 0.06, logisticsCostPerPart: 0.03, sgaPct: 8, targetMarginPct: 20 } },
  { id: "rq13", rfqNo: "RFQ-2026-012", customerId: "c8",  description: "ZF Transmission Housing Cover – premium segment",                status: "COSTING",   requestDate: "2026-04-14", dueDate: "2026-05-28", partsCount: 1, toolingValue: 55000,  serialValuePA: 88000,  estimatedToolingCost: 43000,  marginPct: 21.8,
    costCalc: { material: "PA66", materialCostPerKg: 3.20, weightGrams: 340, cycleTimeSec: 68, cavities: 1, annualVolume: 80000,  machineRatePerHr: 42, laborRatePerHr: 18, scrapPct: 2.5, packagingCostPerPart: 0.10, logisticsCostPerPart: 0.05, sgaPct: 8, targetMarginPct: 20 } },
  { id: "rq14", rfqNo: "RFQ-2026-013", customerId: "c1",  description: "BMW Instrument Panel Center Section – new EV platform",          status: "DRAFT",     requestDate: "2026-04-25", dueDate: "2026-06-15", partsCount: 8, toolingValue: 420000, serialValuePA: 680000, estimatedToolingCost: 335000, marginPct: 20.2,
    costCalc: { material: "PP+GF30", materialCostPerKg: 1.80, weightGrams: 460, cycleTimeSec: 95, cavities: 2, annualVolume: 250000, machineRatePerHr: 45, laborRatePerHr: 18, scrapPct: 2.0, packagingCostPerPart: 0.12, logisticsCostPerPart: 0.06, sgaPct: 8, targetMarginPct: 20 } },
  { id: "rq15", rfqNo: "RFQ-2025-023", customerId: "c9",  description: "Aptiv Wiring Carrier Assembly – program cancelled by customer",  status: "CANCELLED", requestDate: "2025-12-01", dueDate: "2026-01-15", partsCount: 3, toolingValue: 72000,  serialValuePA: 120000, estimatedToolingCost: 58000,  marginPct: 19.4, lostReason: "Customer program cancelled" },
];

export const getInjectionPartById = (id: string) => INJECTION_PARTS.find(p => p.id === id);
export const getPressByid = (id: string) => INJECTION_PRESSES.find(p => p.id === id);
