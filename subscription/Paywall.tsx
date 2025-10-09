/**
 * @fileoverview Subscription paywall component
 * @description Displays available subscription plans with trial options,
 * feature lists, and upgrade prompts for locked features
 */

import React, { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Separator } from "@/ui/separator";
import { Check, Crown, Rocket } from "lucide-react";
import { Plan } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { User } from "@/api/entities";
import useSubscription from "./useSubscription";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * Paywall Component
 * @component
 * @param {Object} props
 * @param {string} [props.featureKey="pro_feature"] - Feature identifier for tracking
 * @param {string} [props.title="Unlock Pro Features"] - Paywall title
 * @param {string} [props.description="Upgrade to access this feature."] - Description text
 * @returns {JSX.Element}
 */
interface PaywallProps { [key: string]: any; }


function Paywall({ featureKey = "pro_feature", title = "Unlock Pro Features", description = "Upgrade to access this feature." }: PaywallProps) {
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useSubscription();

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await Plan.filter({ is_active: true });
        // Show non-free plans first
        const sorted = (all || []).sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));
        setPlans(sorted);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startTrial = async (plan) => {
    const now = new Date();
    const trialDays = plan?.trial_days ?? 14;
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const sub = await Subscription.create({
      plan_slug: plan.slug,
      status: trialDays > 0 ? "trialing" : "active",
      started_at: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
      trial_end: trialDays > 0 ? trialEnd.toISOString() : undefined,
      source: "manual"
    });
    await User.updateMyUserData({
      plan_slug: plan.slug,
      subscription_status: trialDays > 0 ? "trialing" : "active",
      trial_ends_at: trialDays > 0 ? trialEnd.toISOString() : null
    });
    // Simple refresh
    if (typeof window !== "undefined") window.location.reload();
    return sub;
  };

  return (
    <div className="w-full">
      <Card className="border bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!loading && plans.length > 0 ? plans.map((p) => (
              <Card key={p.slug} className="border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    {p.slug !== "free" && <Badge>Pro</Badge>}
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {p.price_monthly > 0 ? `$${p.price_monthly}/mo` : "Free"}
                  </div>
                  {p.price_annual > 0 && (
                    <div className="text-xs text-muted-foreground">or ${p.price_annual}/yr</div>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="space-y-2">
                    {(p.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {p.slug === "free" ? (
                    <Link to={createPageUrl("Pricing")}>
                      <Button variant="outline">View plans</Button>
                    </Link>
                  ) : (
                    <Button onClick={() => startTrial(p)} className="gap-2">
                      <Rocket className="h-4 w-4" /> Start {p.trial_days || 14}-day trial
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )) : (
              <div className="text-sm text-muted-foreground">Loading plans…</div>
            )}
          </div>
          <Separator className="my-6" />
          <div className="text-xs text-muted-foreground">
            Signed in as: {user?.email || "guest"} • You can cancel anytime during trial.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(Paywall);
