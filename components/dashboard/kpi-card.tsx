"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, trafficLightColor } from "@/lib/utils";
import type { KpiCardData } from "@/types";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KpiCardProps {
  data: KpiCardData;
  index?: number;
}

export function KpiCard({ data, index = 0 }: KpiCardProps) {
  const { title, value, trend, trendPositive, trafficLight, icon, sparklineData, subtitle } = data;

  const trendColor =
    trend === undefined ? "" :
    trend > 0
      ? trendPositive !== false ? "text-emerald-400" : "text-red-400"
      : trendPositive !== false ? "text-red-400" : "text-emerald-400";

  const TrendIcon = trend === undefined ? Minus : trend > 0 ? TrendingUp : TrendingDown;

  const sparkData = sparklineData?.map((v, i) => ({ v }));

  const dotColor =
    trafficLight === "green" ? "bg-emerald-500" :
    trafficLight === "yellow" ? "bg-amber-400" : "bg-red-500";

  const lineColor =
    trafficLight === "green" ? "#10b981" :
    trafficLight === "yellow" ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5 cursor-default group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full shrink-0", dotColor, trafficLight === "green" ? "animate-pulse" : "")} />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        </div>
        {sparkData && (
          <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke={lineColor} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-3">
        <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-xs font-medium mb-0.5", trendColor)}>
            <TrendIcon size={12} />
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
      )}

      {/* Accent line at bottom */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-0.5", dotColor, "opacity-40")} />
    </motion.div>
  );
}
