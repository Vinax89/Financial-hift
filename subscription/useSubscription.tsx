import React from "react";
import { User, Subscription, Plan } from "@/api/entities";

/**
 * Plan data structure
 */
interface PlanData {
  name: string;
  slug: string;
  currency: string;
  price_monthly: number;
  price_annual: number;
  trial_days: number;
  features: string[];
  limits: Record<string, any>;
  is_active: boolean;
}

/**
 * User data structure
 */
interface UserData {
  id?: string | number;
  plan_slug?: string;
  subscription_status?: string;
  trial_ends_at?: string | null;
  [key: string]: any;
}

/**
 * Subscription data structure
 */
interface SubscriptionData {
  id?: string | number;
  plan_slug?: string;
  status?: string;
  trial_end?: string | null;
  created_date?: string;
  [key: string]: any;
}

/**
 * Hook return value
 */
interface UseSubscriptionReturn {
  /** Loading state */
  loading: boolean;
  /** Current user data */
  user: UserData | null;
  /** Current plan details */
  plan: PlanData;
  /** Current subscription data */
  subscription: SubscriptionData | null;
  /** Subscription status */
  status: string;
  /** Trial end date */
  trialEndsAt: string | null;
  /** Check if user has access to a feature */
  hasFeature: (featureKey: string) => boolean;
}

/**
 * Default free plan configuration
 */
const DEFAULT_FREE_PLAN: PlanData = {
  name: "Free",
  slug: "free",
  currency: "USD",
  price_monthly: 0,
  price_annual: 0,
  trial_days: 0,
  features: ["perf_inspector", "network_monitor"],
  limits: {},
  is_active: true
};

/**
 * Subscription hook for managing user subscription state
 * 
 * Fetches and manages user subscription data, plan details, and feature access.
 * Automatically loads user data and their active subscription on mount.
 * 
 * @hook
 * @returns {UseSubscriptionReturn} Subscription state and utilities
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { loading, plan, hasFeature } = useSubscription();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   
 *   if (hasFeature('ai_assistant')) {
 *     return <AIAssistant />;
 *   }
 *   
 *   return <div>Upgrade to access AI Assistant</div>;
 * }
 * ```
 */
export default function useSubscription(): UseSubscriptionReturn {
  const [user, setUser] = React.useState<UserData | null>(null);
  const [plan, setPlan] = React.useState<PlanData>(DEFAULT_FREE_PLAN);
  const [subscription, setSubscription] = React.useState<SubscriptionData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await User.me();
        setUser(me || null);

        // Load latest subscription for user, if any
        const subs = await Subscription.list("-created_date", 1);
        const sub = Array.isArray(subs) && subs.length ? subs[0] : null;
        setSubscription(sub);

        const planSlug = sub?.plan_slug || me?.plan_slug || "free";
        const plans = await Plan.filter({ slug: planSlug });
        const currentPlan = Array.isArray(plans) && plans.length ? plans[0] : DEFAULT_FREE_PLAN;
        setPlan(currentPlan);
      } catch {
        setUser(null);
        setPlan(DEFAULT_FREE_PLAN);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Check if user has access to a specific feature
   * @param {string} featureKey - Feature identifier to check
   * @returns {boolean} True if feature is accessible
   */
  const hasFeature = React.useCallback((featureKey: string): boolean => {
    // Treat these as Pro features for any paid plan (non-free)
    const isPaid = (plan?.slug && plan.slug !== "free") || ((plan?.price_monthly || 0) > 0 || (plan?.price_annual || 0) > 0);
    if (["ai_assistant", "income_viability"].includes(featureKey)) {
      return !!isPaid;
    }
    return Array.isArray(plan?.features) && plan.features.includes(featureKey);
  }, [plan]);

  const status = subscription?.status || user?.subscription_status || "none";
  const trialEndsAt = subscription?.trial_end || user?.trial_ends_at || null;

  return { loading, user, plan, subscription, status, trialEndsAt, hasFeature };
}
