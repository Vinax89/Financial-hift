/**
 * @fileoverview Google Analytics 4 integration utility
 * @description Provides analytics tracking for user actions, page views, and events
 */

/**
 * Initialize Google Analytics 4
 * Call this in main.jsx or App.jsx
 */
export function initAnalytics() {
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
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', trackingId, {
    send_page_view: false // We'll manually track page views
  });

  if (import.meta.env.DEV) {
    console.log('[Analytics] GA4 initialized:', trackingId);
  }
}

/**
 * Track a page view
 * @param {string} pagePath - The page path (e.g., '/dashboard')
 * @param {string} pageTitle - The page title
 */
export function trackPageView(pagePath, pageTitle = '') {
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
 * @param {string} eventName - Name of the event (e.g., 'transaction_created')
 * @param {Object} eventParams - Event parameters
 */
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] Event:', eventName, eventParams);
    }
  }
}

/**
 * Track user action
 * @param {string} action - The action name (e.g., 'create_budget')
 * @param {string} category - Category (e.g., 'Budget')
 * @param {string} label - Optional label
 * @param {number} value - Optional numeric value
 */
export function trackAction(action, category, label = '', value = null) {
  const params = {
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
 * @param {string} conversionName - Name of conversion (e.g., 'signup', 'goal_completed')
 * @param {number} value - Monetary value (optional)
 * @param {string} currency - Currency code (default: USD)
 */
export function trackConversion(conversionName, value = null, currency = 'USD') {
  const params = { currency };
  
  if (value !== null) {
    params.value = value;
  }
  
  trackEvent(conversionName, params);
}

/**
 * Track feature usage
 * @param {string} featureName - Name of feature (e.g., 'debt_simulator')
 * @param {Object} properties - Additional properties
 */
export function trackFeatureUsage(featureName, properties = {}) {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...properties
  });
}

/**
 * Track error occurrence
 * @param {string} errorMessage - Error message
 * @param {string} errorType - Type of error (e.g., 'api_error', 'validation_error')
 * @param {boolean} fatal - Whether error was fatal
 */
export function trackError(errorMessage, errorType = 'error', fatal = false) {
  trackEvent('exception', {
    description: errorMessage,
    error_type: errorType,
    fatal
  });
}

/**
 * Set user properties for analytics
 * @param {Object} properties - User properties (e.g., { user_id, plan_type })
 */
export function setUserProperties(properties) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('set', 'user_properties', properties);
    
    if (import.meta.env.DEV) {
      console.log('[Analytics] User properties set:', properties);
    }
  }
}

/**
 * Track timing/performance metric
 * @param {string} name - Metric name (e.g., 'api_call_duration')
 * @param {number} value - Duration in milliseconds
 * @param {string} category - Category (e.g., 'API')
 * @param {string} label - Optional label
 */
export function trackTiming(name, value, category = 'Performance', label = '') {
  trackEvent('timing_complete', {
    name,
    value: Math.round(value),
    event_category: category,
    event_label: label
  });
}

/**
 * Track ecommerce/transaction (for subscription tracking)
 * @param {Object} transaction - Transaction details
 */
export function trackTransaction(transaction) {
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
export function usePageTracking() {
  if (typeof window === 'undefined') return;

  return (pagePath, pageTitle) => {
    trackPageView(pagePath, pageTitle);
  };
}

/**
 * Higher-order function to wrap async functions with timing tracking
 * @param {Function} fn - Async function to track
 * @param {string} name - Name for the timing metric
 * @returns {Function} Wrapped function
 */
export function withTiming(fn, name) {
  return async (...args) => {
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
