export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getEnrichedRfqs } from "@/data/seed-data";
import { formatCurrency, formatPct } from "@/lib/utils";
const ENRICHED_RFQS = getEnrichedRfqs();

// Generates a simple HTML-based PDF-printable page
// In production, replace with @react-pdf/renderer renderToBuffer()
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rfq = ENRICHED_RFQS.find((r) => r.id === id);

  if (!rfq) {
    return new NextResponse("RFQ not found", { status: 404 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quotation ${rfq.rfqNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: bold; color: #6366f1; }
    .brand-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
    .rfq-ref { text-align: right; }
    .rfq-ref h2 { font-size: 16px; color: #6366f1; }
    .rfq-ref p { color: #64748b; }
    section { margin-bottom: 20px; }
    h3 { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-weight: 600; color: #64748b; font-size: 10px; padding: 6px 8px; background: #f8fafc; }
    td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
    .kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .kpi-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
    .kpi-label { font-size: 9px; color: #64748b; text-transform: uppercase; }
    .kpi-value { font-size: 16px; font-weight: bold; color: #1e293b; margin-top: 2px; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 9px; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Shapers</div>
      <div class="brand-sub">Plastic Injection Moulding & Tooling<br/>Shapers GmbH · shapers.eu</div>
    </div>
    <div class="rfq-ref">
      <h2>QUOTATION</h2>
      <p>${rfq.rfqNumber}</p>
      <p>Date: ${rfq.sentAt ? new Date(rfq.sentAt).toLocaleDateString("de-DE") : new Date().toLocaleDateString("de-DE")}</p>
      ${rfq.dueDate ? `<p>Valid until: ${new Date(rfq.dueDate).toLocaleDateString("de-DE")}</p>` : ""}
    </div>
  </div>

  <section>
    <h3>Customer & Project</h3>
    <table>
      <tr><th>Customer</th><td>${rfq.customer?.name ?? "—"}</td><th>Country</th><td>${rfq.customer?.country ?? "—"}</td></tr>
      <tr><th>Project</th><td colspan="3">${rfq.projectName}</td></tr>
      <tr><th>Annual Volume</th><td>${rfq.annualVolume.toLocaleString("de-DE")} pcs/yr</td><th>Currency</th><td>${rfq.currency}</td></tr>
    </table>
  </section>

  <section>
    <h3>Part Specification</h3>
    <table>
      <tr><th>Material</th><td>${rfq.material}</td><th>Part Weight</th><td>${rfq.partWeight} kg</td></tr>
      <tr><th>Cycle Time</th><td>${rfq.cycleTime}s</td><th>Cavities</th><td>${rfq.cavities}</td></tr>
      <tr><th>Scrap Allowance</th><td>${rfq.scrapPct}%</td><th></th><td></td></tr>
    </table>
  </section>

  <section>
    <h3>Cost Structure (per part)</h3>
    <table>
      <thead><tr><th>Item</th><th>Value (${rfq.currency})</th></tr></thead>
      <tbody>
        <tr><td>Material Cost</td><td>${rfq.materialCostPerKg ? formatCurrency(rfq.partWeight * rfq.materialCostPerKg, rfq.currency) : "—"}</td></tr>
        <tr><td>Machine Cost</td><td>—</td></tr>
        <tr><td>Labour Cost</td><td>—</td></tr>
        <tr><td>Packaging</td><td>${formatCurrency(rfq.packagingCost, rfq.currency)}</td></tr>
        <tr><td>Logistics</td><td>${formatCurrency(rfq.logisticsCost, rfq.currency)}</td></tr>
        <tr><td>Tooling (amortised)</td><td>${rfq.breakevenQty && rfq.annualVolume ? formatCurrency(rfq.toolingCost / rfq.annualVolume, rfq.currency) : "—"}</td></tr>
        <tr><td>SG&A (${rfq.sgaPct}%)</td><td>—</td></tr>
        <tr style="font-weight:bold; background:#f8fafc;"><td>Total Part Cost</td><td>${rfq.partCost ? formatCurrency(rfq.partCost, rfq.currency) : "—"}</td></tr>
        <tr style="font-weight:bold; color:#6366f1;"><td>Quoted Unit Price</td><td>${rfq.salesPrice ? formatCurrency(rfq.salesPrice, rfq.currency) : "—"}</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h3>Commercial Summary</h3>
    <div class="kpi">
      <div class="kpi-box"><div class="kpi-label">Unit Price</div><div class="kpi-value">${rfq.salesPrice ? formatCurrency(rfq.salesPrice, rfq.currency) : "—"}</div></div>
      <div class="kpi-box"><div class="kpi-label">Annual Revenue</div><div class="kpi-value">${rfq.annualRevenue ? formatCurrency(rfq.annualRevenue, rfq.currency, true) : "—"}</div></div>
      <div class="kpi-box"><div class="kpi-label">Gross Margin</div><div class="kpi-value">${rfq.grossMarginPct ? formatPct(rfq.grossMarginPct) : "—"}</div></div>
      <div class="kpi-box"><div class="kpi-label">Tooling Investment</div><div class="kpi-value">${formatCurrency(rfq.toolingCost, rfq.currency, true)}</div></div>
    </div>
  </section>

  <section>
    <h3>Terms & Conditions</h3>
    <table>
      <tr><th>Payment Terms</th><td>${rfq.customer?.paymentTerms ?? "Net 45"}</td><th>Validity</th><td>30 days from issue date</td></tr>
      <tr><th>Tooling Payment</th><td>50% upfront, 50% at T1</td><th>PPAP Level</th><td>Level 3</td></tr>
    </table>
  </section>

  <div class="footer">
    This quotation is confidential and intended solely for the named customer. All prices are exclusive of VAT.<br/>
    Shapers GmbH · IATF 16949 Certified · Generated by Shapers Command Center
  </div>

  <script>window.print();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
