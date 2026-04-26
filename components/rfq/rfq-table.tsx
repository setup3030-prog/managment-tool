"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Eye, Edit, FileDown, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RfqStatusBadge } from "./rfq-status-badge";
import type { Rfq } from "@/types";
import { formatCurrency, formatPct, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RfqTableProps {
  rfqs: Rfq[];
}

export function RfqTable({ rfqs }: RfqTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 12;

  const columns: ColumnDef<Rfq>[] = [
    {
      accessorKey: "rfqNumber",
      header: "RFQ #",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.rfqNumber}</span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.customer?.name ?? "",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.customer?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.original.customer?.country}</p>
        </div>
      ),
    },
    {
      accessorKey: "projectName",
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-foreground" onClick={() => column.toggleSorting()}>
          Project <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => <p className="text-sm max-w-[200px] truncate">{row.original.projectName}</p>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <RfqStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "annualRevenue",
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-foreground" onClick={() => column.toggleSorting()}>
          Annual Value <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-sm">
          {row.original.annualRevenue ? formatCurrency(row.original.annualRevenue, row.original.currency, true) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "grossMarginPct",
      header: "Margin",
      cell: ({ row }) => {
        const m = row.original.grossMarginPct;
        return m ? (
          <span className={cn("font-semibold text-sm", m >= 15 ? "text-emerald-400" : m >= 10 ? "text-amber-400" : "text-red-400")}>
            {formatPct(m)}
          </span>
        ) : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const d = row.original.dueDate;
        if (!d) return <span className="text-muted-foreground text-sm">—</span>;
        const days = Math.round((new Date(d).getTime() - Date.now()) / 86_400_000);
        return (
          <span className={cn("text-sm", days < 0 ? "text-red-400" : days < 7 ? "text-amber-400" : "text-muted-foreground")}>
            {formatDate(d)}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/rfq/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Eye size={13} />
            </Button>
          </Link>
          <Link href={`/rfq/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit size={13} />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => toast.error("Delete not available in demo mode")}>
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: rfqs,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-border hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground h-10">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  No RFQs found. Try adjusting filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {rfqs.length} total · Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft size={13} />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
