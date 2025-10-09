
import React from "react";
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth, addMonths, format, parseISO } from "date-fns";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Search } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { BNPLPlan } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { Shift } from "@/api/entities";
import { Bill } from "@/api/entities";
import FiltersToolbar from "@/calendar/FiltersToolbar";
import UnifiedMonthGrid from "@/calendar/UnifiedMonthGrid";
import ExportMenu from "@/calendar/ExportMenu";
import CalendarSettings from "@/calendar/CalendarSettings";
import { Loading } from "@/ui/loading";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import QuickFilters from "@/calendar/QuickFilters";

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(n || 0));
  } catch {
    return `$${Number(n || 0).toFixed(2)}`;
  }
}

function clampDay(year, monthIndex, day) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(1, Number(day) || 1), lastDay);
}

function monthlyOccurrences(dayOfMonth, rangeStart, rangeEnd, stepMonths = 1) {
  const out = [];
  let y = rangeStart.getFullYear();
  let m = rangeStart.getMonth();
  // start at the first month in range
  let d = new Date(y, m, clampDay(y, m, dayOfMonth));
  if (d < rangeStart) {
    m += stepMonths;
    d = new Date(y, m, clampDay(y, m, dayOfMonth));
  }
  while (d <= rangeEnd) {
    out.push(new Date(d));
    m += stepMonths;
    d = new Date(d.getFullYear(), m, clampDay(d.getFullYear(), m, dayOfMonth));
  }
  return out;
}

function occurrencesFromAnchorEveryNDays(anchorISO, nDays, rangeStart, rangeEnd, maxCount = 10) {
  if (!anchorISO || !nDays) return [];
  let d = new Date(anchorISO);
  const out = [];
  while (d < rangeStart) d = addDays(d, nDays);
  while (d <= rangeEnd && out.length < maxCount) {
    out.push(new Date(d));
    d = addDays(d, nDays);
  }
  return out;
}

export default function UnifiedCalendar() {
  const { bills, debts, shifts, transactions, loading, refreshData } = useFinancialData();
  const [bnpl, setBnpl] = React.useState([]);
  const [bnplLoading, setBnplLoading] = React.useState(true);

  const [month, setMonth] = useLocalStorage("apex-finance:calendar-month", startOfMonth(new Date()).toISOString());
  const monthDate = React.useMemo(() => new Date(month), [month]);

  const rangeStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });

  const [filters, setFilters] = useLocalStorage("apex-finance:calendar-filters", {
    shifts: true,
    bills: true,
    debts: true,
    bnpl: true,
    subscriptions: true,
    payments: false,
  });

  const [settings, setSettings] = useLocalStorage("apex-finance:calendar-settings", {
    showNetChips: true,
    compactMode: false,
    highlightToday: true,
  });

  const [query, setQuery] = useLocalStorage("apex-finance:calendar-search", "");
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [query]);

  React.useEffect(() => {
    (async () => {
      setBnplLoading(true);
      try {
        const data = await BNPLPlan.list();
        setBnpl(Array.isArray(data) ? data : []);
      } finally {
        setBnplLoading(false);
      }
    })();
  }, []);

  const weeks = React.useMemo(() => {
    const days = [];
    let cur = new Date(rangeStart);
    while (cur <= rangeEnd) {
      days.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7).map((d) => ({ date: d, inMonth: isSameMonth(d, monthDate) })));
    }
    return rows;
  }, [rangeStart, rangeEnd, monthDate]);

  const events = React.useMemo(() => {
    const out = [];
    const addEvent = (obj) =>
      out.push({
        id: `${obj.type}-${obj.id}-${obj.date.toISOString()}`,
        ...obj,
        amountFormatted: obj.amount !== undefined ? formatCurrency(obj.amount) : undefined,
      });

    if (filters.shifts && Array.isArray(shifts)) {
      for (const s of shifts) {
        const dt = new Date(s.start_datetime);
        if (dt >= rangeStart && dt <= rangeEnd) {
          addEvent({
            id: s.id || `shift-${dt.getTime()}`,
            sourceId: s.id, // add source id
            type: "shift",
            title: s.title || "Shift",
            date: dt,
            time: `${format(new Date(s.start_datetime), "p")} - ${format(new Date(s.end_datetime), "p")}`,
            subtitle: [s.department, s.location].filter(Boolean).join(" • "),
            amount: s.net_pay,
          });
        }
      }
    }

    if (Array.isArray(bills)) {
      for (const b of bills) {
        const isSub = b.category === "subscriptions";
        if ((isSub && !filters.subscriptions) || (!isSub && !filters.bills)) continue;

        const day = Number(b.due_date);
        const freq = b.frequency || "monthly";

        const pushBill = (d) => addEvent({
          id: b.id || `bill-${day}`,
          sourceId: b.id,
          type: isSub ? "subscription" : "bill",
          title: b.name || (isSub ? "Subscription" : "Bill"),
          date: d,
          amount: b.amount,
        });

        if (freq === "monthly") {
          monthlyOccurrences(day, rangeStart, rangeEnd, 1).forEach(pushBill);
        } else if (freq === "quarterly") {
          monthlyOccurrences(day, rangeStart, rangeEnd, 3).forEach(pushBill);
        } else if (freq === "annually") {
          monthlyOccurrences(day, rangeStart, rangeEnd, 12).forEach(pushBill);
        } else if (freq === "weekly" || freq === "biweekly") {
          const anchor =
            b.last_paid_date ||
            new Date(
              monthDate.getFullYear(),
              monthDate.getMonth(),
              clampDay(monthDate.getFullYear(), monthDate.getMonth(), day)
            ).toISOString();
          const step = freq === "weekly" ? 7 : 14;
          occurrencesFromAnchorEveryNDays(anchor, step, rangeStart, rangeEnd, 10).forEach(pushBill);
        }
      }
    }

    if (filters.debts && Array.isArray(debts)) {
      for (const d of debts) {
        const day = Number(d.due_date);
        monthlyOccurrences(day, rangeStart, rangeEnd, 1).forEach((dd) =>
          addEvent({
            id: d.id || `debt-${day}`,
            sourceId: d.id,
            type: "debt",
            title: d.name || "Debt payment",
            date: dd,
            amount: d.minimum_payment,
          })
        );
      }
    }

    if (filters.bnpl && Array.isArray(bnpl)) {
      for (const p of bnpl) {
        const freq = p.payment_frequency || "biweekly";
        const step = freq === "weekly" ? 7 : freq === "monthly" ? 30 : 14;
        const remaining = Number(p.remaining_installments || 0);
        const anchor = p.next_due_date || p.first_payment_date || new Date().toISOString();
        occurrencesFromAnchorEveryNDays(anchor, step, rangeStart, rangeEnd, Math.min(remaining || 10, 10)).forEach((dd, idx) =>
          addEvent({
            id: p.id || `bnpl-${idx}`,
            sourceId: p.id,
            type: "bnpl",
            title: `${p.provider || "BNPL"} • ${p.merchant || "Purchase"}`,
            date: dd,
            amount: p.installment_amount,
          })
        );
      }
    }

    if (filters.payments && Array.isArray(transactions)) {
      for (const t of transactions) {
        if (t.type !== "expense") continue;
        const dt = parseISO(t.date);
        if (dt < rangeStart || dt > rangeEnd) continue;
        addEvent({
          id: t.id || `txn-${dt.getTime()}`,
          sourceId: t.id,
          type: "payment",
          title: t.title || (t.category || "Payment"),
          date: dt,
          amount: t.amount,
          subtitle: t.category || "",
        });
      }
    }

    // Apply search filter
    const q = debouncedQuery;
    if (q) {
      return out.filter((e) => (e.title || "").toLowerCase().includes(q) || (e.subtitle || "").toLowerCase().includes(q));
    }
    return out;
  }, [filters, shifts, bills, debts, bnpl, transactions, rangeStart, rangeEnd, debouncedQuery, monthDate]);

  const eventsByDate = React.useMemo(() => {
    const m = new Map();
    events.forEach((e) => {
      const k = format(e.date, "yyyy-MM-dd");
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(e);
    });
    return m;
  }, [events]);

  // keyboard shortcuts: ← → to move months, T to go today
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") {
        setMonth(startOfMonth(addMonths(monthDate, -1)).toISOString());
      } else if (e.key === "ArrowRight") {
        setMonth(startOfMonth(addMonths(monthDate, 1)).toISOString());
      } else if (e.key.toLowerCase() === "t") {
        setMonth(startOfMonth(new Date()).toISOString());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [monthDate, setMonth]);

  const handlePrev = React.useCallback(() => {
    setMonth(startOfMonth(addMonths(monthDate, -1)).toISOString());
  }, [monthDate, setMonth]);
  const handleNext = React.useCallback(() => {
    setMonth(startOfMonth(addMonths(monthDate, 1)).toISOString());
  }, [monthDate, setMonth]);
  const handleToday = React.useCallback(() => {
    setMonth(startOfMonth(new Date()).toISOString());
  }, [setMonth]);

  const handleGoToDate = (e) => {
    const val = e.target.value; // yyyy-MM
    if (!val) return;
    const [y, m] = val.split("-").map((x) => parseInt(x, 10));
    if (!isNaN(y) && !isNaN(m)) {
      setMonth(startOfMonth(new Date(y, m - 1, 1)).toISOString());
    }
  };

  // Interactive handlers
  const handleQuickAdd = React.useCallback(async (type, date) => {
    const day = format(date, "yyyy-MM-dd");
    if (type === "shift") {
      const start = new Date(date); start.setHours(8,0,0,0);
      const end = new Date(date); end.setHours(17,0,0,0); // A more common shift end time
      await Shift.create({
        title: "Shift",
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        scheduled_hours: 9, // 17 - 8 = 9
        status: "scheduled",
      });
      await refreshData(["shifts"]);
      return;
    }
    if (type === "expense" || type === "income") {
      await Transaction.create({
        title: type === "expense" ? "New Expense" : "New Income",
        amount: 0,
        category: type === "expense" ? "other_expense" : "other_income",
        type,
        date: day,
        account: "checking",
      });
      await refreshData(["transactions"]);
    }
  }, [refreshData]);

  const handleEventAction = React.useCallback(async (action, ev, date) => {
    const day = format(date, "yyyy-MM-dd");
    if (action === "mark_shift_completed" && ev?.sourceId) {
      await Shift.update(ev.sourceId, { status: "completed", last_modified: new Date().toISOString() });
      await refreshData(["shifts"]);
      return;
    }
    if (action === "mark_bill_paid" && ev?.sourceId) {
      // Ensure amount is a number before using it
      const transactionAmount = typeof ev.amount === "number" ? ev.amount : 0;

      await Bill.update(ev.sourceId, { last_paid_date: day });
      await Transaction.create({
        title: `Bill: ${ev.title}`,
        amount: transactionAmount,
        category: "bills_utilities",
        type: "expense",
        date: day,
        account: "checking",
      });
      await refreshData(["bills", "transactions"]);
      return;
    }
    if (action === "add_debt_payment" && ev?.sourceId) {
      // Ensure amount is a number before using it
      const transactionAmount = typeof ev.amount === "number" ? ev.amount : 0;

      await Transaction.create({
        title: `Debt Payment: ${ev.title}`,
        amount: transactionAmount,
        category: "debt_payments", // More specific category
        type: "expense",
        date: day,
        account: "checking",
      });
      await refreshData(["transactions"]);
      return;
    }
    if (action === "add_bnpl_payment" && ev?.sourceId) {
      // Ensure amount is a number before using it
      const transactionAmount = typeof ev.amount === "number" ? ev.amount : 0;

      await Transaction.create({
        title: `BNPL Installment: ${ev.title}`,
        amount: transactionAmount,
        category: "shopping",
        type: "expense",
        date: day,
        account: "checking",
      });
      await refreshData(["transactions"]);
      return;
    }
  }, [refreshData]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card className="bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Unified Calendar
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => refreshData()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <CalendarSettings value={settings} onChange={setSettings} />
              <ExportMenu events={events} monthDate={monthDate} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous Month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[160px] text-center font-semibold">{format(monthDate, "MMMM yyyy")}</div>
              <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next Month">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday} className="ml-2">
                Today
              </Button>
              <Input
                type="month"
                className="w-[150px] ml-2"
                value={format(monthDate, "yyyy-MM")}
                onChange={handleGoToDate}
                aria-label="Go to month"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8 w-64"
                  placeholder="Search events..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Add quick filter presets */}
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <QuickFilters value={filters} onChange={setFilters} />
          </div>

          <FiltersToolbar filters={filters} onChange={setFilters} />

          {loading.all || bnplLoading ? (
            <div className="min-h-[240px] grid place-items-center">
              <Loading text="Loading calendar..." />
            </div>
          ) : (
            <UnifiedMonthGrid
              weeks={weeks}
              events={events}
              eventsByDate={eventsByDate}
              showNetChips={!!settings.showNetChips}
              compactMode={!!settings.compactMode}
              highlightToday={!!settings.highlightToday}
              onQuickAdd={handleQuickAdd}
              onEventAction={handleEventAction}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
