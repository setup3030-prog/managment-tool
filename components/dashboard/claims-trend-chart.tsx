"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "Nov", open: 4, resolved: 2 },
  { month: "Dec", open: 5, resolved: 3 },
  { month: "Jan", open: 4, resolved: 4 },
  { month: "Feb", open: 3, resolved: 3 },
  { month: "Mar", open: 5, resolved: 2 },
  { month: "Apr", open: 5, resolved: 1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-amber-400">Open: {payload[0]?.value}</p>
      <p className="text-emerald-400">Resolved: {payload[1]?.value}</p>
    </div>
  );
};

export function ClaimsTrendChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Claims Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="open" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} activeDot={{ r: 5 }} animationDuration={800} />
            <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
