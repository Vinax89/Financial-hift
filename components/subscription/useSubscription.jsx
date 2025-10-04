import React from "react";
import { User } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { Plan } from "@/api/entities";

const DEFAULT_FREE_PLAN = {
  name: "Free",
  slug: "free",
  currency: "USD",
  price_monthly: 0,
  price_annual: 0,
  trial_days: 0,
  features: ["perf_inspector", "network_monitor"],
  limits: { },
  is_active: true
};

export default function useSubscription() {
  const [user, setUser] = React.useState(null);
  const [plan, setPlan] = React.useState(DEFAULT_FREE_PLAN);
  const [subscription, setSubscription] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

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

  const hasFeature = React.useCallback((featureKey) => {
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