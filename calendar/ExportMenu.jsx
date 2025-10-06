/**
 * @fileoverview Calendar export menu component for CSV and ICS formats
 * @description Provides export functionality for calendar events
 */

import React from "react";
import { Button } from "@/ui/button.jsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu.jsx";
import { Download } from "lucide-react";
import { format } from "date-fns";

/**
 * Download a file to the user's computer
 * @param {string} filename - Filename for download
 * @param {string} text - File content
 * @param {string} [mime] - MIME type
 */
function download(filename, text, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Convert events to CSV format
 * @param {Array<Object>} events - Calendar events
 * @returns {string} CSV string
 */
function toCsv(events) {
  const headers = ["date", "type", "title", "amount", "subtitle"];
  const rows = (events || []).map((e) => [
    e.date ? format(e.date, "yyyy-MM-dd") : "",
    e.type || "",
    (e.title || "").replace(/"/g, '""'),
    e.amount ?? "",
    (e.subtitle || "").replace(/"/g, '""'),
  ]);
  return [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
}

/**
 * Pad number for ICS date format
 * @param {number} n - Number to pad
 * @returns {string} Padded string
 */
function pad(n) { return (n < 10 ? "0" : "") + n; }

/**
 * Convert date to ICS format (YYYYMMDD)
 * @param {Date} d - Date to convert
 * @returns {string} ICS date string
 */
function toICSDate(d) {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate())
  );
}

/**
 * Convert events to ICS (iCalendar) format
 * @param {Array<Object>} events - Calendar events
 * @param {string} [calName] - Calendar name
 * @returns {string} ICS string
 */
function toIcs(events, calName = "Unified Calendar") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Financial Shift//Unified Calendar//EN",
    `X-WR-CALNAME:${calName}`,
  ];
  (events || []).forEach((e, idx) => {
    if (!e?.date) return;
    const dateStr = toICSDate(e.date);
    const summary = (e.title || e.type || "Event").replace(/[\n\r]/g, " ");
    const uid = `unical-${dateStr}-${idx}@financial-shift`;
    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `UID:${uid}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${(e.subtitle || "").replace(/[\n\r]/g, " ")}`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Export menu component for calendar data
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.events=[]] - Calendar events to export
 * @param {Date} props.monthDate - Current month date
 * @returns {JSX.Element} Export dropdown menu
 */
function ExportMenu({ events = [], monthDate }) {
  const monthLabel = monthDate ? format(monthDate, "yyyy-MM") : "export";
  
  /**
   * Handle CSV export
   */
  const handleCsv = React.useCallback(() => {
    download(`calendar-${monthLabel}.csv`, toCsv(events), "text/csv;charset=utf-8");
  }, [events, monthLabel]);
  
  /**
   * Handle ICS export
   */
  const handleIcs = React.useCallback(() => {
    download(`calendar-${monthLabel}.ics`, toIcs(events, `Calendar ${monthLabel}`), "text/calendar;charset=utf-8");
  }, [events, monthLabel]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCsv}>Export CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={handleIcs}>Export ICS</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default React.memo(ExportMenu);