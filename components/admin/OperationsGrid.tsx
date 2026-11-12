"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridApi,
} from "ag-grid-community";
import { Search, Download } from "lucide-react";
import { Avatar, StatusPill } from "@/components/ui";
import { CATEGORY_LABELS, type Category } from "@/types";
import { timeAgo, usd } from "@/lib/money";
import { cn } from "@/lib/cn";

ModuleRegistry.registerModules([AllCommunityModule]);

const hfTheme = themeQuartz.withParams({
  accentColor: "#ff5a1f",
  backgroundColor: "#ffffff",
  borderColor: "#f0ebe3",
  browserColorScheme: "light",
  fontFamily: "inherit",
  fontSize: "12.5px",
  headerBackgroundColor: "#faf8f3",
  headerFontWeight: 600,
  headerTextColor: "#8b8278",
  oddRowBackgroundColor: "#ffffff",
  rowHoverColor: "#fff6f1",
  selectedRowBackgroundColor: "#ffede4",
  borderRadius: "12px",
  wrapperBorderRadius: "18px",
  cellHorizontalPadding: "14px",
  headerHeight: "44px",
  rowHeight: "56px",
});

export interface TaskRow {
  id: string;
  code: string;
  title: string;
  category: Category;
  status: string;
  buyer: string | null;
  provider: string | null;
  providerTone: string;
  total: number;
  paymentMode: string;
  updatedAt: string;
}

const STATUSES = [
  "all",
  "open",
  "assigned",
  "in_progress",
  "submitted",
  "ai_review",
  "awaiting_confirmation",
  "completed",
  "disputed",
  "cancelled",
];

export function OperationsGrid({ rows }: { rows: TaskRow[] }) {
  const router = useRouter();
  const apiRef = useRef<GridApi<TaskRow> | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(
    () => (status === "all" ? rows : rows.filter((r) => r.status === status)),
    [rows, status],
  );

  const columnDefs = useMemo<ColDef<TaskRow>[]>(
    () => [
      {
        field: "code",
        headerName: "Task",
        width: 98,
        cellClass: "font-mono text-[11px] text-[#8b8278]",
      },
      {
        field: "title",
        headerName: "Work",
        flex: 2,
        minWidth: 220,
        cellRenderer: (p: { data?: TaskRow }) =>
          p.data ? (
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-ink">{p.data.title}</div>
              <div className="truncate text-[10.5px] text-muted">
                {CATEGORY_LABELS[p.data.category]}
              </div>
            </div>
          ) : null,
      },
      {
        headerName: "Provider",
        field: "provider",
        flex: 1,
        minWidth: 150,
        cellRenderer: (p: { data?: TaskRow }) =>
          p.data?.provider ? (
            <div className="flex items-center gap-2">
              <Avatar name={p.data.provider} tone={p.data.providerTone} size={22} />
              <span className="truncate text-[12px] text-ink-2">{p.data.provider}</span>
            </div>
          ) : (
            <span className="text-[11.5px] text-muted">Unassigned</span>
          ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 196,
        cellRenderer: (p: { value?: string }) => (p.value ? <StatusPill status={p.value} /> : null),
      },
      {
        field: "total",
        headerName: "Value",
        width: 108,
        type: "rightAligned",
        valueFormatter: (p) => (typeof p.value === "number" ? usd(p.value) : ""),
        cellClass: "tnum font-medium",
      },
      {
        field: "paymentMode",
        headerName: "PayPal",
        width: 116,
        cellRenderer: (p: { value?: string }) => (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10.5px]",
              p.value === "paypal" ? "bg-lime-soft text-forest" : "bg-[#f3efe9] text-ink-2",
            )}
          >
            {p.value === "paypal" ? "sandbox" : "simulator"}
          </span>
        ),
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 104,
        valueFormatter: (p) => (p.value ? timeAgo(String(p.value)) : ""),
        cellClass: "text-[11.5px] text-[#8b8278]",
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<TaskRow>>(
    () => ({ sortable: true, resizable: true, filter: true, suppressHeaderMenuButton: true }),
    [],
  );

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 px-1 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-[#fbf9f5] px-3 py-1.5">
          <Search size={14} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search every task…"
            className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-[#a9a199]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink-2 outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          onClick={() => apiRef.current?.exportDataAsCsv({ fileName: "humanfallback-tasks.csv" })}
          className="btn btn-ghost px-3 py-1.5 text-[12px]"
        >
          <Download size={13} /> Export CSV
        </button>
        <span className="hidden text-[11px] text-muted md:inline">{filtered.length} tasks</span>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-line-soft">
        <AgGridReact<TaskRow>
          theme={hfTheme}
          rowData={filtered}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={query}
          domLayout="autoHeight"
          pagination
          paginationPageSize={8}
          paginationPageSizeSelector={[8, 16, 32]}
          suppressCellFocus
          onGridReady={(e) => {
            apiRef.current = e.api;
          }}
          onRowClicked={(e) => {
            if (e.data) router.push(`/tasks/${e.data.id}`);
          }}
          rowStyle={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
}
