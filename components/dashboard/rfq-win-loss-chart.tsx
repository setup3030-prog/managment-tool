"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPI_SNAPSHOTS } from "@/data/seed-data";

const data = KPI_SNAPSHOTS.slice(-8).map((k) => ({
  month: k.month.slice(5, 7) + "/" + k.month.slice(2, 4),
  Won: k.rfqWon ?? 0,
  Lost: k.rfqLost ?? 0,
  "Win Rate": k.rfqWon && k.rfqLost !== undefined
    ? Math.round((k.rfqWon / ((k.rfqWon ?? 0) + (k.rfqLost ?? 0))) * 100)
    : 0,
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const won = payload.find((p: any) => p.dataKey === "Won")?.value ?? 0;
  const lost = payload.find((p: any) => p.dataKey === "Lost")?.value ?? 0;
  const total = won + lost;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-emerald-400">Won: {won}</p>
      <p className="text-red-400">Lost: {lost}</p>
      {total > 0 && <p className="text-muted-foreground mt-1">Win rate: {Math.round((won / total) * 100)}%</p>}
    </div>
  );
};

export function RfqWinLossChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">RFQ Win / Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Won" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={18} animationDuration={800} />
            <Bar dataKey="Lost" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={18} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
