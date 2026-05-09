// ─── Enums ───────────────────────────────────────────────────────────────────

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

// ─── Financial ───────────────────────────────────────────────────────────────

export interface FinancialPeriod {
  month: string;
  label: string;
  toolingRevenue: number;
  toolingGP: number;
  toolingGMPct: number;
  toolingEBITDA: number;
  toolingEBITDAPct: number;
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
  status: "PLANNED" | "CONFIRMED" | "OVERDUE" | "ISSUED";
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

// ─── Org Chart ────────────────────────────────────────────────────────────────

export type OrgDepartment = "Management" | "Technical" | "Design" | "Sales" | "Finance" | "Quality";

export interface OrgEmployee {
  id: string;
  name: string;
  position: string;
  department: OrgDepartment;
  email: string;
  phone?: string;
  reportsTo?: string;
  role: UserRole;
  hireYear?: number;
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

// ─── Injection Moulding ──────────────────────────────────────────────────────

export type InjectionMaterial = "PP" | "PP+GF30" | "PA66" | "PA6" | "ABS" | "PC" | "POM" | "PBT" | "PE" | "TPE";
export type InjectionPartStatus = "ACTIVE" | "NPI" | "PHASE_OUT" | "OBSOLETE";
export type ProductionOrderStatus = "PLANNED" | "RUNNING" | "COMPLETED" | "ON_HOLD" | "CANCELLED";

export interface InjectionPart {
  id: string;
  partNo: string;
  description: string;
  customerId: string;
  material: InjectionMaterial;
  weightGrams: number;
  cycleTimeSec: number;
  cavities: number;
  annualVolume: number;
  pricePerPiece: number;
  materialCostPerPiece: number;
  status: InjectionPartStatus;
  pressId: string;
  launchDate: string;
  toolNo?: string;
}

export interface ProductionOrder {
  id: string;
  orderNo: string;
  partId: string;
  pressId: string;
  plannedQty: number;
  actualQty: number;
  scrapQty: number;
  plannedStart: string;
  plannedEnd: string;
  actualEnd?: string;
  status: ProductionOrderStatus;
  oee: number;
  shift: "A" | "B" | "C" | "N";
}

export interface InjectionPress {
  id: string;
  name: string;
  tonnage: number;
  status: "RUNNING" | "IDLE" | "MAINTENANCE" | "BREAKDOWN";
  currentPartId?: string;
  utilizationPct: number;
  oee: number;
  plannedHours: number;
  actualHours: number;
}

// ─── RFQ / Sales ─────────────────────────────────────────────────────────────

export type RfqStatus = "DRAFT" | "COSTING" | "SENT" | "WON" | "LOST" | "CANCELLED";

export interface RfqCostCalc {
  material: InjectionMaterial;
  materialCostPerKg: number;
  weightGrams: number;
  cycleTimeSec: number;
  cavities: number;
  annualVolume: number;
  machineRatePerHr: number;
  laborRatePerHr: number;
  scrapPct: number;
  packagingCostPerPart: number;
  logisticsCostPerPart: number;
  sgaPct: number;
  targetMarginPct: number;
}

export interface RFQ {
  id: string;
  rfqNo: string;
  customerId: string;
  description: string;
  status: RfqStatus;
  requestDate: string;
  dueDate: string;
  sentDate?: string;
  decisionDate?: string;
  toolingValue: number;
  serialValuePA: number;
  estimatedToolingCost: number;
  marginPct: number;
  lostReason?: string;
  notes?: string;
  partsCount: number;
  costCalc?: RfqCostCalc;
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
