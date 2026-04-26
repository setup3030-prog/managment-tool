// ─── Enums ───────────────────────────────────────────────────────────────────

export type RfqStatus =
  | "NEW" | "COSTING" | "WAITING_FOR_SUPPLIER" | "SENT"
  | "NEGOTIATION" | "WON" | "LOST";

export type ClaimStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DealStage = "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type UserRole = "ADMIN" | "SALES" | "ENGINEER" | "FINANCE" | "VIEWER";
export type TrafficLight = "GREEN" | "YELLOW" | "RED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ─── Tooling ─────────────────────────────────────────────────────────────────

export type ToolingServiceType =
  | "NEW_TOOL" | "WARRANTY_REPAIR" | "PAID_REPAIR"
  | "MODIFICATION_ECO" | "CHINA_TRANSFER" | "SPARE_PARTS";

export interface ToolingCostBreakdown {
  steelCost: number;
  hotRunnerCost: number;
  purchasedComponents: number;
  designHoursPlanned: number;
  designHoursActual: number;
  camHoursPlanned: number;
  camHoursActual: number;
  cncHoursPlanned: number;
  cncHoursActual: number;
  edmHoursPlanned: number;
  edmHoursActual: number;
  fittingHoursPlanned: number;
  fittingHoursActual: number;
  tryoutLoops: number;
}

export interface ToolingMilestone {
  name: string;
  pct: number;
  plannedDate: string;
  actualDate?: string;
  invoiceAmount: number;
  invoiceStatus: "PLANNED" | "ISSUED" | "PAID" | "OVERDUE";
}

export interface ToolingProject {
  id: string;
  toolNo: string;
  customer: string;
  description: string;
  serviceType: ToolingServiceType;
  quotedRevenue: number;
  quotedCost: number;
  estimatedFinalCost: number;
  completionPct: number;
  startDate: string;
  eta: string;
  actualDelivery?: string;
  riskLevel: RiskLevel;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  costBreakdown: ToolingCostBreakdown;
  milestones: ToolingMilestone[];
  openECOs: number;
  tryoutCount: number;
  wip: number;
}

export interface WarrantyClaim {
  id: string;
  toolNo: string;
  customer: string;
  description: string;
  rootCause: string;
  cost: number;
  recovered: number;
  status: "OPEN" | "IN_REPAIR" | "CLOSED" | "DISPUTED";
  openDate: string;
  closeDate?: string;
  recoverable: boolean;
}

export interface Machine {
  id: string;
  name: string;
  type: "CNC" | "EDM" | "CMM" | "LATHE" | "GRINDER";
  utilizationPct: number;
  plannedHours: number;
  actualHours: number;
  efficiency: number;
  status: "RUNNING" | "IDLE" | "MAINTENANCE" | "BREAKDOWN";
}

// ─── Injection ────────────────────────────────────────────────────────────────

export type InjectionSegment = "AUTOMOTIVE" | "INDUSTRIAL" | "HVAC" | "MEDICAL";

export interface InjectionPart {
  id: string;
  partNo: string;
  description: string;
  customer: string;
  segment: InjectionSegment;
  annualVolume: number;
  monthlyVolume: number;
  unitPrice: number;
  materialCode: string;
  materialCostPerKg: number;
  partWeightKg: number;
  machineTons: number;
  cycleTimeSec: number;
  oee: number;
  scrapPct: number;
  laborCostPerPart: number;
  machineCostPerPart: number;
  materialCostPerPart: number;
  totalCostPerPart: number;
  marginPct: number;
  annualRevenue: number;
  annualGrossProfit: number;
  status: "ACTIVE" | "RAMPING" | "NEW" | "EOL" | "ON_HOLD";
  lastPriceUpdate: string;
  nextPriceReview: string;
}

export interface InjectionRFQ {
  id: string;
  customer: string;
  partName: string;
  segment: InjectionSegment;
  annualVolume: number;
  quotedUnitPrice: number;
  targetMarginPct: number;
  status: RfqStatus;
  submittedDate: string;
  decisionDate?: string;
  annualRevenuePotential: number;
}

// ─── Financial ───────────────────────────────────────────────────────────────

export interface FinancialPeriod {
  month: string;
  label: string;
  toolingRevenue: number;
  toolingGP: number;
  toolingGMPct: number;
  toolingEBITDA: number;
  toolingEBITDAPct: number;
  injectionRevenue: number;
  injectionGP: number;
  injectionGMPct: number;
  injectionEBITDA: number;
  injectionEBITDAPct: number;
  revenue: number;
  grossProfit: number;
  gmPct: number;
  ebitda: number;
  ebitdaPct: number;
  netProfit: number;
  netProfitPct: number;
  cashBalance: number;
  arOverdue: number;
  apOverdue: number;
  wip: number;
  rfqWon: number;
  rfqLost: number;
  rfqSent: number;
}

export interface CashFlowItem {
  id: string;
  description: string;
  customer: string;
  amount: number;
  dueDate: string;
  type: "INFLOW" | "OUTFLOW";
  status: "PLANNED" | "CONFIRMED" | "OVERDUE";
  daysOverdue?: number;
  category: string;
}

// ─── Risk / Actions ──────────────────────────────────────────────────────────

export interface RiskAction {
  id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "FINANCIAL" | "OPERATIONAL" | "COMMERCIAL" | "QUALITY" | "DELIVERY";
  impactEur: number;
  owner: string;
  dueDate: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "MONITORING";
  linkedProject?: string;
  linkedCustomer?: string;
  actions: string[];
}

export interface CeoAlert {
  id: string;
  type: "CRITICAL" | "WARNING" | "INFO" | "POSITIVE";
  title: string;
  detail: string;
  timestamp: string;
  link?: string;
}

// ─── Legacy / Shared ─────────────────────────────────────────────────────────

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface Customer {
  id: string;
  name: string;
  shortName: string;
  country: string;
  segment: string;
  contacts: Contact[];
  annualRevenue?: number;
  creditLimit?: number;
  paymentTerms?: number;
}

export interface Rfq {
  id: string;
  customerId: string;
  partName: string;
  annualVolume?: number;
  materialCode?: string;
  status: RfqStatus;
  quotedPrice?: number;
  targetMargin?: number;
  submittedDate?: string;
  decisionDate?: string;
  notes?: string;
  ownerId?: string;
  value?: number;
  service?: ToolingServiceType;
  type?: "TOOLING" | "INJECTION";
}

export interface Claim {
  id: string;
  customerId: string;
  description: string;
  status: ClaimStatus;
  priority: Priority;
  value?: number;
  openDate: string;
  closeDate?: string;
  rootCause?: string;
  notes?: string;
}

export interface PipelineDeal {
  id: string;
  customerId: string;
  title: string;
  stage: DealStage;
  value: number;
  probability: number;
  expectedClose: string;
  ownerId: string;
  notes?: string;
}

export interface Material {
  code: string;
  name: string;
  pricePerKg: number;
  trend: number;
  supplier?: string;
  priceHistory: { month: string; price: number }[];
}

export interface KpiSnapshot {
  month: string;
  revenue: number;
  grossMarginPct: number;
  oee: number;
  scrapRate: number;
  onTimeDelivery: number;
  cashBalance: number;
  rfqWon: number;
  rfqLost: number;
  rfqSent: number;
  claimsOpen: number;
  claimsValue: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export interface AppSettings {
  companyName: string;
  currency: string;
  rfqValidityDays: number;
  marginGreenThreshold: number;
  marginYellowThreshold: number;
  oeeGreenThreshold: number;
  oeeYellowThreshold: number;
  otdGreenThreshold: number;
  otdYellowThreshold: number;
  scrapGreenThreshold: number;
  scrapYellowThreshold: number;
  notifyOnNewRfq: boolean;
  notifyOnWonLost: boolean;
  notifyOnClaimOpened: boolean;
  notifyOnOverdueInvoice: boolean;
  notifyOnLowMargin: boolean;
}

export interface RfqCalculatorInputs {
  annualVolume: number;
  partWeightKg: number;
  materialPricePerKg: number;
  scrapAllowancePct: number;
  cycleTimeSec: number;
  machineTons: number;
  machineRatePerHour: number;
  laborRatePerHour: number;
  cavities: number;
  toolingAmortizationCost: number;
  sgaOverheadPct: number;
  targetMarginPct: number;
}

export interface RfqCalculatorResult {
  materialCostPerPart: number;
  machineCostPerPart: number;
  laborCostPerPart: number;
  directCostPerPart: number;
  toolingPerPart: number;
  totalVariableCost: number;
  sgaCost: number;
  totalCostPerPart: number;
  salesPrice: number;
  annualRevenue: number;
  annualProfit: number;
  breakevenQuantity: number;
  marginPct: number;
}

export interface SalesReportRow {
  customer: string;
  revenue: number;
  rfqsWon: number;
  rfqsLost: number;
  winRate: number;
  avgMargin: number;
}

export interface RfqPerformanceRow {
  month: string;
  sent: number;
  won: number;
  lost: number;
  winRate: number;
  totalValue: number;
}

export interface KpiCardData {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  status?: TrafficLight;
  sparkline?: number[];
  icon?: string;
  subtitle?: string;
}
