
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function toCSV(rows) {
  const data = Array.isArray(rows) ? rows : [];
  if (data.length === 0) return "";

  const headers = Array.from(
    data.reduce((set, row) => {
      Object.keys(row || {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const escapeCell = (val) => {
    if (val === null || val === undefined) return "";
    const str =
      typeof val === "object" ? JSON.stringify(val) : String(val);
    const needsQuotes =
      str.includes(",") || str.includes('"') || str.includes("\n");
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const lines = data.map((row) =>
    headers.map((h) => escapeCell(row ? row[h] : "")).join(",")
  );

  return [headerLine, ...lines].join("\n");
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function DataExportComponent({ datasets = {}, fileBase = "export" }) {
  const { toast } = useToast();

  const safeDatasets = React.useMemo(() => {
    return Object.entries(datasets || {}).reduce((acc, [k, v]) => {
      acc[k] = Array.isArray(v) ? v : [];
      return acc;
    }, {});
  }, [datasets]);

  const allEmpty = React.useMemo(
    () => Object.values(safeDatasets).every((arr) => !Array.isArray(arr) || arr.length === 0),
    [safeDatasets]
  );

  const handleExportAllJSON = React.useCallback(() => {
    const payload = {
      exported_at: new Date().toISOString(),
      ...safeDatasets,
    };
    const json = JSON.stringify(payload, null, 2);
    downloadBlob(json, `${fileBase}.json`, "application/json");
    toast({
      title: "Export started",
      description: "Your JSON export has been downloaded.",
    });
  }, [safeDatasets, fileBase, toast]);

  const handleExportCSV = React.useCallback((key) => {
    const rows = safeDatasets[key] || [];
    const csv = toCSV(rows);
    const name = `${fileBase}_${key}.csv`;
    downloadBlob(csv, name, "text/csv;charset=utf-8");
    toast({
      title: "Export started",
      description: `${key} CSV export has been downloaded.`,
    });
  }, [safeDatasets, fileBase, toast]);

  const datasetKeys = React.useMemo(() => Object.keys(safeDatasets), [safeDatasets]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 min-w-[140px]"
          disabled={allEmpty}
          title={allEmpty ? "No data to export" : "Export data"}
          aria-label="Export data"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" aria-label="Export options">
        <DropdownMenuLabel className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-primary" /> Export All
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleExportAllJSON} aria-label="Download all data as JSON">
          Download JSON
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" /> CSV (per set)
        </DropdownMenuLabel>
        {datasetKeys.map((key) => {
          const isEmpty = !safeDatasets[key]?.length;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleExportCSV(key)}
              disabled={isEmpty}
              className="capitalize"
              aria-label={`Download ${key} as CSV${isEmpty ? " (empty)" : ""}`}
            >
              {key} {isEmpty ? "— empty" : ""}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const DataExport = React.memo(DataExportComponent);
export default DataExport;
