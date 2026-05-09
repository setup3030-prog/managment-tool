import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TrafficLight } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency = "EUR",
  compact = false
): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  }
  if (compact && Math.abs(value) >= 10_000) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  }
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, compact = false): string {
  if (compact && value >= 1_000_000) {
    return new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(value);
  }
  return new Intl.NumberFormat("de-DE").format(value);
}

export function trafficLight(
  value: number,
  greenMin: number,
  yellowMin: number,
  inverted = false
): TrafficLight {
  if (inverted) {
    if (value <= greenMin) return "green";
    if (value <= yellowMin) return "yellow";
    return "red";
  }
  if (value >= greenMin) return "green";
  if (value >= yellowMin) return "yellow";
  return "red";
}

export function trafficLightColor(light: TrafficLight): string {
  switch (light) {
    case "green":
      return "bg-emerald-500";
    case "yellow":
      return "bg-amber-400";
    case "red":
      return "bg-red-500";
  }
}

export function trafficLightText(light: TrafficLight): string {
  switch (light) {
    case "green":
      return "text-emerald-400";
    case "yellow":
      return "text-amber-400";
    case "red":
      return "text-red-400";
  }
}

export function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `In ${diffDays}d`;
  return `${Math.abs(diffDays)}d ago`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
