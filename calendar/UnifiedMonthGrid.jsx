import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, isSameDay } from "date-fns";
import { Plus, Check, MoreHorizontal, DollarSign } from "lucide-react";

// Visual tags for event types (uses app theme utility classes already used elsewhere)
const TYPE_STYLES = {
  shift: "bg-income",
  bill: "bg-expense",
  debt: "bg-warning",
  bnpl: "bg-warning",
  subscription: "bg-primary text-white",
  payment: "bg-success",
  income: "bg-income",
  expense: "bg-expense",
};

function dayKey(date) {
  return format(date, "yyyy-MM-dd");
}

// Normalize week items to objects { date: Date, inMonth: boolean }
function normalizeDay(item, currentMonthIndex) {
  if (item && item.date instanceof Date) {
    return { date: item.date, inMonth: typeof item.inMonth === "boolean" ? item.inMonth : item.date.getMonth() === currentMonthIndex };
  }
  if (item instanceof Date) {
    return { date: item, inMonth: item.getMonth() === currentMonthIndex };
  }
  // Fallback: today
  const d = new Date();
  return { date: d, inMonth: d.getMonth() === currentMonthIndex };
}

const DayCell = React.memo(function DayCell({
  date,
  inMonth,
  getEventsForDate,
  onOpen,
  showNetChips = true,
  compactMode = false,
  highlightToday = true,
}) {
  const dayEvents = getEventsForDate(date);
  const visible = dayEvents.slice(0, 3);
  const extra = dayEvents.length - visible.length;

  // Subtle density heatmap
  const density = dayEvents.length;
  const densityClass =
    density >= 6
      ? "ring-2 ring-primary/40 bg-primary/5"
      : density >= 3
      ? "ring-1 ring-primary/25 bg-primary/3"
      : "";

  const dow = date.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const isToday = highlightToday && isSameDay(date, new Date());

  // Compute daily net (income - outflow)
  const incomeTypes = new Set(["shift", "income"]);
  const outflowTypes = new Set(["bill", "debt", "bnpl", "subscription", "payment", "expense"]);
  const totals = dayEvents.reduce(
    (acc, e) => {
      if (typeof e.amount !== "number") return acc;
      if (incomeTypes.has(e.type)) acc.inc += e.amount;
      if (outflowTypes.has(e.type)) acc.out += e.amount;
      return acc;
    },
    { inc: 0, out: 0 }
  );
  const net = totals.inc - totals.out;
  const netClass = net > 0 ? "text-income" : net < 0 ? "text-expense" : "text-muted-foreground";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(date, null);
    }
  };

  return (
    <div
      className={[
        "relative border border-border/50 rounded-md p-2 bg-card/70 outline-offset-2",
        compactMode ? "min-h-[84px]" : "min-h-[112px]",
        inMonth ? "" : "opacity-60",
        densityClass,
        isWeekend ? "bg-muted/40" : "",
        isToday ? "outline outline-2 outline-primary/60" : "",
      ].join(" ")}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${format(date, "EEEE, MMM d")}`}
      onClick={() => onOpen(date, null)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-muted-foreground">{format(date, "d")}</div>
        {showNetChips && (totals.inc > 0 || totals.out > 0) && (
          <div
            className={`text-[10px] font-bold ${netClass} sensitive`}
            title={`Income ${Math.round(totals.inc)} • Outflow ${Math.round(totals.out)}`}
          >
            {net > 0 ? "+" : ""}
            {Math.round(net)}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {visible.map((ev) => (
          <div key={ev.id} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${TYPE_STYLES[ev.type] || "bg-primary"}`} />
            <button
              className="text-xs text-foreground text-left truncate hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(date, ev.id);
              }}
              title={ev.title}
              aria-label={`Open "${ev.title}" details`}
            >
              {ev.title}
            </button>
          </div>
        ))}
        {extra > 0 && (
          <button
            className="text-[11px] text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(date, null);
            }}
            aria-label={`Show ${extra} more items`}
          >
            +{extra} more
          </button>
        )}
      </div>

      {isToday && (
        <Badge className="absolute top-1 right-1 h-5 text-[10px] px-1.5" variant="secondary" aria-label="Today">
          Today
        </Badge>
      )}
    </div>
  );
});

function EventRow({ ev, onAction, isHighlighted }) {
  return (
    <div
      className={[
        "flex items-center justify-between p-2 rounded-md",
        isHighlighted ? "bg-primary/10 border border-primary/20" : "bg-muted/30",
      ].join(" ")}
      ref={isHighlighted ? (el) => el && el.scrollIntoView({ behavior: "smooth", block: "nearest" }) : undefined}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`h-2 w-2 rounded-full ${TYPE_STYLES[ev.type] || "bg-primary"}`} />
        <div className="truncate">
          <div className="text-sm font-medium truncate">{ev.title}</div>
          {typeof ev.amount === "number" && (
            <div className={`text-xs ${ev.type === "income" || ev.type === "shift" ? "text-income" : "text-expense"} sensitive`}>
              {ev.type === "income" || ev.type === "shift" ? "+" : "-"}
              {Math.round(Math.abs(ev.amount))}
            </div>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {ev.type === "bill" && (
            <DropdownMenuItem onClick={() => onAction("mark_paid", ev)}>
              <Check className="h-4 w-4 mr-2" />
              Mark Paid
            </DropdownMenuItem>
          )}
          {ev.type === "shift" && (
            <DropdownMenuItem onClick={() => onAction("mark_completed", ev)}>
              <Check className="h-4 w-4 mr-2" />
              Mark Completed
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onAction("view", ev)}>
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function UnifiedMonthGrid({
  weeks,
  events = [],
  eventsByDate = null,
  showNetChips = true,
  compactMode = false,
  highlightToday = true,
  onQuickAdd = null, // (type, date)
  onEventAction = null, // (action, event, date)
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedEventId, setSelectedEventId] = React.useState(null);

  // Determine visible month for fallback inMonth inference
  const firstDay = React.useMemo(() => {
    try {
      const first = weeks?.[0]?.[0];
      if (first?.date instanceof Date) return first.date;
      if (first instanceof Date) return first;
      return new Date();
    } catch {
      return new Date();
    }
  }, [weeks]);
  const monthIndex = firstDay.getMonth();

  // Fast map for day lookups
  const map = React.useMemo(() => {
    if (eventsByDate && typeof eventsByDate.get === "function") return eventsByDate;
    const m = new Map();
    (Array.isArray(events) ? events : []).forEach((e) => {
      if (!e?.date) return;
      const k = dayKey(e.date);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(e);
    });
    m.forEach((arr) =>
      arr.sort((a, b) => {
        const ad = a.date?.getTime?.() || 0;
        const bd = b.date?.getTime?.() || 0;
        if (ad !== bd) return ad - bd;
        return (a.title || "").localeCompare(b.title || "");
      })
    );
    return m;
  }, [events, eventsByDate]);

  const getEventsForDate = React.useCallback(
    (date) => map.get(dayKey(date)) || [],
    [map]
  );

  const openFor = React.useCallback((d, evId = null) => {
    setSelectedDate(d);
    setSelectedEventId(evId);
    setOpen(true);
  }, []);

  const selectedEvents = React.useMemo(
    () => (selectedDate ? getEventsForDate(selectedDate) : []),
    [selectedDate, getEventsForDate]
  );

  const handleEventAction = React.useCallback(
    (action, ev) => {
      if (typeof onEventAction === "function" && selectedDate) {
        onEventAction(action, ev, selectedDate);
      }
    },
    [onEventAction, selectedDate]
  );

  const handleQuickAdd = React.useCallback(
    (type) => {
      if (typeof onQuickAdd === "function" && selectedDate) {
        onQuickAdd(type, selectedDate);
      }
    },
    [onQuickAdd, selectedDate]
  );

  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.isArray(weeks) &&
        weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map((item, di) => {
              const { date, inMonth } = normalizeDay(item, monthIndex);
              return (
                <DayCell
                  key={`${wi}-${di}`}
                  date={date}
                  inMonth={!!inMonth}
                  getEventsForDate={getEventsForDate}
                  onOpen={openFor}
                  showNetChips={showNetChips}
                  compactMode={compactMode}
                  highlightToday={highlightToday}
                />
              );
            })}
          </React.Fragment>
        ))}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Details"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Quick Add */}
            {selectedDate && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd("shift")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Shift
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd("income")}>
                  <DollarSign className="h-4 w-4 mr-1" />
                  Income
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd("expense")}>
                  <DollarSign className="h-4 w-4 mr-1 rotate-180" />
                  Expense
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd("bill")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Bill
                </Button>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-2">
              {selectedEvents.length === 0 ? (
                <div className="text-sm text-muted-foreground">No items for this day.</div>
              ) : (
                selectedEvents.map((ev) => (
                  <EventRow
                    key={ev.id}
                    ev={ev}
                    onAction={handleEventAction}
                    isHighlighted={selectedEventId && selectedEventId === ev.id}
                  />
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}