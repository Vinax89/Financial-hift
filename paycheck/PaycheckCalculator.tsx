
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Calculator, DollarSign, Percent, Loader2 } from 'lucide-react';
import { PaycheckSettings } from '@/api/entities';
import { useToast } from '@/ui/use-toast';
import { Switch } from '@/ui/switch';
import { computeTaxBurden } from "@/api/functions";
import { logError } from '@/utils/logger';

// A mock calculation function - replace with a real one if available
const mockCalculatePaycheck = (settings) => {
    const grossPay = (settings.hourly_rate * settings.hours_per_week) * 2; // Assuming biweekly
    const federalTax = grossPay * 0.15;
    const stateTax = grossPay * 0.05;
    const socialSecurity = grossPay * 0.062;
    const medicare = grossPay * 0.0145;
    const addlMedicare = 0; // ignored in mock for simplicity
    const totalPayroll = socialSecurity + medicare + addlMedicare;
    const totalTaxes = federalTax + stateTax + totalPayroll;
    const totalDeductions = (settings.pre_tax_deductions || 0) + (settings.post_tax_deductions || 0);
    const netPay = grossPay - totalTaxes - totalDeductions;
    return {
        grossPay,
        netPay,
        totalTaxes,
        totalDeductions,
        taxBreakdown: {
            federal_income_tax: federalTax,
            state_income_tax: stateTax,
            local_income_tax: 0,
            social_security: socialSecurity,
            medicare: medicare,
            additional_medicare: addlMedicare,
            payroll_total: totalPayroll
        },
        standardDeductions: { federal: 0, state: 0 }
    };
};

interface PaycheckCalculatorProps {
  income?: number;
  refreshData?: () => void;
}

export default function PaycheckCalculator() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<any>(null);
    const [calculation, setCalculation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [useZipTaxes, setUseZipTaxes] = useState(false);
    const [zipCode, setZipCode] = useState("");
    const [taxYear, setTaxYear] = useState(new Date().getFullYear());
    const [isComputing, setIsComputing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const data = await PaycheckSettings.list();
                if (data.length > 0) {
                    setSettings(data[0]);
                } else {
                    setSettings({
                        hourly_rate: 35,
                        hours_per_week: 40,
                        pay_frequency: "biweekly",
                        filing_status: "single",
                        pre_tax_deductions: 0,
                        post_tax_deductions: 0,
                    });
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to load paycheck settings.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, [toast]);

    const periodsPerYear = (freq) => {
        switch (freq) {
            case "weekly": return 52;
            case "biweekly": return 26;
            case "semimonthly": return 24;
            case "monthly": return 12;
            default: return 26; // Default to biweekly if unknown
        }
    };

    const grossForFrequency = (s) => {
        const hpw = s.hours_per_week || 40;
        const hr = s.hourly_rate || 0;
        switch (s.pay_frequency) {
            case "weekly": return hr * hpw;
            case "biweekly": return hr * hpw * 2;
            case "semimonthly": return (hr * hpw * 52) / 24;
            case "monthly": return (hr * hpw * 52) / 12;
            default: return hr * hpw * 2; // Default to biweekly if unknown
        }
    };

    const handleCalculate = async () => {
        if (!settings) return;
        setCalculation(null); // Clear previous calculation
        setIsComputing(true);

        if (!useZipTaxes) {
            const result = mockCalculatePaycheck(settings);
            setCalculation(result);
            setIsComputing(false);
            return;
        }

        if (!zipCode || zipCode.length !== 5 || !taxYear) {
            toast({ title: "ZIP and year required", description: "Please enter a valid 5-digit ZIP code and a tax year.", variant: "destructive" });
            setIsComputing(false);
            return;
        }

        try {
            const perPeriodGross = grossForFrequency(settings);
            const annualGross = perPeriodGross * periodsPerYear(settings.pay_frequency);

            const response = await computeTaxBurden({
                zip_code: zipCode,
                annual_income: annualGross,
                filing_status: settings.filing_status || "single",
                year: Number(taxYear)
            });

            if (response.error || !response.data) {
                toast({ title: "Tax data error", description: response.error || "Failed to retrieve tax data.", variant: "destructive" });
                setIsComputing(false);
                return;
            }

            const data = response.data;

            const totalAnnualTaxes =
                (data.breakdown?.federal_income_tax || 0) +
                (data.breakdown?.state_income_tax || 0) +
                (data.breakdown?.local_income_tax || 0) +
                (data.breakdown?.payroll_taxes?.total || 0);

            const per = periodsPerYear(settings.pay_frequency);
            const perPeriodTaxes = totalAnnualTaxes / per;
            const totalDeductions = (settings.pre_tax_deductions || 0) + (settings.post_tax_deductions || 0);
            const netPay = perPeriodGross - perPeriodTaxes - totalDeductions;

            // Build per-paycheck breakdown
            const ss = (data.breakdown?.payroll_taxes?.social_security || 0) / per;
            const med = (data.breakdown?.payroll_taxes?.medicare || 0) / per;
            const addl = (data.breakdown?.payroll_taxes?.additional_medicare || 0) / per;

            setCalculation({
                grossPay: perPeriodGross,
                netPay,
                totalTaxes: perPeriodTaxes,
                totalDeductions,
                taxBreakdown: {
                    federal_income_tax: (data.breakdown?.federal_income_tax || 0) / per,
                    state_income_tax: (data.breakdown?.state_income_tax || 0) / per,
                    local_income_tax: (data.breakdown?.local_income_tax || 0) / per,
                    social_security: ss,
                    medicare: med,
                    additional_medicare: addl,
                    payroll_total: (data.breakdown?.payroll_taxes?.total || 0) / per
                },
                standardDeductions: {
                    federal: data.standard_deductions?.federal || 0,
                    state: data.standard_deductions?.state || 0
                },
                annualBreakdown: data.breakdown // keep full annual for potential future views
            });
        } catch (error) {
            logError("Compute tax burden error", error);
            toast({ title: "Error", description: "Failed to compute zip-aware taxes. Please check your inputs.", variant: "destructive" });
        } finally {
            setIsComputing(false);
        }
    };

    const handleSave = async () => {
        try {
            if (settings.id) {
                await PaycheckSettings.update(settings.id, settings);
            } else {
                const newSettings = await PaycheckSettings.create(settings);
                setSettings(newSettings);
            }
            toast({ title: "Success", description: "Settings saved." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <Calculator className="h-5 w-5 text-primary" />
                    Paycheck Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Fields */}
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
                        <h3 className="font-semibold text-foreground">Your Pay Details</h3>
                        <div className="space-y-2">
                            <Label htmlFor="hourly_rate">Hourly Rate</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="hourly_rate"
                                    type="number"
                                    value={settings.hourly_rate}
                                    onChange={e => setSettings({...settings, hourly_rate: parseFloat(e.target.value) || 0})}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hours_per_week">Hours Per Week</Label>
                            <Input
                                id="hours_per_week"
                                type="number"
                                value={settings.hours_per_week}
                                onChange={e => setSettings({...settings, hours_per_week: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pay_frequency">Pay Frequency</Label>
                            <Select value={settings.pay_frequency} onValueChange={value => setSettings({...settings, pay_frequency: value})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                    <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filing_status">Filing Status</Label>
                            <Select value={settings.filing_status} onValueChange={value => setSettings({...settings, filing_status: value})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">Single</SelectItem>
                                    <SelectItem value="married_filing_jointly">Married Filing Jointly</SelectItem>
                                    <SelectItem value="married_filing_separately">Married Filing Separately</SelectItem>
                                    <SelectItem value="head_of_household">Head of Household</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pre_tax_deductions">Pre-tax Deductions</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="pre_tax_deductions"
                                    type="number"
                                    value={settings.pre_tax_deductions}
                                    onChange={e => setSettings({...settings, pre_tax_deductions: parseFloat(e.target.value) || 0})}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="post_tax_deductions">Post-tax Deductions</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="post_tax_deductions"
                                    type="number"
                                    value={settings.post_tax_deductions}
                                    onChange={e => setSettings({...settings, post_tax_deductions: parseFloat(e.target.value) || 0})}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="useZip">Use zip-aware official tax rates</Label>
                            <div className="flex items-center gap-3">
                                <Switch id="useZip" checked={useZipTaxes} onCheckedChange={setUseZipTaxes} />
                                <Input
                                    placeholder="ZIP code (e.g., 10001)"
                                    value={zipCode}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZipCode(e.target.value.trim().substring(0, 5))}
                                    disabled={!useZipTaxes}
                                    className="max-w-[160px]"
                                    maxLength={5}
                                />
                                <Input
                                    placeholder="Year"
                                    type="number"
                                    value={taxYear}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaxYear(e.target.value)}
                                    disabled={!useZipTaxes}
                                    className="max-w-[100px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calculation Results */}
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
                        <h3 className="font-semibold text-foreground">Estimated Paycheck</h3>
                        {calculation ? (
                            <>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline p-3 bg-muted rounded-md">
                                        <span className="text-muted-foreground">Gross Pay</span>
                                        <span className="font-bold text-lg text-foreground">${calculation.grossPay.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between p-2">
                                        <span className="text-muted-foreground">Taxes</span>
                                        <span className="font-medium text-destructive">
                                            {isComputing ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : `-$${calculation.totalTaxes.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-2">
                                        <span className="text-muted-foreground">Deductions</span>
                                        <span className="font-medium text-destructive">-${calculation.totalDeductions.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                                        <span className="font-semibold">Net Pay (Take-Home)</span>
                                        <span className="font-bold text-xl">${calculation.netPay.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Detailed breakdown toggle */}
                                <div className="pt-2">
                                    <Button variant="outline" size="sm" onClick={() => setShowDetails(v => !v)}>
                                        {showDetails ? "Hide" : "Show"} Detailed Tax Breakdown
                                    </Button>
                                </div>

                                {showDetails && calculation.taxBreakdown && (
                                    <div className="mt-3 border-t border-border pt-3">
                                        <h4 className="text-sm font-semibold text-foreground mb-2">Per-Paycheck Tax Breakdown</h4>
                                        <ul className="text-sm space-y-1">
                                            <li className="flex justify-between">
                                                <span>Federal Income Tax</span>
                                                <span>${calculation.taxBreakdown.federal_income_tax.toFixed(2)}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>State Income Tax</span>
                                                <span>${calculation.taxBreakdown.state_income_tax.toFixed(2)}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Local Income Tax</span>
                                                <span>${calculation.taxBreakdown.local_income_tax.toFixed(2)}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Social Security (FICA)</span>
                                                <span>${calculation.taxBreakdown.social_security.toFixed(2)}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Medicare</span>
                                                <span>${calculation.taxBreakdown.medicare.toFixed(2)}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Additional Medicare</span>
                                                <span>${calculation.taxBreakdown.additional_medicare.toFixed(2)}</span>
                                            </li>
                                            <li className="flex justify-between font-medium pt-1 border-t border-border/60 mt-1">
                                                <span>FICA Total</span>
                                                <span>${calculation.taxBreakdown.payroll_total.toFixed(2)}</span>
                                            </li>
                                        </ul>

                                        {/* Standard deductions info (annual) */}
                                        {(calculation.standardDeductions?.federal || calculation.standardDeductions?.state) && (
                                            <div className="mt-3 text-xs text-muted-foreground">
                                                <div>Standard Deduction (annual) used in calc:</div>
                                                <div>• Federal: ${Number(calculation.standardDeductions.federal || 0).toFixed(0)}</div>
                                                <div>• State: ${Number(calculation.standardDeductions.state || 0).toFixed(0)}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                {isComputing ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> : "Click 'Calculate' to see your estimate."}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleCalculate} className="flex-1" disabled={isComputing}>
                        {isComputing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Calculate
                    </Button>
                    <Button onClick={handleSave} variant="outline" className="flex-1">Save Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}
