
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '../theme/ThemeProvider';
import { cn } from '@/lib/utils';
import { MagneticHover, GlowEffect } from './theme-aware-animations';

// Professional theme-aware card with refined styling and better performance
export function ThemedCard({ 
  children, 
  className, 
  glowing = false,
  elevated = false,
  magnetic = false,
  interactive = false,
  variant = 'default',
  ...props 
}) {
  const { isDark, isOled, actualTheme } = useTheme();

  const cardVariants = {
    default: 'bg-card border-border/60',
    elevated: 'bg-card border-border/40 shadow-lg hover:shadow-xl',
    glass: 'bg-card/90 backdrop-blur-xl border-border/30',
    gradient: 'bg-gradient-to-br from-card via-card to-card/95 border-border/50'
  };

  const card = (
    <Card 
      className={cn(
        'transition-all duration-300 ease-out overflow-hidden rounded-xl border group',
        'mb-6 last:mb-0',
        
        // Base variant styling
        cardVariants[variant],
        
        // Interactive states
        interactive && [
          'cursor-pointer transform-gpu hover:scale-[1.02]',
          'hover:shadow-lg hover:-translate-y-1 hover:z-10',
          actualTheme === 'oled' && 'hover:shadow-primary/10 hover:border-primary/20'
        ],
        
        // Elevated hover effects
        elevated && 'hover:-translate-y-1 hover:z-20 hover:shadow-xl',
        
        // Theme-specific enhancements
        actualTheme === 'oled' && [
          'shadow-xl shadow-black/40',
          interactive && 'hover:shadow-2xl hover:shadow-primary/5'
        ],
        
        className
      )}
      style={{
        backdropFilter: variant === 'glass' ? 'blur(24px)' : undefined,
      }}
      {...props}
    >
      {children}
      
      {/* Subtle shine effect for OLED theme */}
      {actualTheme === 'oled' && interactive && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br from-transparent via-primary/20 to-transparent pointer-events-none" />
      )}
    </Card>
  );

  if (glowing) {
    return (
      <GlowEffect color="primary" intensity="medium" pulse={interactive} className="relative z-0">
        {magnetic ? <MagneticHover>{card}</MagneticHover> : card}
      </GlowEffect>
    );
  }

  return magnetic ? <MagneticHover>{card}</MagneticHover> : card;
}

// Enhanced button with professional styling and accessibility
export function ThemedButton({ 
  children, 
  className, 
  variant = 'default',
  glowing = false,
  magnetic = false,
  size = 'default',
  loading = false,
  disabled = false,
  ...props 
}) {
  const { actualTheme } = useTheme();

  const sizeClasses = {
    sm: 'min-h-[36px] px-4 py-2 text-sm font-medium',
    default: 'min-h-[44px] px-6 py-2.5 text-sm font-semibold',
    lg: 'min-h-[52px] px-8 py-3 text-base font-semibold',
    icon: 'h-10 w-10 p-0'
  };

  const variantClasses = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-sm hover:shadow-md',
    destructive: 'bg-red-600 text-white hover:bg-red-700 border border-red-600 hover:border-red-700 shadow-sm hover:shadow-md',
    outline: 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
    link: 'bg-transparent text-primary hover:text-primary/90 underline-offset-4 hover:underline border border-transparent p-0 h-auto font-medium'
  };

  const button = (
    <Button
      disabled={disabled || loading}
      className={cn(
        'relative overflow-hidden transition-all duration-200 ease-out transform-gpu rounded-lg',
        sizeClasses[size],
        variantClasses[variant],
        
        // Interactive states
        !disabled && !loading && [
          'hover:scale-[1.02] active:scale-[0.98]',
          'focus:ring-2 focus:ring-primary/20 focus:outline-none'
        ],
        
        // Disabled state
        (disabled || loading) && 'opacity-60 cursor-not-allowed transform-none',
        
        // Theme-specific enhancements
        actualTheme === 'oled' && variant === 'default' && 'shadow-lg hover:shadow-xl hover:shadow-primary/10',
        
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
      
      {/* Enhanced shimmer effect */}
      {actualTheme === 'oled' && !disabled && !loading && variant === 'default' && (
        <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 transform translate-x-full hover:translate-x-[-200%] transition-transform duration-700 pointer-events-none" />
      )}
    </Button>
  );

  if (glowing) {
    return (
      <GlowEffect color="primary" intensity="medium" className="inline-block">
        {magnetic ? <MagneticHover strength={0.1}>{button}</MagneticHover> : button}
      </GlowEffect>
    );
  }

  return magnetic ? <MagneticHover strength={0.1}>{button}</MagneticHover> : button;
}

// Premium glass container with advanced blur effects
export function GlassContainer({ children, className, intensity = 'medium', border = true }) {
  const { actualTheme } = useTheme();

  const intensityStyles = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-lg', 
    strong: 'backdrop-blur-xl'
  };

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl transition-all duration-300 ease-out',
      'mb-8 last:mb-0',
      intensityStyles[intensity],
      
      // Theme-aware glass effects
      actualTheme === 'light' && [
        'bg-white/80',
        border && 'border border-slate-200/60 shadow-lg shadow-slate-200/40'
      ],
      
      actualTheme === 'dark' && [
        'bg-card/85',
        border && 'border border-border/40 shadow-xl shadow-black/20'
      ],
      
      actualTheme === 'oled' && [
        'bg-card/90',
        border && 'border border-border/30 shadow-2xl shadow-black/50'
      ],
      
      className
    )}>
      {/* Advanced gradient overlay */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        actualTheme === 'light' && "bg-gradient-to-br from-white/30 via-transparent to-primary/3 opacity-60",
        actualTheme === 'dark' && "bg-gradient-to-br from-white/5 via-transparent to-primary/8 opacity-70",
        actualTheme === 'oled' && "bg-gradient-to-br from-primary/3 via-transparent to-primary/8 opacity-80"
      )} />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Enhanced status indicator with animations
export function StatusIndicator({ 
  status, 
  label, 
  size = 'sm',
  animated = false,
  glowing = false,
  showPulse = false
}) {
  const { actualTheme } = useTheme();
  
  const statusConfig = {
    active: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      glowColor: 'emerald',
      shadow: actualTheme === 'oled' ? 'shadow-emerald-400/30' : ''
    },
    warning: {
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400', 
      glowColor: 'amber',
      shadow: actualTheme === 'oled' ? 'shadow-amber-400/30' : ''
    },
    danger: {
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      glowColor: 'rose',
      shadow: actualTheme === 'oled' ? 'shadow-red-400/30' : ''
    },
    inactive: {
      color: 'bg-slate-400',
      textColor: 'text-slate-600 dark:text-slate-400',
      glowColor: 'slate',
      shadow: ''
    }
  };

  const config = statusConfig[status];
  const sizes = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const indicator = (
    <div className="flex items-center gap-3 py-2">
      <div className="relative flex-shrink-0">
        <div 
          className={cn(
            'rounded-full transition-all duration-300',
            config.color,
            sizes[size],
            config.shadow,
            animated && 'animate-pulse'
          )}
        />
        {showPulse && status === 'active' && (
          <div className={cn('absolute inset-0 rounded-full animate-ping', config.color, 'opacity-75')} />
        )}
      </div>
      {label && (
        <span className={cn(
          'text-sm font-semibold transition-colors duration-200',
          config.textColor
        )}>
          {label}
        </span>
      )}
    </div>
  );

  return glowing ? (
    <GlowEffect color={config.glowColor} intensity="subtle">
      {indicator}
    </GlowEffect>
  ) : indicator;
}

// Optimized progress bar with smooth animations
export function ThemedProgress({ value, className, glowing = false, showPercentage = false, indicatorColor, ...props }) {
  const { actualTheme } = useTheme();
  
  const clampedValue = Math.max(0, Math.min(100, value || 0));
  
  const progressBar = (
    <div 
      className={cn(
        'relative h-3 w-full overflow-hidden rounded-full my-3 transition-all duration-300',
        actualTheme === 'light' && 'bg-slate-200',
        actualTheme === 'dark' && 'bg-muted',
        actualTheme === 'oled' && 'bg-muted border border-border/20',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-1000 ease-out relative overflow-hidden',
          // Use provided indicatorColor class if given; otherwise theme defaults
          indicatorColor ? indicatorColor : [
            actualTheme === 'light' && 'bg-primary',
            actualTheme === 'dark' && 'bg-primary',
            actualTheme === 'oled' && 'bg-gradient-to-r from-primary via-primary to-primary/90 shadow-sm shadow-primary/30'
          ]
        )}
        style={{ width: `${clampedValue}%` }}
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
      </div>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground/80">{Math.round(clampedValue)}%</span>
        </div>
      )}
    </div>
  );

  return glowing ? (
    <GlowEffect color="primary" intensity="subtle">
      {progressBar}
    </GlowEffect>
  ) : progressBar;
}

// Enhanced metric card for displaying key statistics
export function MetricCard({ title, value, subtitle, icon: Icon, trend, className, loading = false, ...props }) {
  const { actualTheme } = useTheme();
  
  const trendConfig = {
    up: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', symbol: '↗' },
    down: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', symbol: '↘' },
    neutral: { color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20', symbol: '→' }
  };

  if (loading) {
    return (
      <ThemedCard 
        variant="elevated" 
        className={cn('p-6 animate-pulse', className)} 
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
          <div className="w-12 h-12 bg-muted rounded-xl"></div>
        </div>
      </ThemedCard>
    );
  }

  return (
    <ThemedCard 
      variant="elevated" 
      interactive 
      className={cn('p-6 group hover:scale-105 transition-transform duration-200', className)} 
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn('inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-full text-xs font-semibold', trendConfig[trend].bg, trendConfig[trend].color)}>
              <span>{trendConfig[trend].symbol}</span>
              <span>Trending {trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'p-3 rounded-xl transition-all duration-300',
            actualTheme === 'oled' ? 'bg-primary/10 shadow-lg shadow-primary/10' : 'bg-muted/60',
            'group-hover:bg-primary/20 group-hover:scale-110'
          )}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
    </ThemedCard>
  );
}

// Enhanced form input with better styling
export function ThemedInput({ className, error, ...props }) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm',
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        error && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      {...props}
    />
  );
}
