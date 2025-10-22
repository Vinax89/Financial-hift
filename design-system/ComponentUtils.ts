/**
 * @fileoverview Unified Component Utilities
 * @description Helper functions for consistent component behavior across the app
 */

import { ANIMATION, A11Y, SPACING } from './DesignTokens';
import { cn } from '@/lib/utils';

/**
 * Generate consistent focus ring classes
 * @param {Object} options - Focus ring options
 * @param {boolean} options.visible - Whether to show focus ring
 * @param {string} options.color - Focus ring color (default: ring)
 * @returns {string} Tailwind classes for focus ring
 * 
 * @example
 * ```tsx
 * <button className={cn('...', focusRing())}>Click me</button>
 * ```
 */
export function focusRing({ visible = true, color = 'ring' } = {}) {
  if (!visible) return '';
  
  return cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    `focus-visible:ring-${color}`,
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background'
  );
}

/**
 * Generate consistent interactive states (hover, active, focus)
 * @param {Object} options - Interactive state options
 * @param {boolean} options.hover - Enable hover effects
 * @param {boolean} options.active - Enable active/pressed effects
 * @param {boolean} options.focus - Enable focus effects
 * @param {boolean} options.disabled - Disabled state
 * @returns {string} Tailwind classes for interactive states
 * 
 * @example
 * ```tsx
 * <button className={cn('...', interactiveStates())}>Interactive</button>
 * ```
 */
export function interactiveStates({
  hover = true,
  active = true,
  focus = true,
  disabled = false,
} = {}) {
  if (disabled) {
    return cn(
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none'
    );
  }

  return cn(
    'transition-all duration-200 ease-out',
    hover && 'hover:scale-[1.02] hover:shadow-md',
    active && 'active:scale-[0.98]',
    focus && focusRing(),
    'cursor-pointer'
  );
}

/**
 * Generate loading state classes
 * @param {boolean} isLoading - Whether component is loading
 * @param {Object} options - Loading options
 * @param {boolean} options.showSpinner - Show loading spinner
 * @param {boolean} options.dimContent - Dim content while loading
 * @returns {string} Tailwind classes for loading state
 * 
 * @example
 * ```tsx
 * <div className={loadingState(isLoading)}>Content</div>
 * ```
 */
export function loadingState(isLoading, { showSpinner = false, dimContent = true } = {}) {
  if (!isLoading) return '';
  
  return cn(
    'relative',
    dimContent && 'opacity-60',
    'pointer-events-none',
    'cursor-wait'
  );
}

/**
 * Generate consistent card/container styles
 * @param {Object} options - Card styling options
 * @param {string} options.variant - Card variant (default, elevated, glass, outlined)
 * @param {boolean} options.interactive - Enable interactive hover effects
 * @param {boolean} options.padding - Card padding size
 * @returns {string} Tailwind classes for card
 * 
 * @example
 * ```tsx
 * <div className={cardStyles({ variant: 'elevated', interactive: true })}>
 *   Card content
 * </div>
 * ```
 */
export function cardStyles({
  variant = 'default',
  interactive = false,
  padding = 'base',
} = {}) {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    base: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const variantMap = {
    default: cn(
      'bg-card',
      'border border-border/60',
      'rounded-xl',
      'shadow-sm'
    ),
    elevated: cn(
      'bg-card',
      'border border-border/40',
      'rounded-xl',
      'shadow-lg'
    ),
    glass: cn(
      'bg-card/90',
      'backdrop-blur-xl',
      'border border-border/30',
      'rounded-xl',
      'shadow-md'
    ),
    outlined: cn(
      'bg-transparent',
      'border-2 border-border',
      'rounded-xl'
    ),
  };

  return cn(
    variantMap[variant],
    paddingMap[padding],
    'transition-all duration-200',
    interactive && [
      'hover:shadow-xl',
      'hover:border-border',
      'cursor-pointer',
      'hover:-translate-y-0.5'
    ]
  );
}

/**
 * Generate consistent button styles (complements shadcn button)
 * @param {Object} options - Button options
 * @param {boolean} options.loading - Button loading state
 * @param {boolean} options.fullWidth - Full width button
 * @param {string} options.iconPosition - Icon position (left, right, only)
 * @returns {string} Additional button classes
 * 
 * @example
 * ```tsx
 * <Button className={buttonEnhancements({ loading: true })}>
 *   Submit
 * </Button>
 * ```
 */
export function buttonEnhancements({
  loading = false,
  fullWidth = false,
  iconPosition = null,
} = {}) {
  return cn(
    fullWidth && 'w-full',
    loading && 'relative opacity-75 cursor-wait',
    iconPosition === 'left' && 'flex-row-reverse',
    iconPosition === 'only' && 'px-2',
    // Ensure minimum touch target
    `min-h-[${A11Y.minTouchTarget}]`,
    'select-none'
  );
}

/**
 * Generate consistent input/form field styles
 * @param {Object} options - Input options
 * @param {boolean} options.error - Error state
 * @param {boolean} options.disabled - Disabled state
 * @param {string} options.size - Input size (sm, base, lg)
 * @returns {string} Tailwind classes for input
 * 
 * @example
 * ```tsx
 * <input className={inputStyles({ error: hasError })} />
 * ```
 */
export function inputStyles({
  error = false,
  disabled = false,
  size = 'base',
} = {}) {
  const sizeMap = {
    sm: 'h-8 px-3 text-sm',
    base: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg',
  };

  return cn(
    'flex w-full rounded-lg',
    'border bg-background',
    'transition-colors duration-200',
    sizeMap[size],
    error ? [
      'border-destructive',
      'focus:ring-destructive',
      'focus:ring-2',
      'focus:ring-offset-1'
    ] : [
      'border-input',
      'focus:ring-ring',
      'focus:ring-2',
      'focus:ring-offset-1'
    ],
    disabled && [
      'opacity-50',
      'cursor-not-allowed',
      'bg-muted'
    ],
    !disabled && 'hover:border-ring/50',
    'focus-visible:outline-none',
    'placeholder:text-muted-foreground'
  );
}

/**
 * Generate consistent badge/tag styles
 * @param {string} variant - Badge variant (default, success, warning, error, info)
 * @param {string} size - Badge size (sm, base, lg)
 * @returns {string} Tailwind classes for badge
 * 
 * @example
 * ```tsx
 * <span className={badgeStyles('success', 'sm')}>Active</span>
 * ```
 */
export function badgeStyles(variant = 'default', size = 'base') {
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5',
    base: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const variantMap = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return cn(
    'inline-flex items-center',
    'rounded-full',
    'font-medium',
    'whitespace-nowrap',
    'transition-colors',
    sizeMap[size],
    variantMap[variant]
  );
}

/**
 * Generate skeleton loading placeholder
 * @param {string} variant - Skeleton shape (text, circle, rectangle)
 * @param {string} width - Width class
 * @param {string} height - Height class
 * @returns {string} Tailwind classes for skeleton
 * 
 * @example
 * ```tsx
 * <div className={skeletonStyles('text', 'w-full', 'h-4')} />
 * ```
 */
export function skeletonStyles(variant = 'rectangle', width = 'w-full', height = 'h-4') {
  const variantMap = {
    text: 'rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
  };

  return cn(
    'animate-pulse',
    'bg-muted',
    variantMap[variant],
    width,
    height
  );
}

/**
 * Generate consistent heading styles
 * @param {string} level - Heading level (h1-h6)
 * @param {Object} options - Heading options
 * @param {boolean} options.gradient - Apply gradient effect
 * @param {boolean} options.balance - Use text-balance for better line breaks
 * @returns {string} Tailwind classes for heading
 * 
 * @example
 * ```tsx
 * <h1 className={headingStyles('h1', { gradient: true })}>Title</h1>
 * ```
 */
export function headingStyles(level = 'h1', { gradient = false, balance = true } = {}) {
  const levelMap = {
    h1: 'text-4xl md:text-5xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-semibold',
    h6: 'text-base md:text-lg font-semibold',
  };

  return cn(
    levelMap[level],
    balance && 'text-balance',
    gradient && [
      'bg-gradient-to-r from-primary to-primary/70',
      'bg-clip-text text-transparent'
    ]
  );
}

/**
 * Generate responsive container classes
 * @param {string} size - Container size (sm, base, lg, xl, full)
 * @param {boolean} centered - Center the container
 * @returns {string} Tailwind classes for container
 * 
 * @example
 * ```tsx
 * <div className={containerStyles('lg', true)}>Content</div>
 * ```
 */
export function containerStyles(size = 'lg', centered = true) {
  const sizeMap = {
    sm: 'max-w-2xl',
    base: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'w-full',
  };

  return cn(
    'w-full',
    sizeMap[size],
    centered && 'mx-auto',
    'px-4 sm:px-6 lg:px-8'
  );
}

/**
 * Generate consistent transition classes
 * @param {string} property - CSS property to transition
 * @param {string} duration - Duration preset
 * @param {string} easing - Easing preset
 * @returns {string} Tailwind classes for transition
 * 
 * @example
 * ```tsx
 * <div className={transitionStyles('all', 'base', 'easeOut')}>Animated</div>
 * ```
 */
export function transitionStyles(property = 'all', duration = 'base', easing = 'easeOut') {
  const propertyMap = {
    all: 'transition-all',
    colors: 'transition-colors',
    opacity: 'transition-opacity',
    transform: 'transition-transform',
    shadow: 'transition-shadow',
  };

  const durationMap = {
    fast: 'duration-150',
    base: 'duration-200',
    moderate: 'duration-300',
    slow: 'duration-500',
  };

  const easingMap = {
    linear: 'ease-linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  };

  return cn(
    propertyMap[property],
    durationMap[duration],
    easingMap[easing]
  );
}

/**
 * Generate consistent empty state container
 * @param {Object} options - Empty state options
 * @param {string} options.size - Container size (sm, base, lg)
 * @returns {string} Tailwind classes for empty state
 * 
 * @example
 * ```tsx
 * <div className={emptyStateStyles()}>
 *   <p>No data available</p>
 * </div>
 * ```
 */
export function emptyStateStyles({ size = 'base' } = {}) {
  const sizeMap = {
    sm: 'py-8',
    base: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
  };

  return cn(
    'flex flex-col items-center justify-center',
    'text-center',
    sizeMap[size],
    'px-4'
  );
}
