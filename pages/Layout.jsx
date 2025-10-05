

import React, { Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    LayoutDashboard,
    Briefcase,
    Wallet,
    TrendingDown,
    Target,
    Bot,
    PiggyBank,
    Bell,
    User,
    Settings as SettingsIcon,
    CalendarDays, // Added import for CalendarDays icon
    Bug, // Admin-only diagnostics icon
    Crown // Added for subscriptions/pricing page
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarProvider,
    SidebarTrigger,
    SidebarFooter
} from "@/ui/sidebar.jsx";
import { Button } from "@/ui/button.jsx";
import { Badge } from "@/ui/badge.jsx";
import AuthGuard from "@/AuthGuard.jsx";
import { ErrorBoundary } from "@/shared/ErrorBoundary.jsx";
import { Loading } from "@/ui/loading.jsx"; // Corrected import statement
import { Toaster } from "@/ui/sonner.jsx";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider.jsx";
import { ThemeToggle } from "@/theme/ThemeToggle.jsx";
import { BackgroundPattern } from "@/ui/theme-aware-animations.jsx";
import useGamification from "@/hooks/useGamification.jsx";
import { User as UserEntity } from "@/api/entities";
import CommandPalette from "./components/shared/CommandPalette";
import NotificationsCenter from "./components/shared/NotificationsCenter.js";
import PrivacyToggle from "./components/shared/PrivacyToggle.jsx";

const navigationItems = [
    {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: LayoutDashboard,
        description: "Financial overview and insights"
    },
    {
        title: "Work Hub",
        url: createPageUrl("WorkHub"),
        icon: Briefcase,
        description: "Manage shifts, pay, and work rules"
    },
    {
        title: "Money Manager",
        url: createPageUrl("MoneyManager"),
        icon: Wallet,
        description: "Track transactions, budgets, and receipts"
    },
    {
        title: "Calendar", // Added new navigation item for Calendar
        url: createPageUrl("UnifiedCalendar"),
        icon: CalendarDays,
        description: "Unified schedule for work and payments"
    },
    {
        title: "Debt Control",
        url: createPageUrl("DebtControl"),
        icon: TrendingDown,
        description: "Manage debts and BNPL plans"
    },
    {
        title: "Financial Planning",
        url: createPageUrl("FinancialPlanning"),
        icon: Target,
        description: "Set goals, analyze trends, generate reports"
    },
    {
        title: "AI Assistant",
        url: createPageUrl("AIAssistant"),
        icon: Bot,
        description: "Get financial advice and run AI agents"
    },
    {
        title: "Settings",
        url: createPageUrl("Settings"),
        icon: SettingsIcon,
        description: "Preferences and personalization"
    },
    {
        title: "Pricing",
        url: createPageUrl("Pricing"),
        icon: Crown,
        description: "Choose a plan and upgrade"
    },
    // Admin-only Diagnostics shortcut
    {
        title: "Diagnostics",
        url: createPageUrl("Diagnostics"),
        icon: Bug,
        description: "Stress tests and performance tools",
        adminOnly: true
    }
];

function LayoutContent({ children, currentPageName }) {
    const location = useLocation();
    const { gameState, isLoading: gamificationLoading } = useGamification();
    const [user, setUser] = React.useState(null);
    const [userLoading, setUserLoading] = React.useState(true);
    const { setTheme } = useTheme();
    const [perfLite, setPerfLite] = React.useState(false);

    // Effect for initializing and managing global privacy mode behavior (Alt-hold reveal, localStorage persistence)
    React.useEffect(() => {
        // Initialize privacy from localStorage if not already set by user preferences
        if (typeof document !== "undefined") {
            const currentPrivacyAttr = document.documentElement.getAttribute("data-privacy");
            if (currentPrivacyAttr === null) { // Only set from localStorage if no other mechanism has set it yet
                const saved = typeof window !== "undefined" ? window.localStorage.getItem("apex-finance:privacy-mode") : null;
                document.documentElement.setAttribute("data-privacy", saved === "true" ? "true" : "false");
            }
        }

        // Initialize performance mode (lite)
        if (typeof window !== "undefined") {
            const lite = window.localStorage.getItem("apex-finance:perf-lite") === "true";
            setPerfLite(lite);
            if (typeof document !== "undefined") {
                document.documentElement.setAttribute("data-perf", lite ? "lite" : "normal");
            }
        }

        // Press-and-hold Alt to temporarily reveal sensitive amounts
        const onKeyDown = (e) => {
            if (e.altKey) {
                document.documentElement.setAttribute("data-privacy", "false");
            }
        };
        const onKeyUp = () => {
            // Restore privacy based on the persistently stored value (from localStorage)
            const saved = typeof window !== "undefined" ? window.localStorage.getItem("apex-finance:privacy-mode") : "false";
            document.documentElement.setAttribute("data-privacy", saved === "true" ? "true" : "false");
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        // Sync perf-lite from other tabs
        const onStorage = (e) => {
            if (e.key === "apex-finance:perf-lite") {
                const lite = e.newValue === "true";
                setPerfLite(lite);
                document.documentElement.setAttribute("data-perf", lite ? "lite" : "normal");
            }
        };
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("storage", onStorage);
        };
    }, []); // Runs once on mount

    React.useEffect(() => {
        const loadUser = async () => {
            try {
                setUserLoading(true);
                const currentUser = await UserEntity.me();
                setUser(currentUser);

                // Resolve theme preference without flicker:
                // 1) Prefer last local selection if present
                // 2) Else, use server-stored preference
                // 3) Keep both in sync
                // Normalize reading of saved theme (supports raw or JSON)
                const savedRaw = typeof window !== "undefined" ? window.localStorage.getItem("apex-finance:theme") : null;
                const savedTheme = (() => {
                    if (!savedRaw) return null;
                    try { return JSON.parse(savedRaw); } catch (e) { return savedRaw; } // If JSON.parse fails, it's likely a raw string
                })();
                const userTheme = currentUser?.theme_preference || null;

                if (savedTheme) {
                    // Use local selection immediately to avoid flicker
                    setTheme(savedTheme);
                    // If different from server-stored, sync to user profile (best-effort)
                    if (userTheme && userTheme !== savedTheme) {
                        try { await UserEntity.updateMyUserData({ theme_preference: savedTheme }); } catch (error) { /* console.error("Failed to update user theme preference on server:", error); */ }
                    }
                } else if (userTheme) {
                    // Fall back to user's stored preference
                    setTheme(userTheme);
                    // Do NOT write directly to localStorage here; ThemeProvider will persist via useLocalStorage
                }

                // Apply reduced motion
                if (typeof document !== "undefined") {
                    const reduced = !!currentUser?.reduced_motion;
                    document.documentElement.dataset.reducedMotion = reduced ? "true" : "false";

                    // Apply privacy mode
                    const privacy = !!currentUser?.privacy_mode;
                    document.documentElement.setAttribute("data-privacy", privacy ? "true" : "false");
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem("apex-finance:privacy-mode", privacy ? "true" : "false");
                    }
                }
            } catch (error) {
                console.log('User not authenticated or error loading user', error);
                setUser(null);
                if (typeof document !== "undefined") {
                    document.documentElement.dataset.reducedMotion = "false";
                    document.documentElement.setAttribute("data-privacy", "false");
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem("apex-finance:privacy-mode", "false");
                        // Clear any inconsistent theme; ThemeProvider will fall back
                        window.localStorage.removeItem("apex-finance:theme");
                    }
                }
                setTheme("system"); // Fallback to system theme for unauthenticated users
            } finally {
                setUserLoading(false);
            }
        };
        loadUser();
    }, [setTheme]);

    const getCurrentPageTitle = () => {
        const currentItem = navigationItems.find(item => location.pathname === item.url);
        return currentItem?.title || 'Financial $hift';
    };

    return (
        <ErrorBoundary>
            <AuthGuard>
                <SidebarProvider>
                    <style>{`
                        /* Skip link for accessibility */
                        .skip-to-content {
                          position: absolute;
                          top: -40px;
                          left: 8px;
                          background: hsl(var(--primary));
                          color: hsl(var(--primary-foreground));
                          padding: 8px 12px;
                          border-radius: 8px;
                          z-index: 10000;
                          transition: top .2s ease;
                        }
                        .skip-to-content:focus {
                          top: 8px;
                        }
                        /* Global privacy mode styles */
                        html[data-privacy="true"] .sensitive {
                            filter: blur(6px);
                            transition: filter 0.2s ease;
                        }
                        html[data-privacy="true"] .sensitive:hover,
                        html[data-privacy="true"] .sensitive:focus {
                            filter: blur(0);
                        }
                        /* Better font rendering */
                        html, body {
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                            text-rendering: optimizeLegibility;
                        }

                        /* Semantic tokens */
                        :root {
                          --income: 142 76% 36%;
                          --expense: 0 72% 51%;
                          --warning: 38 92% 50%;
                          --success: 142 72% 35%;
                        }

                        /* Utility classes */
                        .text-income { color: hsl(var(--income)) !important; }
                        .text-expense { color: hsl(var(--expense)) !important; }
                        .text-warning { color: hsl(var(--warning)) !important; }
                        .text-success { color: hsl(var(--success)) !important; }
                        .bg-income { background-color: hsl(var(--income)) !important; color: white !important; }
                        .bg-expense { background-color: hsl(var(--expense)) !important; color: white !important; }
                        .bg-warning { background-color: hsl(var(--warning)) !important; color: black !important; }
                        .bg-success { background-color: hsl(var(--success)) !important; color: white !important; }
                        .border-income { border-color: hsl(var(--income)) !important; }
                        .border-expense { border-color: hsl(var(--expense)) !important; }
                        .border-warning { border-color: hsl(var(--warning)) !important; }
                        .border-success { border-color: hsl(var(--success)) !important; }

                        /* Link colors */
                        a { color: hsl(var(--primary)); }
                        a:hover { color: hsl(var(--primary) / 0.9); }

                        /* Text selection */
                        ::selection {
                          background: hsl(var(--primary) / 0.22);
                          color: hsl(var(--foreground));
                        }

                        /* Scrollbars (WebKit) */
                        *::-webkit-scrollbar { width: 10px; height: 10px; }
                        *::-webkit-scrollbar-track { background: hsl(var(--muted)); }
                        *::-webkit-scrollbar-thumb {
                          background: hsl(var(--primary) / 0.45);
                          border-radius: 9999px;
                          border: 2px solid hsl(var(--muted));
                        }
                        *::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.65); }

                        /* Tables */
                        thead tr th {
                          background: color-mix(in hsl, hsl(var(--card)), hsl(var(--primary)) 6%);
                          color: hsl(var(--muted-foreground));
                        }
                        tbody tr:nth-child(odd) { background: color-mix(in hsl, hsl(var(--card)), hsl(var(--muted)) 6%); }
                        tbody tr:hover { background: color-mix(in hsl, hsl(var(--card)), hsl(var(--primary)) 8%); }

                        /* Focus ring */
                        button, a, input, select, textarea, [role="button"] { outline: none; }
                        button:focus-visible,
                        a:focus-visible,
                        input:focus-visible,
                        select:focus-visible,
                        textarea:focus-visible,
                        [role="button"]:focus-visible {
                          box-shadow: 0 0 0 3px hsl(var(--ring) / 0.25);
                          border-color: hsl(var(--ring) / 0.45);
                        }

                        /* Inputs / placeholders */
                        input::placeholder, textarea::placeholder { color: hsl(var(--muted-foreground)); opacity: 0.8; }
                        input:disabled, textarea:disabled, select:disabled {
                          background-color: hsl(var(--muted));
                          color: hsl(var(--muted-foreground));
                        }

                        /* Prose / Markdown (for AI outputs, notes, etc.) */
                        .prose :where(h1,h2,h3,h4) { color: hsl(var(--foreground)); }
                        .prose a { color: hsl(var(--primary)); }
                        .prose a:hover { color: hsl(var(--primary) / 0.85); }
                        .prose code {
                          background: color-mix(in hsl, hsl(var(--card)), hsl(var(--muted)) 25%);
                          color: hsl(var(--foreground));
                          padding: .15rem .35rem; border-radius: .375rem;
                        }
                        .prose pre code {
                          background: hsl(var(--card)); color: hsl(var(--foreground));
                        }
                        .prose blockquote {
                          border-left: 3px solid hsl(var(--primary));
                          color: hsl(var(--muted-foreground));
                          padding-left: .9rem;
                        }
                        .prose hr {
                          border-color: hsl(var(--border));
                          opacity: .6;
                        }
                        .prose table thead th {
                          background: color-mix(in hsl, hsl(var(--card)), hsl(var(--primary)) 8%);
                        }

                        /* Menus / popovers / sheets / dialogs */
                        [role="menu"], [role="listbox"], .radix-tooltip, .radix-popover-content, .radix-dropdown-content, .radix-dialog-content {
                          background: hsl(var(--popover));
                          color: hsl(var(--popover-foreground));
                          border: 1px solid hsl(var(--border));
                          border-radius: 12px;
                        }
                        .radix-dropdown-item[data-highlighted],
                        [role="option"][data-highlighted] {
                          background: color-mix(in hsl, hsl(var(--popover)), hsl(var(--primary)) 14%);
                          color: hsl(var(--popover-foreground));
                        }

                        /* Recharts: global theme */
                        .recharts-cartesian-grid line { stroke: hsl(var(--border)) !important; opacity: 0.4; }
                        .recharts-xAxis .recharts-cartesian-axis-line,
                        .recharts-yAxis .recharts-cartesian-axis-line,
                        .recharts-cartesian-axis-tick-line { stroke: hsl(var(--muted-foreground)) !important; opacity: 0.5; }
                        .recharts-text { fill: hsl(var(--muted-foreground)) !important; }
                        .recharts-default-tooltip {
                          background: hsl(var(--popover)) !important;
                          color: hsl(var(--popover-foreground)) !important;
                          border: 1px solid hsl(var(--border)) !important;
                          border-radius: 8px !important;
                        }
                        .recharts-tooltip-item { color: hsl(var(--popover-foreground)) !important; }

                        /* Performance Lite Mode */
                        html[data-perf="lite"] * {
                          animation: none !important;
                          transition: none !important;
                        }
                        html[data-perf="lite"] .backdrop-blur-xl,
                        html[data-perf="lite"] .backdrop-blur-lg,
                        html[data-perf="lite"] .backdrop-blur-md,
                        html[data-perf="lite"] .backdrop-blur-sm {
                          -webkit-backdrop-filter: none !important;
                          backdrop-filter: none !important;
                        }
                        html[data-perf="lite"] .shadow,
                        html[data-perf="lite"] .shadow-sm,
                        html[data-perf="lite"] .shadow-md,
                        html[data-perf="lite"] .shadow-lg,
                        html[data-perf="lite"] .shadow-xl,
                        html[data-perf="lite"] .shadow-2xl {
                          box-shadow: none !important;
                        }
                    `}</style>
                    <Toaster
                        position="top-right"
                        expand={false}
                        richColors
                        closeButton
                        className="z-[9999]"
                    />
                    <CommandPalette />

                    {/* Skip to content link */}
                    <a href="#app-main" className="skip-to-content">Skip to content</a>

                    <div className="min-h-screen flex w-full bg-background relative overflow-hidden font-sans antialiased">
                        {!perfLite && <BackgroundPattern pattern="dots" opacity="subtle" />}

                        <Sidebar className="border-r border-border/40 bg-card/95 backdrop-blur-xl z-40">
                            <SidebarHeader className="border-b border-border/40 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 bg-gradient-to-br from-primary/90 to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                        <PiggyBank className="w-7 h-7 text-primary-foreground" />
                                        {!gamificationLoading && gameState && gameState.level > 1 && (
                                            <Badge className="absolute -top-2 -right-2 h-6 w-6 text-xs bg-amber-500 hover:bg-amber-600 border-2 border-background rounded-full p-0 flex items-center justify-center font-bold shadow-sm">
                                                {gameState.level}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-bold text-foreground text-lg leading-tight">Financial $hift</h2>
                                        <p className="text-sm text-muted-foreground font-medium truncate mt-1">
                                            {userLoading ? 'Loading...' :
                                             user?.full_name ? `Welcome, ${user.full_name.split(' ')[0]}` : 'For Shift Workers'}
                                        </p>
                                    </div>
                                </div>

                                {/* Enhanced Gamification Progress */}
                                {!gamificationLoading && gameState && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold text-primary">Level {gameState.level}</span>
                                            <span className="text-xs text-muted-foreground font-medium">{gameState.xp}/100 XP</span>
                                        </div>
                                        <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${Math.max(2, (gameState.xp / 100) * 100)}%` }}
                                            />
                                        </div>
                                        {gameState.badges && gameState.badges.length > 0 && (
                                            <div className="mt-3 text-xs text-primary/90 flex items-center gap-2">
                                                <span className="text-base">🏆</span>
                                                <span className="font-semibold">{gameState.badges.length} badge{gameState.badges.length !== 1 ? 's' : ''} earned</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </SidebarHeader>

                            <SidebarContent className="p-4">
                                <SidebarGroup>
                                    <SidebarGroupLabel className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest px-3 py-4 mb-2">
                                        Navigation
                                    </SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu className="space-y-2">
                                            {navigationItems.map((item) => {
                                                // Hide admin-only items for non-admin users
                                                if (item.adminOnly && user?.role !== 'admin') return null;
                                                return (
                                                    <SidebarMenuItem key={item.title}>
                                                        <SidebarMenuButton
                                                            asChild
                                                            className={`font-medium transition-all duration-300 rounded-xl group relative text-sm min-h-[52px] ${
                                                                location.pathname === item.url
                                                                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border/40'
                                                            }`}
                                                            title={item.description}
                                                        >
                                                            <Link to={item.url} className="flex items-center gap-4 px-4 py-3 w-full">
                                                                <item.icon className={`w-5 h-5 flex-shrink-0 ${location.pathname === item.url ? 'text-primary' : ''}`} />
                                                                <span className="truncate flex-1 font-semibold">{item.title}</span>
                                                                {item.adminOnly && <Badge className="ml-2">Admin</Badge>}
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                );
                                            })}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>

                            <SidebarFooter className="border-t border-border/40 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <span className="truncate font-medium text-xs" title={user?.email}>
                                            {userLoading ? 'Loading...' : user?.email || 'Not signed in'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <NotificationsCenter />
                                        <PrivacyToggle />
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </SidebarFooter>
                        </Sidebar>

                        <main id="app-main" className="flex-1 flex flex-col min-w-0 relative">
                            <header className="bg-card/90 backdrop-blur-xl border-b border-border/40 px-6 py-4 md:hidden sticky top-0 z-30">
                                <div className="flex items-center justify-between min-h-[48px]">
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <SidebarTrigger className="hover:bg-muted/60 p-2 rounded-xl flex-shrink-0 transition-colors" />
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-xl font-bold text-foreground truncate">{getCurrentPageTitle()}</h1>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                        <Button variant="ghost" size="icon" aria-label="Notifications" className="h-11 w-11 hover:bg-muted/60">
                                            <Bell className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </header>

                            <div className="flex-1 overflow-auto relative">
                                <ErrorBoundary>
                                    <Suspense fallback={
                                        <div className="flex items-center justify-center min-h-[60vh] p-8">
                                            <Loading text="Loading page..." variant="pulse" size="lg" />
                                        </div>
                                    }>
                                        <div className="animate-fadeInUp min-h-full">
                                            {children}
                                        </div>
                                    </Suspense>
                                </ErrorBoundary>
                            </div>
                        </main>
                    </div>
                </SidebarProvider>
            </AuthGuard>
        </ErrorBoundary>
    );
}

export default function Layout({ children, currentPageName }) {
    return (
        <ThemeProvider defaultTheme="light">
            <LayoutContent children={children} currentPageName={currentPageName} />
        </ThemeProvider>
    );
}

