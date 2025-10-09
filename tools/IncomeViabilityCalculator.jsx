import React from "react";
import useSubscription from "@/subscription/useSubscription";
import Paywall from "@/subscription/Paywall";
import IncomeViabilityCalculatorInner from "./IncomeViabilityCalculatorInner";

export default function IncomeViabilityCalculator(props) {
  const { loading, hasFeature } = useSubscription();

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Checking subscription…</div>;
  }
  if (!hasFeature("income_viability")) {
    return <Paywall featureKey="income_viability" title="Income Viability is a Pro feature" description="Upgrade to Pro to analyze your income viability and plan actions." />;
  }

  return <IncomeViabilityCalculatorInner {...props} />;
}