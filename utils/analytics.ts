// @ts-nocheck
/**
 * @fileoverview Google Analytics 4 integration utility
 * @description Provides analytics tracking for user actions, page views, and events
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface GtagConfig {
  send_page_view?: boolean;
  [key: string]: any;
}

interface EventParams {
  [key: string]: any;
}

interface TrackActionParams {
  event_category: string;
  event_label: string;
  value?: number;
}

interface TransactionItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  [key: string]: any;
}

interface Transaction {
  transaction_id: string;
  value: number;
  currency?: string;
  items?: TransactionItem[];
}

/**
 * Initialize Google Analytics 4
 * Call this in main.jsx or App.jsx
 */
export function initAnalytics(): void {
  const trackingId = import.meta.env.VITE_GA_TRACKING_ID;

  if (!trackingId) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] GA4 Tracking ID not configured');
    }
    return;
  }

  // Load GA4 script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]): void {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', trackingId, {
    send_page_view: false // We'll manually track page views
  } as GtagConfig);

  if (import.meta.env.DEV) {
    console.log('[Analytics] GA4 initialized:', trackingId);
  }
}

/**
 * Track a page view
 */
export function trackPageView(pagePath: string, pageTitle: string = ''): void {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });

    if (import.meta.env.DEV) {
      console.log('[Analytics] Page view:', pagePath);
    }
  }
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, eventParams: EventParams = {}): void {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);

    if (import.meta.env.DEV) {
      console.log('[Analytics] Event:', eventName, eventParams);
    }
  }
}

/**
 * Track user action
 */
export function trackAction(
  action: string, 
  category: string, 
  label: string = '', 
  value: number | null = null
): void {
  const params: TrackActionParams = {
    event_category: category,
    event_label: label
  };

  if (value !== null) {
    params.value = value;
  }

  trackEvent(action, params);
}

/**
 * Track conversion event
 */
export function trackConversion(
  conversionName: string, 
  value: number | null = null, 
  currency: string = 'USD'
): void {
  const params: EventParams = { currency };

  if (value !== null) {
    params.value = value;
  }

  trackEvent(conversionName, params);
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, properties: EventParams = {}): void {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...properties
  });
}

/**
 * Track error occurrence
 */
export function trackError(
  errorMessage: string, 
  errorType: string = 'error', 
  fatal: boolean = false
): void {
  trackEvent('exception', {
    description: errorMessage,
    error_type: errorType,
    fatal
  });
}

/**
 * Set user properties for analytics
 */
export function setUserProperties(properties: EventParams): void {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('set', 'user_properties', properties);

    if (import.meta.env.DEV) {
      console.log('[Analytics] User properties set:', properties);
    }
  }
}

/**
 * Track timing/performance metric
 */
export function trackTiming(
  name: string, 
  value: number, 
  category: string = 'Performance', 
  label: string = ''
): void {
  trackEvent('timing_complete', {
    name,
    value: Math.round(value),
    event_category: category,
    event_label: label
  });
}

/**
 * Track ecommerce/transaction (for subscription tracking)
 */
export function trackTransaction(transaction: Transaction): void {
  const {
    transaction_id,
    value,
    currency = 'USD',
    items = []
  } = transaction;

  trackEvent('purchase', {
    transaction_id,
    value,
    currency,
    items
  });
}

/**
 * React Hook for tracking page views
 * Use in your Route components
 */
export function usePageTracking(): ((pagePath: string, pageTitle?: string) => void) | undefined {
  if (typeof window === 'undefined') return undefined;

  return (pagePath: string, pageTitle?: string) => {
    trackPageView(pagePath, pageTitle || '');
  };
}

/**
 * Higher-order function to wrap async functions with timing tracking
 */
export function withTiming<T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  name: string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      trackTiming(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      trackTiming(`${name}_error`, duration);
      throw error;
    }
  };
}

// Export all functions
export default {
  init: initAnalytics,
  trackPageView,
  trackEvent,
  trackAction,
  trackConversion,
  trackFeatureUsage,
  trackError,
  setUserProperties,
  trackTiming,
  trackTransaction,
  usePageTracking,
  withTiming
};
