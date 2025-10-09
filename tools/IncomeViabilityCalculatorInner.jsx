import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Loader2, DollarSign, Scale, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Copy, Shuffle } from 'lucide-react';
import { getTaxAndCostOfLiving } from '@/api/functions';
import { useToast } from "@/ui/use-toast";
import { agentSDK } from '@/agents';
import { formatCurrency } from '@/utils/calculations';
import useGamification from '@/hooks/useGamification';
import ViabilityInputs from '@/tools/income-viability/ViabilityInputs';
import ViabilityCharts from '@/tools/income-viability/ViabilityCharts';
import ScenarioList from '@/tools/income-viability/ScenarioList';

export default function IncomeViabilityCalculatorInner(props) {
  const { debts = [] } = props;

  const [zipCode, setZipCode] = React.useState('');
  const [grossIncome, setGrossIncome] = React.useState('');
  const [filingStatus, setFilingStatus] = React.useState('single');
  const [year, setYear] = React.useState(String(new Date().getFullYear()));
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const [compareMode, setCompareMode] = React.useState(false);
  const [zipCodeB, setZipCodeB] = React.useState('');
  const [grossIncomeB, setGrossIncomeB] = React.useState('');
  const [filingStatusB, setFilingStatusB] = React.useState('single');
  const [yearB, setYearB] = React.useState(String(new Date().getFullYear()));
  const [resultsB, setResultsB] = React.useState(null);
  const [monthlyView, setMonthlyView] = React.useState(false);

  const [includeDebt, setIncludeDebt] = React.useState(false);
  const [useCustomDebt, setUseCustomDebt] = React.useState(false);
  const [customMonthlyDebt, setCustomMonthlyDebt] = React.useState('');

  const autoMonthlyDebt = React.useMemo(() => {
    if (!Array.isArray(debts) || debts.length === 0) return 0;
    return debts
      .filter(d => (d?.status || 'active') === 'active')
      .reduce((sum, d) => sum + (Number(d?.minimum_payment) || 0), 0);
  }, [debts]);

  const computedMonthlyDebt = includeDebt ? (useCustomDebt ? (parseFloat(customMonthlyDebt) || 0) : autoMonthlyDebt) : 0;
  const computedAnnualDebt = computedMonthlyDebt * 12;

  const { toast } = useToast();
  const { trackAction } = useGamification();

  const validateInputs = (zip, income) => {
    if (!zip || !income) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter a zip code and gross income." });
      return false;
    }
    const num = parseFloat(income);
    if (isNaN(num) || num <= 0 || num > 10000000) {
      toast({ variant: "destructive", title: "Invalid Income", description: "Please enter a valid income amount." });
      return false;
    }
    return true;
  };

  const computeOne = async ({ zip, income, filing, y, debtAnnual }) => {
    const response = await getTaxAndCostOfLiving({
      zip_code: zip,
      gross_income: parseFloat(income),
      filing_status: filing,
      year: Number(y)
    });
    if (response.error) {
      throw new Error(response.error);
    }
    const data = response.data;

    const taxBurden = parseFloat(income) * (data.tax_rates.total / 100);
    const costOfLiving = data.cost_of_living.total_annual;
    const debtBurden = Math.max(0, Number(debtAnnual) || 0);
    const viableIncome = parseFloat(income) - taxBurden - costOfLiving - debtBurden;
    const viabilityRatio = parseFloat(income) > 0 ? (viableIncome / parseFloat(income)) * 100 : 0;

    const monthlyViable = viableIncome / 12;
    const monthlyCostOfLiving = costOfLiving / 12;
    const monthlyTaxBurden = taxBurden / 12;
    const monthlyDebtBurden = debtBurden / 12;

    let viabilityStatus = 'excellent';
    let statusColor = 'text-emerald-600 dark:text-emerald-400';
    let statusBg = 'bg-emerald-500/10 border border-emerald-500/20';
    let statusIcon = CheckCircle;

    if (viabilityRatio < 0) {
      viabilityStatus = 'not viable';
      statusColor = 'text-destructive';
      statusBg = 'bg-destructive/10 border border-destructive/20';
      statusIcon = AlertTriangle;
    } else if (viabilityRatio < 10) {
      viabilityStatus = 'challenging';
      statusColor = 'text-amber-600 dark:text-amber-400';
      statusBg = 'bg-amber-500/10 border border-amber-500/20';
      statusIcon = AlertTriangle;
    } else if (viabilityRatio < 20) {
      viabilityStatus = 'tight';
      statusColor = 'text-amber-600 dark:text-amber-400';
      statusBg = 'bg-amber-500/10 border border-amber-500/20';
      statusIcon = AlertTriangle;
    } else if (viabilityRatio < 30) {
      viabilityStatus = 'moderate';
      statusColor = 'text-primary';
      statusBg = 'bg-primary/10 border border-primary/20';
      statusIcon = TrendingUp;
    }

    return {
      ...data,
      taxBurden,
      viableIncome,
      income: parseFloat(income),
      viabilityRatio,
      monthlyViable,
      monthlyCostOfLiving,
      monthlyTaxBurden,
      monthlyDebtBurden,
      debtBurdenAnnual: debtBurden,
      viabilityStatus,
      statusColor,
      statusBg,
      statusIcon,
      inputZipCode: zip,
      inputGrossIncome: income,
      inputFilingStatus: filing,
      inputYear: y
    };
  };

  const handleCalculate = async () => {
    if (!validateInputs(zipCode, grossIncome)) return;

    setIsLoading(true);
    setResults(null);
    setResultsB(null);

    try {
      const scenarioAPromise = computeOne({
        zip: zipCode,
        income: grossIncome,
        filing: filingStatus,
        y: year,
        debtAnnual: computedAnnualDebt
      });

      let scenarioBPromise = Promise.resolve(null);
      if (compareMode) {
        if (!validateInputs(zipCodeB, grossIncomeB)) {
          setIsLoading(false);
          return;
        }
        scenarioBPromise = computeOne({
          zip: zipCodeB,
          income: grossIncomeB,
          filing: filingStatusB,
          y: yearB,
          debtAnnual: computedAnnualDebt
        });
      }

      const [resA, resB] = await Promise.all([scenarioAPromise, scenarioBPromise]);

      setResults(resA);
      if (resB) {
        setResultsB(resB);
      }

      await trackAction('viability_calc');

      toast({
        title: "Analysis Complete",
        description: `Income viability calculated for ${resA.inputZipCode}${resB ? ` and ${resB.inputZipCode}` : ""}`
      });

    } catch (err) {
      console.error('Income viability calculation failed:', err);
      toast({
        variant: "destructive",
        title: "Calculation Failed",
        description: err.message || "Unable to calculate income viability. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = () => {
    if (!results) return;

    const isMonthly = monthlyView;
    const annualToMonthly = (val) => val / 12;
    const getLabel = (annualLabel, monthlyLabel) => isMonthly ? monthlyLabel : annualLabel;

    const getSummaryLines = (data, isMonthlyView) => {
      const annualIncome = data.income;
      const annualDebtBurden = data.debtBurdenAnnual || 0;
      const annualTaxBurden = data.taxBurden;
      const annualCostOfLiving = data.cost_of_living?.total_annual || 0;
      const annualViableIncome = data.viableIncome;

      const currentIncome = isMonthlyView ? annualToMonthly(annualIncome) : annualIncome;
      const currentDebtBurden = isMonthlyView ? annualToMonthly(annualDebtBurden) : annualDebtBurden;
      const currentTaxBurden = isMonthlyView ? annualToMonthly(annualTaxBurden) : annualTaxBurden;
      const currentCostOfLiving = isMonthlyView ? annualToMonthly(annualCostOfLiving) : annualCostOfLiving;
      const currentViableIncome = isMonthlyView ? annualToMonthly(annualViableIncome) : annualViableIncome;

      const debtPercentageOfAnnualIncome = annualIncome ? (annualDebtBurden / annualIncome * 100).toFixed(1) : "0";
      const taxPercentageOfAnnualIncome = annualIncome ? (annualTaxBurden / annualIncome * 100).toFixed(1) : "?";
      const viabilityPercentageOfAnnualIncome = (data?.viabilityRatio || 0).toFixed(1);

      return [
        `Location: ${data?.zip_code || data.inputZipCode} (${data?.state_code || ""})`,
        `Filing Status: ${data?.inputFilingStatus} - Year: ${data?.inputYear}`,
        `${getLabel("Annual", "Monthly")} Gross Income: ${formatCurrency(currentIncome)}`,
        `${getLabel("Annual", "Monthly")} Debt Burden (Est.): ${formatCurrency(currentDebtBurden)} (${debtPercentageOfAnnualIncome}%)`,
        `${getLabel("Annual", "Monthly")} Tax Burden (Est.): ${formatCurrency(currentTaxBurden)} (${taxPercentageOfAnnualIncome}%)`,
        `${getLabel("Annual", "Monthly")} Cost of Living (Est.): ${formatCurrency(currentCostOfLiving)}`,
        `${getLabel("Annual", "Monthly")} Disposable Income: ${formatCurrency(currentViableIncome)} (${viabilityPercentageOfAnnualIncome}% of gross income)`,
        `Viability Status: ${data?.viabilityStatus ? data.viabilityStatus.toUpperCase() : ""}`
      ];
    };

    let lines = [`--- Scenario A Summary ---`];
    lines = lines.concat(getSummaryLines(results, isMonthly));

    if (resultsB) {
      lines.push(`\n--- Scenario B Summary ---`);
      lines = lines.concat(getSummaryLines(resultsB, isMonthly));
    }

    navigator.clipboard.writeText(lines.join("\n"));
    toast({ title: "Summary copied", description: "You can paste it anywhere." });
  };

  const askAICoach = async () => {
    if (!results) return;
    const summary = [
      `Income Viability Summary`,
      `Zip: ${results?.inputZipCode || zipCode} | Filing: ${results?.inputFilingStatus || filingStatus} | Year: ${results?.inputYear || year}`,
      `Gross Income: $${Number(results?.income || grossIncome).toLocaleString()}/yr`,
      `Tax Burden: $${Math.round(results?.taxBurden || 0).toLocaleString()}/yr`,
      `Cost of Living: $${Math.round(results?.cost_of_living?.total_annual || 0).toLocaleString()}/yr`,
      `Debt Burden: $${Math.round(results?.debtBurdenAnnual || 0).toLocaleString()}/yr`,
      `Disposable (Net): $${Math.round(results?.viableIncome || 0).toLocaleString()}/yr (${(results?.viabilityRatio || 0).toFixed(1)}%)`,
      `Monthly View — Gross: $${Math.round((results?.income || 0)/12).toLocaleString()}, Tax: $${Math.round((results?.taxBurden || 0)/12).toLocaleString()}, CoL: $${Math.round((results?.cost_of_living?.total_annual || 0)/12).toLocaleString()}, Debt: $${Math.round(results?.monthlyDebtBurden || 0).toLocaleString()}, Net: $${Math.round(results?.monthlyViable || 0).toLocaleString()}`,
      `User intent: Please estimate if picking up extra hours or shifts would improve viability. If shortfall exists, estimate hours needed based on base hourly rate (if known) and suggest the best strategy (e.g., overtime or differentials).`
    ].join("\n");

    const conversation = await agentSDK.createConversation({
      agent_name: "work_coach",
      metadata: {
        name: "Income Viability Coaching",
        description: "Ask the Work Coach for targeted suggestions based on viability."
      }
    });

    await agentSDK.addMessage(conversation, {
      role: "user",
      content: summary
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { detail: { title: "AI Coach engaged", description: "Your viability summary was sent to the Work Coach." }}));
    }
  };

  const StatusIcon = results?.statusIcon || CheckCircle;

  return (
    <Card className="border border-border shadow-lg bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Income Viability Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze whether your income can support a comfortable lifestyle in a specific area
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Scenario A
          </div>
          <ViabilityInputs
            zipCode={zipCode}
            setZipCode={setZipCode}
            grossIncome={grossIncome}
            setGrossIncome={setGrossIncome}
            filingStatus={filingStatus}
            setFilingStatus={setFilingStatus}
            year={year}
            setYear={setYear}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={compareMode} onChange={(e: any) => setCompareMode(e.target.checked)} />
              Compare with another scenario
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={monthlyView} onChange={(e: any) => setMonthlyView(e.target.checked)} />
              Show monthly values
            </label>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={includeDebt}
                  onChange={(e: any) => setIncludeDebt(e.target.checked)}
                />
                Include debt payments in calculation
              </label>

              {includeDebt && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={useCustomDebt}
                      onChange={(e: any) => setUseCustomDebt(e.target.checked)}
                    />
                    Use custom total monthly debt
                  </label>
                  {!useCustomDebt ? (
                    <div className="text-sm text-muted-foreground">
                      Auto from your debts: <span className="font-semibold text-foreground sensitive">{formatCurrency(autoMonthlyDebt)}</span>/mo
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="custom-monthly-debt" className="text-sm text-muted-foreground">Monthly Debt</Label>
                      <Input
                        id="custom-monthly-debt"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g., 1200"
                        value={customMonthlyDebt}
                        onChange={(e: any) => setCustomMonthlyDebt(e.target.value)}
                        className="w-40"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {compareMode && (
          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
              Scenario B
            </div>
            <ViabilityInputs
              zipCode={zipCodeB}
              setZipCode={setZipCodeB}
              grossIncome={grossIncomeB}
              setGrossIncome={setGrossIncomeB}
              filingStatus={filingStatusB}
              setFilingStatus={setFilingStatusB}
              year={yearB}
              setYear={setYearB}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCalculate} disabled={isLoading} className="min-w-[200px]">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Calculating...' : (compareMode ? 'Compare Scenarios' : 'Calculate Income Viability')}
          </Button>
          <Button type="button" variant="outline" onClick={copySummary} disabled={!results}>
            <Copy className="h-4 w-4 mr-2" /> Copy Summary
          </Button>
          <Button type="button" variant="secondary" onClick={askAICoach} disabled={!results}>
            🤖 Ask AI Coach
          </Button>
        </div>

        {results && (
          <div className="space-y-6 pt-4 border-t border-border/60">
            <div className={`p-4 rounded-lg ${results.statusBg}`}>
              <div className="flex items-center gap-3 mb-2">
                <StatusIcon className={`h-6 w-6 ${results.statusColor}`} />
                <div>
                  <h3 className={`font-semibold text-lg ${results.statusColor} capitalize`}>
                    {results.viabilityStatus} Viability
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Based on income analysis for zip code {results?.inputZipCode || zipCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center border border-border/50">
                <p className="text-sm text-muted-foreground">{monthlyView ? "Monthly Gross Income" : "Annual Gross Income"}</p>
                <p className="font-bold text-xl text-foreground">
                  {formatCurrency(monthlyView ? (results.income / 12) : results.income)}
                </p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg text-center border border-destructive/20">
                <p className="text-sm text-destructive">{monthlyView ? "Monthly Tax Burden" : "Tax Burden (Est.)"}</p>
                <p className="font-bold text-xl text-destructive">
                  {formatCurrency(monthlyView ? results.monthlyTaxBurden : results.taxBurden)}
                </p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-lg text-center border border-amber-500/20">
                <p className="text-sm text-amber-600 dark:text-amber-400">{monthlyView ? "Monthly Cost of Living" : "Cost of Living (Est.)"}</p>
                <p className="font-bold text-xl text-amber-600 dark:text-amber-400">
                  {formatCurrency(monthlyView ? results.cost_of_living.total_annual / 12 : results.cost_of_living.total_annual)}
                </p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg text-center border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">{monthlyView ? "Monthly Debt Burden" : "Debt Burden (Est.)"}</p>
                <p className="font-bold text-xl text-blue-600 dark:text-blue-400">
                  {formatCurrency(monthlyView ? (results.monthlyDebtBurden || 0) : (results.debtBurdenAnnual || 0))}
                </p>
              </div>
            </div>

            <div className={`${results.viableIncome > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-destructive/10 border-destructive/20'} text-center p-6 rounded-lg border`}>
              <p className="font-semibold text-lg mb-2 text-foreground">Disposable Income After Taxes, Cost of Living & Debt</p>
              <p className={`font-bold text-3xl mb-1 ${results.viableIncome > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {formatCurrency(monthlyView ? results.monthlyViable : results.viableIncome)}
              </p>
              <p className={`text-sm ${results.viableIncome > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'} mb-2`}>
                {monthlyView ? `${formatCurrency(results.monthlyViable)}/month` : `${formatCurrency(results.viableIncome)}/year`} • {(results?.viabilityRatio || 0).toFixed(1)}% of gross income
              </p>
              <p className="text-xs text-muted-foreground">
                Available for savings, investments, entertainment, and unexpected expenses
              </p>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Breakdown Charts</span>
              </div>
              <ViabilityCharts results={results} compareResults={resultsB} monthlyView={monthlyView} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Tax Rate Breakdown ({results?.inputYear || year})</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal Tax Rate:</span>
                    <span className="font-medium text-foreground">{results.tax_rates.federal.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State Tax Rate:</span>
                    <span className="font-medium text-foreground">{results.tax_rates.state.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local Tax Rate:</span>
                    <span className="font-medium text-foreground">{results.tax_rates.local.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 font-semibold text-foreground">
                    <span>Total Tax Rate:</span>
                    <span>{results.tax_rates.total.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-foreground">Cost of Living Breakdown ({results?.zip_code || zipCode})</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Housing:</span>
                    <span className="font-medium text-foreground">{formatCurrency(monthlyView ? results.cost_of_living.housing_annual / 12 : results.cost_of_living.housing_annual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Food:</span>
                    <span className="font-medium text-foreground">{formatCurrency(monthlyView ? results.cost_of_living.food_annual / 12 : results.cost_of_living.food_annual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transportation:</span>
                    <span className="font-medium text-foreground">{formatCurrency(monthlyView ? results.cost_of_living.transportation_annual / 12 : results.cost_of_living.transportation_annual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Healthcare:</span>
                    <span className="font-medium text-foreground">{formatCurrency(monthlyView ? results.cost_of_living.healthcare_annual / 12 : results.cost_of_living.healthcare_annual)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 font-semibold text-foreground">
                    <span>Total {monthlyView ? "Monthly" : "Annual"}:</span>
                    <span>{formatCurrency(monthlyView ? results.cost_of_living.total_annual / 12 : results.cost_of_living.total_annual)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Payroll Taxes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social Security (FICA):</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(
                        monthlyView
                          ? (results?.payroll_taxes?.social_security || 0) / 12
                          : (results?.payroll_taxes?.social_security || 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicare:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(
                        monthlyView
                          ? (results?.payroll_taxes?.medicare || 0) / 12
                          : (results?.payroll_taxes?.medicare || 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Additional Medicare:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(
                        monthlyView
                          ? (results?.payroll_taxes?.additional_medicare || 0) / 12
                          : (results?.payroll_taxes?.additional_medicare || 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 font-semibold text-foreground">
                    <span>Total Payroll Taxes:</span>
                    <span>
                      {formatCurrency(
                        monthlyView
                          ? (results?.payroll_taxes?.total || 0) / 12
                          : (results?.payroll_taxes?.total || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Standard Deductions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal Standard Deduction:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(results?.standard_deductions?.federal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State Standard Deduction:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(results?.standard_deductions?.state || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Deductions reduce taxable income for federal/state calculations and are not cash outflows.
                  </p>
                </div>
              </div>
            </div>

            {results.viableIncome < 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-semibold text-destructive mb-2">⚠️ Income Shortfall</h4>
                <p className="text-sm text-destructive/90">
                  Your current income may not be sufficient to cover basic living costs and debt payments in this area.
                  Consider:
                </p>
                <ul className="text-sm text-destructive/90 mt-2 list-disc list-inside space-y-1">
                  <li>Looking for higher-paying positions</li>
                  <li>Considering a different location with lower cost of living</li>
                  <li>Finding additional income sources</li>
                  <li>Reducing discretionary expenses</li>
                  <li>Re-evaluating debt payments</li>
                </ul>
              </div>
            )}

            {results.viableIncome > 0 && results.viabilityRatio < 20 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">💡 Tight Budget</h4>
                <p className="text-sm text-muted-foreground">
                  While viable, you'll have limited financial flexibility after all expenses. Consider building an emergency fund
                  and looking for ways to increase income or reduce costs.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-border/60">
              <h4 className="font-semibold mb-3 text-foreground">Save or Load Scenarios</h4>
              <ScenarioList
                current={{
                  zipCode,
                  grossIncome: parseFloat(grossIncome),
                  filingStatus,
                  year: Number(year)
                }}
                onLoad={(s) => {
                  setZipCode(s.zipCode);
                  setGrossIncome(String(s.grossIncome));
                  setFilingStatus(s.filingStatus);
                  setYear(String(s.year));
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}