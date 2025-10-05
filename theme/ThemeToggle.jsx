
import React from 'react';
import { Button } from '@/ui/button.jsx';
import { Sun, Moon, Monitor, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { User } from '@/api/entities'; // Added import for User entity

const themeConfig = {
    light: {
        icon: Sun,
        label: 'Light',
        description: 'Clean and minimal',
        gradient: 'from-yellow-400 to-orange-500',
        hoverGlow: 'hover:shadow-yellow-500/25'
    },
    dark: {
        icon: Moon,
        label: 'Dark',
        description: 'Easy on the eyes',
        gradient: 'from-blue-500 to-purple-600',
        hoverGlow: 'hover:shadow-blue-500/25'
    },
    oled: {
        icon: Zap,
        label: 'OLED',
        description: 'Pure black elegance',
        gradient: 'from-slate-700 to-black',
        hoverGlow: 'hover:shadow-slate-500/25'
    }
};

export function ThemeToggle() {
    const { theme, setTheme, isTransitioning } = useTheme(); // use setTheme so we can persist
    const config = themeConfig[theme] || themeConfig.light;
    const Icon = config.icon;

    const handleToggleTheme = async () => {
        const themes = ['light', 'dark', 'oled'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];

        // Update app theme (ThemeProvider persists to localStorage)
        setTheme(nextTheme);

        // Persist to user profile so it survives reloads (ignore if unauthenticated)
        try {
            await User.updateMyUserData({ theme_preference: nextTheme });
        } catch {
            // ignore
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            disabled={isTransitioning}
            aria-label={`Change theme (current: ${config.label})`}
            className={cn(
                "relative overflow-hidden transition-all duration-300",
                "hover:scale-105 active:scale-95",
                "group",
                config.hoverGlow,
                isTransitioning && "animate-pulse"
            )}
            title={`Current: ${config.label} - ${config.description}`}
        >
            <div className={cn(
                "absolute inset-0 opacity-10 transition-opacity duration-300",
                `bg-gradient-to-br ${config.gradient}`,
                "group-hover:opacity-20"
            )} />
            
            <Icon className={cn(
                "h-5 w-5 transition-all duration-300 relative z-10",
                isTransitioning && "animate-spin",
                theme === 'light' && "text-yellow-600",
                theme === 'dark' && "text-blue-400",
                theme === 'oled' && "text-slate-300"
            )} />
            
            {/* Subtle glow effect */}
            <div className={cn(
                "absolute inset-0 rounded-md opacity-0 transition-opacity duration-300",
                "group-hover:opacity-100",
                theme === 'light' && "shadow-inner shadow-yellow-500/20",
                theme === 'dark' && "shadow-inner shadow-blue-500/20",
                theme === 'oled' && "shadow-inner shadow-slate-500/20"
            )} />
        </Button>
    );
}

// Enhanced theme selection dropdown for settings pages
export function ThemeSelector() {
    const { theme, setTheme, isTransitioning } = useTheme();

    const setAndPersist = async (themeKey) => {
        setTheme(themeKey);
        try {
            await User.updateMyUserData({ theme_preference: themeKey });
        } catch {
            // ignore if unauthenticated
        }
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            {Object.entries(themeConfig).map(([themeKey, config]) => {
                const Icon = config.icon;
                const isActive = theme === themeKey;
                
                return (
                    <button
                        key={themeKey}
                        onClick={() => setAndPersist(themeKey)}
                        disabled={isTransitioning}
                        aria-label={`Select ${config.label} theme`}
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300",
                            "hover:scale-105 active:scale-95",
                            isActive
                                ? "border-primary bg-primary/10 shadow-lg"
                                : "border-border bg-card hover:bg-accent",
                            config.hoverGlow,
                            isTransitioning && "opacity-50"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-full transition-all duration-300",
                            `bg-gradient-to-br ${config.gradient}`,
                            isActive ? "scale-110" : "scale-100 hover:scale-105"
                        )}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="text-center">
                            <div className={cn(
                                "font-semibold text-sm",
                                isActive ? "text-primary" : "text-foreground"
                            )}>
                                {config.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {config.description}
                            </div>
                        </div>
                        
                        {isActive && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
