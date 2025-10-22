/**
 * @fileoverview Design System Tokens for Financial $hift
 * @description Centralized design tokens for consistency across the entire application.
 * All UI components should reference these tokens instead of hardcoded values.
 */

/**
 * Spacing scale - All spacing should use these values
 * Based on 4px grid system for visual consistency
 */
export const SPACING = {
  /** 4px - Micro spacing for tight elements */
  xs: '0.25rem',
  /** 8px - Small spacing between related items */
  sm: '0.5rem',
  /** 12px - Default spacing for compact layouts */
  md: '0.75rem',
  /** 16px - Standard spacing between elements */
  base: '1rem',
  /** 20px - Medium spacing for sections */
  lg: '1.25rem',
  /** 24px - Large spacing between sections */
  xl: '1.5rem',
  /** 32px - Extra large spacing */
  '2xl': '2rem',
  /** 40px - Major section spacing */
  '3xl': '2.5rem',
  /** 48px - Page section dividers */
  '4xl': '3rem',
  /** 64px - Hero spacing */
  '5xl': '4rem',
} as const;

/**
 * Typography scale with consistent sizing and line-heights
 */
export const TYPOGRAPHY = {
  /** Font families */
  fonts: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
  },
  
  /** Font sizes with corresponding line-heights */
  sizes: {
    /** 12px / 16px - Micro text */
    xs: { size: '0.75rem', lineHeight: '1rem' },
    /** 14px / 20px - Small text, captions */
    sm: { size: '0.875rem', lineHeight: '1.25rem' },
    /** 16px / 24px - Base body text */
    base: { size: '1rem', lineHeight: '1.5rem' },
    /** 18px / 28px - Large body text */
    lg: { size: '1.125rem', lineHeight: '1.75rem' },
    /** 20px / 28px - Small headings */
    xl: { size: '1.25rem', lineHeight: '1.75rem' },
    /** 24px / 32px - Medium headings */
    '2xl': { size: '1.5rem', lineHeight: '2rem' },
    /** 30px / 36px - Large headings */
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
    /** 36px / 40px - Extra large headings */
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
    /** 48px / 1 - Hero headings */
    '5xl': { size: '3rem', lineHeight: '1' },
  },
  
  /** Font weights */
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/**
 * Border radius scale for consistent rounded corners
 */
export const RADIUS = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  full: '9999px',     // Pills/circles
} as const;

/**
 * Shadow scale for depth and elevation
 */
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: '0 0 15px rgba(14, 165, 233, 0.3)',
} as const;

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * Animation timing functions and durations
 */
export const ANIMATION = {
  /** Duration presets */
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '200ms',
    moderate: '300ms',
    slow: '400ms',
    slower: '600ms',
  },
  
  /** Easing curves */
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  /** Common transition combinations */
  transition: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 200ms, background-color 200ms, border-color 200ms',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Component-specific sizing presets
 */
export const COMPONENT_SIZES = {
  /** Button heights */
  button: {
    sm: '2rem',      // 32px
    base: '2.5rem',  // 40px
    lg: '3rem',      // 48px
  },
  
  /** Input heights */
  input: {
    sm: '2rem',      // 32px
    base: '2.5rem',  // 40px
    lg: '3rem',      // 48px
  },
  
  /** Icon sizes */
  icon: {
    xs: '1rem',      // 16px
    sm: '1.25rem',   // 20px
    base: '1.5rem',  // 24px
    lg: '2rem',      // 32px
    xl: '2.5rem',    // 40px
  },
  
  /** Avatar sizes */
  avatar: {
    xs: '1.5rem',    // 24px
    sm: '2rem',      // 32px
    base: '2.5rem',  // 40px
    lg: '3rem',      // 48px
    xl: '4rem',      // 64px
  },
} as const;

/**
 * Opacity scale for consistent transparency
 */
export const OPACITY = {
  disabled: '0.5',
  hover: '0.9',
  loading: '0.6',
  backdrop: '0.5',
  subtle: '0.05',
  medium: '0.1',
  strong: '0.15',
} as const;

/**
 * Common layout containers
 */
export const LAYOUT = {
  /** Maximum content widths */
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },
  
  /** Container padding */
  containerPadding: {
    mobile: SPACING.base,
    tablet: SPACING.xl,
    desktop: SPACING['2xl'],
  },
} as const;

/**
 * Interactive element minimum sizes (accessibility)
 */
export const A11Y = {
  /** Minimum tap target size (WCAG AAA) */
  minTouchTarget: '44px',
  
  /** Minimum tap target size (WCAG AA) */
  minTouchTargetAA: '24px',
  
  /** Focus ring width */
  focusRingWidth: '2px',
  
  /** Focus ring offset */
  focusRingOffset: '2px',
} as const;

/**
 * Chart colors for data visualization
 */
export const CHART_COLORS = {
  primary: [
    'hsl(199, 89%, 48%)',   // Primary
    'hsl(199, 89%, 55%)',   // Lighter
    'hsl(199, 89%, 40%)',   // Darker
  ],
  categorical: [
    'hsl(199, 89%, 55%)',   // Blue
    'hsl(142, 71%, 45%)',   // Green
    'hsl(262, 83%, 58%)',   // Purple
    'hsl(291, 64%, 42%)',   // Magenta
    'hsl(48, 96%, 53%)',    // Yellow
    'hsl(24, 95%, 53%)',    // Orange
    'hsl(0, 84%, 60%)',     // Red
    'hsl(189, 94%, 43%)',   // Cyan
  ],
  sequential: {
    blue: [
      'hsl(199, 89%, 85%)',
      'hsl(199, 89%, 70%)',
      'hsl(199, 89%, 55%)',
      'hsl(199, 89%, 40%)',
      'hsl(199, 89%, 25%)',
    ],
    green: [
      'hsl(142, 71%, 85%)',
      'hsl(142, 71%, 70%)',
      'hsl(142, 71%, 55%)',
      'hsl(142, 71%, 40%)',
      'hsl(142, 71%, 25%)',
    ],
  },
  status: {
    success: 'hsl(142, 71%, 45%)',
    warning: 'hsl(48, 96%, 53%)',
    error: 'hsl(0, 84%, 60%)',
    info: 'hsl(199, 89%, 55%)',
  },
} as const;

/**
 * Semantic color mappings (refer to CSS variables)
 */
export const SEMANTIC_COLORS = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  primary: 'var(--primary)',
  'primary-foreground': 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  'secondary-foreground': 'var(--secondary-foreground)',
  muted: 'var(--muted)',
  'muted-foreground': 'var(--muted-foreground)',
  accent: 'var(--accent)',
  'accent-foreground': 'var(--accent-foreground)',
  destructive: 'var(--destructive)',
  'destructive-foreground': 'var(--destructive-foreground)',
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
} as const;

/**
 * Type definitions for design tokens
 */
export type Spacing = keyof typeof SPACING;
export type FontSize = keyof typeof TYPOGRAPHY.sizes;
export type FontWeight = keyof typeof TYPOGRAPHY.weights;
export type BorderRadius = keyof typeof RADIUS;
export type Shadow = keyof typeof SHADOWS;
export type AnimationDuration = keyof typeof ANIMATION.duration;
export type AnimationEasing = keyof typeof ANIMATION.easing;
export type Breakpoint = keyof typeof BREAKPOINTS;
export type ButtonSize = keyof typeof COMPONENT_SIZES.button;
export type IconSize = keyof typeof COMPONENT_SIZES.icon;
