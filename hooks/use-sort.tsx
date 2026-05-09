"use client";
import { useState } from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

export function useSort() {
  const [col, setCol] = useState<string | null>(null);
  const [dir, setDir] = useState<SortDir>("asc");

  function toggle(key: string) {
    if (col === key) {
      if (dir === "asc") setDir("desc");
      else { setCol(null); setDir("asc"); }
    } else {
      setCol(key);
      setDir("asc");
    }
  }

  function apply<T>(
    items: T[],
    accessors: Partial<Record<string, (item: T) => string | number>>
  ): T[] {
    if (!col) return items;
    const acc = accessors[col];
    if (!acc) return items;
    return [...items].sort((a, b) => {
      const av = acc(a), bv = acc(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? cmp : -cmp;
    });
  }

  return { col, dir, toggle, apply };
}

export function SortHead({ label, sort, className }: {
  label: string;
  sort: ReturnType<typeof useSort>;
  className?: string;
}) {
  const active = sort.col === label;
  return (
    <th
      onClick={() => sort.toggle(label)}
      className={cn(
        "cursor-pointer select-none hover:text-foreground transition-colors",
        className
      )}
    >
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {label}
        {active ? (
          sort.dir === "asc"
            ? <ArrowUp className="w-3 h-3 text-indigo-400 shrink-0" />
            : <ArrowDown className="w-3 h-3 text-indigo-400 shrink-0" />
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-40 shrink-0" />
        )}
      </span>
    </th>
  );
}
