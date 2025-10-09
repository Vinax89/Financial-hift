import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Check, Crown, Rocket } from "lucide-react";
import { Plan } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { User } from "@/api/entities";

export default function Pricing() {
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await Plan.filter({ is_active: true });
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

    await Subscription.create({
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
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-primary font-semibold">
            <Crown className="h-5 w-5" /> Financial Shift Plans
          </div>
          <h1 className="text-3xl font-bold">Choose the plan that fits</h1>
          <p className="text-muted-foreground">Simple pricing. Free trial. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <Card className="p-8 text-muted-foreground">Loading plans…</Card>
          ) : plans.map((p) => (
            <Card key={p.slug} className={`border ${p.slug === "pro" ? "ring-2 ring-primary" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  {p.slug !== "free" && <Badge>Popular</Badge>}
                </div>
                <div className="text-3xl font-bold mt-2">
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
              <CardFooter>
                {p.slug === "free" ? (
                  <Button variant="outline">Included</Button>
                ) : (
                  <Button onClick={() => startTrial(p)} className="w-full gap-2">
                    <Rocket className="h-4 w-4" /> Start {p.trial_days || 14}-day trial
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}