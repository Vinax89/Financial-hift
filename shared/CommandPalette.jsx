import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from "@/components/ui/command";
import { LayoutDashboard, Briefcase, Wallet, TrendingDown, Target, Bot, RefreshCw, Keyboard, Sun, Moon, Bug } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, url: createPageUrl("Dashboard") },
  { label: "Work Hub", icon: Briefcase, url: createPageUrl("WorkHub") },
  { label: "Money Manager", icon: Wallet, url: createPageUrl("MoneyManager") },
  { label: "Debt Control", icon: TrendingDown, url: createPageUrl("DebtControl") },
  { label: "Financial Planning", icon: Target, url: createPageUrl("FinancialPlanning") },
  { label: "AI Assistant", icon: Bot, url: createPageUrl("AIAssistant") },
];

export default function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { cycleTheme, actualTheme } = useTheme();

  React.useEffect(() => {
    const down = (e) => {
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const refreshDashboard = (forced = false) => {
    window.dispatchEvent(new CustomEvent("dashboard:refresh", { detail: { forced } }));
  };

  const toggleChaosMode = () => {
    try {
      const key = "apex-finance:chaos-mode";
      const current = JSON.parse(window.localStorage.getItem(key) || "false");
      const next = !current;
      window.localStorage.setItem(key, JSON.stringify(next));
      refreshDashboard(true);
    } catch {
      // noop
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open command palette"
        onClick={() => setOpen(true)}
        className="sr-only"
      >
        Open Command Palette
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigate">
            {navItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => {
                  navigate(item.url);
                  setOpen(false);
                }}
                className="cursor-pointer"
                aria-label={`Go to ${item.label}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                refreshDashboard(false);
                setOpen(false);
              }}
              aria-label="Refresh data"
              className="cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Refresh data</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                refreshDashboard(true);
                setOpen(false);
              }}
              aria-label="Force refresh data"
              className="cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Force refresh</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                cycleTheme();
                setOpen(false);
              }}
              aria-label="Toggle theme"
              className="cursor-pointer"
            >
              {actualTheme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Toggle theme</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                toggleChaosMode();
                setOpen(false);
              }}
              aria-label="Toggle chaos mode"
              className="cursor-pointer"
            >
              <Bug className="mr-2 h-4 w-4" />
              <span>Toggle Chaos Mode</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Help">
            <CommandItem
              onSelect={() => setOpen(false)}
              aria-label="Keyboard shortcuts"
              className="cursor-pointer"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard: Cmd/Ctrl + K to open</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}