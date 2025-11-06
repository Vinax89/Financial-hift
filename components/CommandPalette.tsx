/**
 * @fileoverview Command Palette Component
 * @description Global command palette for quick access to all actions
 * Activated with Ctrl+K, fuzzy search, keyboard navigation
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/ui/command';
import {
  Home,
  LayoutDashboard,
  Receipt,
  Calendar,
  Briefcase,
  Target,
  Wallet,
  Landmark,
  Plus,
  RefreshCw,
  Settings,
  Moon,
  Sun,
  Search,
  TrendingUp,
  FileText,
  Download,
} from 'lucide-react';
import { useTheme } from '@/theme/ThemeProvider';
import { useToast } from '@/ui/use-toast';

export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings' | 'recent';
  keywords?: string[];
  shortcut?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation commands
  const navigationCommands: CommandAction[] = useMemo(() => [
    {
      id: 'nav-home',
      label: 'Home',
      description: 'Go to home page',
      icon: <Home className="h-4 w-4" />,
      action: () => navigate('/'),
      category: 'navigation',
      keywords: ['home', 'landing'],
      shortcut: 'Ctrl+H',
    },
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'View financial overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => navigate('/dashboard'),
      category: 'navigation',
      keywords: ['dashboard', 'overview', 'main'],
      shortcut: 'Ctrl+1',
    },
    {
      id: 'nav-transactions',
      label: 'Transactions',
      description: 'Manage transactions',
      icon: <Receipt className="h-4 w-4" />,
      action: () => navigate('/transactions'),
      category: 'navigation',
      keywords: ['transactions', 'expenses', 'income'],
      shortcut: 'Ctrl+2',
    },
    {
      id: 'nav-calendar',
      label: 'Calendar',
      description: 'View cashflow calendar',
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate('/calendar'),
      category: 'navigation',
      keywords: ['calendar', 'schedule', 'dates'],
      shortcut: 'Ctrl+3',
    },
    {
      id: 'nav-shifts',
      label: 'Shifts',
      description: 'Manage work shifts',
      icon: <Briefcase className="h-4 w-4" />,
      action: () => navigate('/shifts'),
      category: 'navigation',
      keywords: ['shifts', 'work', 'schedule'],
      shortcut: 'Ctrl+4',
    },
    {
      id: 'nav-goals',
      label: 'Goals',
      description: 'Track financial goals',
      icon: <Target className="h-4 w-4" />,
      action: () => navigate('/goals'),
      category: 'navigation',
      keywords: ['goals', 'targets', 'savings'],
      shortcut: 'Ctrl+5',
    },
    {
      id: 'nav-budget',
      label: 'Budget',
      description: 'Manage monthly budget',
      icon: <Wallet className="h-4 w-4" />,
      action: () => navigate('/budget'),
      category: 'navigation',
      keywords: ['budget', 'spending', 'limits'],
      shortcut: 'Ctrl+6',
    },
    {
      id: 'nav-debts',
      label: 'Debt Control',
      description: 'Manage debts and BNPL',
      icon: <Landmark className="h-4 w-4" />,
      action: () => navigate('/debt-control'),
      category: 'navigation',
      keywords: ['debt', 'loans', 'bnpl'],
      shortcut: 'Ctrl+7',
    },
    {
      id: 'nav-workhub',
      label: 'WorkHub',
      description: 'Work tracking hub',
      icon: <TrendingUp className="h-4 w-4" />,
      action: () => navigate('/workhub'),
      category: 'navigation',
      keywords: ['work', 'hub', 'tracking'],
      shortcut: 'Ctrl+8',
    },
  ], [navigate]);

  // Action commands
  const actionCommands: CommandAction[] = useMemo(() => [
    {
      id: 'action-new-transaction',
      label: 'New Transaction',
      description: 'Create a new transaction',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        navigate('/transactions');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('command:new-transaction'));
        }, 100);
      },
      category: 'actions',
      keywords: ['new', 'create', 'transaction', 'expense', 'income'],
      shortcut: 'Ctrl+N',
    },
    {
      id: 'action-new-shift',
      label: 'New Shift',
      description: 'Create a new work shift',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        navigate('/shifts');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('command:new-shift'));
        }, 100);
      },
      category: 'actions',
      keywords: ['new', 'create', 'shift', 'work'],
    },
    {
      id: 'action-new-goal',
      label: 'New Goal',
      description: 'Create a new financial goal',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        navigate('/goals');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('command:new-goal'));
        }, 100);
      },
      category: 'actions',
      keywords: ['new', 'create', 'goal', 'target'],
    },
    {
      id: 'action-refresh',
      label: 'Refresh Data',
      description: 'Refresh all financial data',
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('dashboard:refresh'));
        toast({
          title: 'Refreshing...',
          description: 'Updating all financial data',
        });
      },
      category: 'actions',
      keywords: ['refresh', 'reload', 'update', 'sync'],
      shortcut: 'Ctrl+R',
    },
    {
      id: 'action-export',
      label: 'Export Data',
      description: 'Export financial data',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        navigate('/dashboard');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('command:export-data'));
        }, 100);
      },
      category: 'actions',
      keywords: ['export', 'download', 'backup', 'data'],
    },
  ], [navigate, toast]);

  // Settings commands
  const settingsCommands: CommandAction[] = useMemo(() => [
    {
      id: 'settings-theme-light',
      label: 'Light Theme',
      description: 'Switch to light theme',
      icon: <Sun className="h-4 w-4" />,
      action: () => {
        setTheme('light');
        toast({ title: 'Theme changed', description: 'Switched to light theme' });
      },
      category: 'settings',
      keywords: ['theme', 'light', 'appearance'],
    },
    {
      id: 'settings-theme-dark',
      label: 'Dark Theme',
      description: 'Switch to dark theme',
      icon: <Moon className="h-4 w-4" />,
      action: () => {
        setTheme('dark');
        toast({ title: 'Theme changed', description: 'Switched to dark theme' });
      },
      category: 'settings',
      keywords: ['theme', 'dark', 'appearance'],
    },
    {
      id: 'settings-page',
      label: 'Settings',
      description: 'Open settings page',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/settings'),
      category: 'settings',
      keywords: ['settings', 'preferences', 'config'],
      shortcut: 'Ctrl+,',
    },
  ], [navigate, setTheme, toast]);

  // Combine all commands
  const allCommands = useMemo(() => [
    ...navigationCommands,
    ...actionCommands,
    ...settingsCommands,
  ], [navigationCommands, actionCommands, settingsCommands]);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery) return allCommands;

    const query = searchQuery.toLowerCase();
    return allCommands.filter(cmd => {
      const matchLabel = cmd.label.toLowerCase().includes(query);
      const matchDescription = cmd.description?.toLowerCase().includes(query);
      const matchKeywords = cmd.keywords?.some(k => k.toLowerCase().includes(query));
      return matchLabel || matchDescription || matchKeywords;
    });
  }, [searchQuery, allCommands]);

  // Group filtered commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {
      navigation: [],
      actions: [],
      settings: [],
    };

    filteredCommands.forEach(cmd => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd);
      }
    });

    return groups;
  }, [filteredCommands]);

  // Handle command execution
  const handleCommandSelect = useCallback((command: CommandAction) => {
    command.action();
    onOpenChange(false);
    setSearchQuery('');
  }, [onOpenChange]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {groupedCommands.navigation.length > 0 && (
          <>
            <CommandGroup heading="Navigation">
              {groupedCommands.navigation.map(cmd => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleCommandSelect(cmd)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {cmd.icon}
                    <div>
                      <div className="font-medium">{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                      )}
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {groupedCommands.actions.length > 0 && (
          <>
            <CommandGroup heading="Actions">
              {groupedCommands.actions.map(cmd => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleCommandSelect(cmd)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {cmd.icon}
                    <div>
                      <div className="font-medium">{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                      )}
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {groupedCommands.settings.length > 0 && (
          <CommandGroup heading="Settings">
            {groupedCommands.settings.map(cmd => (
              <CommandItem
                key={cmd.id}
                onSelect={() => handleCommandSelect(cmd)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {cmd.icon}
                  <div>
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.description && (
                      <div className="text-xs text-muted-foreground">{cmd.description}</div>
                    )}
                  </div>
                </div>
                {cmd.shortcut && (
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    {cmd.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;
