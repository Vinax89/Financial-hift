/**
 * @fileoverview Component Composition Patterns
 * @description Reusable patterns for building complex UI components
 * Phase B - Task B4: Advanced composition techniques and best practices
 */

import React, { createContext, useContext, useState, useCallback, cloneElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// PATTERN 1: COMPOUND COMPONENTS
// ============================================================================

/**
 * Accordion - Compound Component Pattern
 * Components work together through shared context
 * 
 * @example
 * <Accordion>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content for section 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */

const AccordionContext = createContext({
  activeItem: null,
  setActiveItem: () => {},
  multiple: false,
});

export function Accordion({ children, multiple = false, className, ...props }) {
  const [activeItem, setActiveItem] = useState(multiple ? [] : null);

  const toggleItem = useCallback((value) => {
    if (multiple) {
      setActiveItem((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    } else {
      setActiveItem((prev) => (prev === value ? null : value));
    }
  }, [multiple]);

  const isActive = useCallback((value) => {
    if (multiple) {
      return activeItem.includes(value);
    }
    return activeItem === value;
  }, [activeItem, multiple]);

  return (
    <AccordionContext.Provider value={{ activeItem, setActiveItem: toggleItem, isActive }}>
      <div className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ children, value, className }) {
  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)} data-value={value}>
      {children}
    </div>
  );
}

export function AccordionTrigger({ children, className, ...props }) {
  const { isActive, setActiveItem } = useContext(AccordionContext);
  const parentValue = props['data-value'] || 
    React.Children.toArray(children).find(child => child.props?.['data-value'])?.props['data-value'];
  
  const active = isActive(parentValue);

  return (
    <button
      className={cn(
        'w-full p-4 text-left font-medium transition-colors',
        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring',
        active && 'bg-muted',
        className
      )}
      onClick={() => setActiveItem(parentValue)}
      aria-expanded={active}
      {...props}
    >
      <div className="flex justify-between items-center">
        <span>{children}</span>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-muted-foreground"
          animate={{ rotate: active ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </div>
    </button>
  );
}

export function AccordionContent({ children, className }) {
  const { isActive } = useContext(AccordionContext);
  const parentValue = React.useContext(AccordionContext).activeItem;
  const active = isActive(parentValue);

  return (
    <AnimatePresence initial={false}>
      {active && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className={cn('p-4 pt-0', className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// PATTERN 2: RENDER PROPS
// ============================================================================

/**
 * LoadingState - Render Props Pattern
 * Provides loading state logic, consumer provides UI
 * 
 * @example
 * <LoadingState>
 *   {({ isLoading, startLoading, stopLoading }) => (
 *     <button onClick={startLoading}>
 *       {isLoading ? 'Loading...' : 'Load Data'}
 *     </button>
 *   )}
 * </LoadingState>
 */

export function LoadingState({ children, initialLoading = false, onLoadingChange }) {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    onLoadingChange?.(true);
  }, [onLoadingChange]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    onLoadingChange?.(false);
  }, [onLoadingChange]);

  const toggleLoading = useCallback(() => {
    setIsLoading((prev) => {
      const next = !prev;
      onLoadingChange?.(next);
      return next;
    });
  }, [onLoadingChange]);

  return children({
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  });
}

/**
 * FetchData - Render Props with Async Data Fetching
 * 
 * @example
 * <FetchData fetchFn={fetchUsers}>
 *   {({ data, loading, error, refetch }) => (
 *     loading ? <Spinner /> :
 *     error ? <Error message={error} /> :
 *     <UserList users={data} onRefresh={refetch} />
 *   )}
 * </FetchData>
 */

export function FetchData({ fetchFn, children, deps = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  React.useEffect(() => {
    fetchData();
  }, [...deps, fetchData]);

  return children({
    data,
    loading,
    error,
    refetch: fetchData,
  });
}

// ============================================================================
// PATTERN 3: HIGHER-ORDER COMPONENTS (HOCs)
// ============================================================================

/**
 * withLoading - HOC that adds loading state
 * 
 * @example
 * const EnhancedComponent = withLoading(MyComponent);
 * <EnhancedComponent isLoading={true} />
 */

export function withLoading(Component, LoaderComponent = null) {
  return function WithLoadingComponent({ isLoading, loadingText, ...props }) {
    if (isLoading) {
      if (LoaderComponent) {
        return <LoaderComponent text={loadingText} />;
      }
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          {loadingText && <span className="ml-3 text-muted-foreground">{loadingText}</span>}
        </div>
      );
    }
    return <Component {...props} />;
  };
}

/**
 * withErrorBoundary - HOC that catches errors
 * 
 * @example
 * const SafeComponent = withErrorBoundary(RiskyComponent);
 */

export function withErrorBoundary(Component, FallbackComponent = null) {
  return class WithErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by HOC:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        if (FallbackComponent) {
          return <FallbackComponent error={this.state.error} />;
        }
        return (
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <h3 className="font-semibold text-destructive">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mt-1">{this.state.error?.message}</p>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}

/**
 * withTheme - HOC that injects theme props
 * 
 * @example
 * const ThemedComponent = withTheme(MyComponent);
 * // Component receives: theme, isDark, isOled, getGlowColor
 */

export function withTheme(Component) {
  return function WithThemeComponent(props) {
    const theme = useTheme?.() || { theme: 'light', isDark: false };
    return <Component {...props} theme={theme} />;
  };
}

// Import useTheme if available
let useTheme;
try {
  useTheme = require('@/theme/ThemeProvider').useTheme;
} catch {
  // Theme provider not available
}

// ============================================================================
// PATTERN 4: COMPOUND COMPONENT WITH STATE MACHINE
// ============================================================================

/**
 * Stepper - Multi-step form with state machine
 * 
 * @example
 * <Stepper onComplete={handleComplete}>
 *   <Step name="personal">
 *     <StepContent>Personal Information</StepContent>
 *   </Step>
 *   <Step name="payment">
 *     <StepContent>Payment Details</StepContent>
 *   </Step>
 *   <StepActions>
 *     {({ isFirst, isLast, next, prev }) => (
 *       <>
 *         <button onClick={prev} disabled={isFirst}>Back</button>
 *         <button onClick={next}>{isLast ? 'Finish' : 'Next'}</button>
 *       </>
 *     )}
 *   </StepActions>
 * </Stepper>
 */

const StepperContext = createContext({
  currentStep: 0,
  steps: [],
  goToStep: () => {},
  next: () => {},
  prev: () => {},
  isFirst: false,
  isLast: false,
});

export function Stepper({ children, onComplete, className }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = React.Children.toArray(children).filter(
    (child) => child.type === Step
  );

  const goToStep = useCallback((index) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  }, [steps.length]);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === steps.length - 1) {
      onComplete?.();
    }
  }, [currentStep, steps.length, onComplete]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const value = {
    currentStep,
    steps: steps.map((s) => s.props.name),
    goToStep,
    next,
    prev,
    isFirst: currentStep === 0,
    isLast: currentStep === steps.length - 1,
  };

  return (
    <StepperContext.Provider value={value}>
      <div className={cn('space-y-6', className)}>
        {/* Progress indicator */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Current step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>

        {/* Render actions if provided */}
        {React.Children.toArray(children).find(
          (child) => child.type === StepActions
        )}
      </div>
    </StepperContext.Provider>
  );
}

export function Step({ children, name }) {
  return <div data-step-name={name}>{children}</div>;
}

export function StepContent({ children, className }) {
  return <div className={cn('p-6 border border-border rounded-lg', className)}>{children}</div>;
}

export function StepActions({ children }) {
  const context = useContext(StepperContext);
  return <div className="flex justify-between gap-4">{children(context)}</div>;
}

// ============================================================================
// PATTERN 5: SLOT PATTERN (Flexible Composition)
// ============================================================================

/**
 * Card with slots - Flexible composition pattern
 * 
 * @example
 * <Card>
 *   <Card.Header>
 *     <Card.Title>Title</Card.Title>
 *     <Card.Description>Description</Card.Description>
 *   </Card.Header>
 *   <Card.Content>Main content</Card.Content>
 *   <Card.Footer>Footer actions</Card.Footer>
 * </Card>
 */

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return <div className={cn('p-6 pb-4', className)}>{children}</div>;
};

Card.Title = function CardTitle({ children, className }) {
  return <h3 className={cn('text-xl font-semibold leading-none', className)}>{children}</h3>;
};

Card.Description = function CardDescription({ children, className }) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)}>{children}</p>;
};

Card.Content = function CardContent({ children, className }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className }) {
  return <div className={cn('p-6 pt-0 flex gap-2', className)}>{children}</div>;
};

// ============================================================================
// PATTERN 6: CONTROLLED VS UNCONTROLLED
// ============================================================================

/**
 * Toggle - Supports both controlled and uncontrolled modes
 * 
 * @example
 * // Uncontrolled
 * <Toggle defaultValue={false} onChange={handleChange} />
 * 
 * // Controlled
 * <Toggle value={isToggled} onChange={setIsToggled} />
 */

export function Toggle({ value, defaultValue = false, onChange, className, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  // Determine if controlled or uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleToggle = useCallback(() => {
    const newValue = !currentValue;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  }, [currentValue, isControlled, onChange]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={currentValue}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        currentValue ? 'bg-primary' : 'bg-muted',
        className
      )}
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
        animate={{ x: currentValue ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      {children}
    </button>
  );
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export default {
  // Compound Components
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Stepper,
  Step,
  StepContent,
  StepActions,
  Card,

  // Render Props
  LoadingState,
  FetchData,

  // HOCs
  withLoading,
  withErrorBoundary,
  withTheme,

  // Controlled/Uncontrolled
  Toggle,
};
