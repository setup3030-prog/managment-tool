"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MATERIALS } from "@/data/seed-data";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];
const MONTHS = MATERIALS[0].priceTrend.slice(-8).map((p) => p.month.slice(5, 7) + "/" + p.month.slice(2, 4));

const data = MONTHS.map((month, i) => {
  const entry: Record<string, string | number> = { month };
  MATERIALS.forEach((mat) => {
    entry[mat.name] = mat.priceTrend.slice(-8)[i]?.price ?? 0;
  });
  return entry;
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.stroke }}>{p.dataKey}: €{p.value.toFixed(2)}/kg</p>
      ))}
    </div>
  );
};

export function MaterialPriceChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Material Price Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v.toFixed(1)}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {MATERIALS.map((mat, i) => (
              <Line
                key={mat.name}
                type="monotone"
                dataKey={mat.name}
                stroke={COLORS[i]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={800 + i * 100}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
