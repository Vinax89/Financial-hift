import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { X, Calculator, Plus, Minus, DollarSign } from 'lucide-react';
import { formatCurrency, calculateTaxes } from '../utils/calculations';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PaycheckProjector = ({ shifts, recentTransactions, onClose }) => {
    const [shiftRules] = useLocalStorage('shift-rules', [{
        name: 'Default Rule',
        base_hourly_rate: 35,
        overtime_threshold: 40,
        overtime_multiplier: 1.5,
        tax_settings: { filing_status: 'single', state: 'CA' }
    }]);

    const [extraHours, setExtraHours] = useState(0);
    const [projectedShifts, setProjectedShifts] = useState(2);
    const [shiftHours, setShiftHours] = useState(8);

    const projectedPay = useMemo(() => {
        const activeRule = shiftRules[0];
        if (!activeRule) return null;

        const regularHours = projectedShifts * shiftHours;
        const totalHours = regularHours + extraHours;
        const overtimeHours = Math.max(0, totalHours - activeRule.overtime_threshold);
        const regularPayHours = totalHours - overtimeHours;

        const regularPay = regularPayHours * activeRule.base_hourly_rate;
        const overtimePay = overtimeHours * activeRule.base_hourly_rate * activeRule.overtime_multiplier;
        const grossPay = regularPay + overtimePay;

        const taxDetails = calculateTaxes(grossPay * 26, activeRule.tax_settings); // Annual projection
        const weeklyNet = taxDetails.net / 52;
        const weeklyTax = taxDetails.total_tax / 52;

        return {
            gross: grossPay,
            net: weeklyNet,
            taxes: weeklyTax,
            regularHours: regularPayHours,
            overtimeHours,
            hourlyRate: activeRule.base_hourly_rate
        };
    }, [shiftRules, extraHours, projectedShifts, shiftHours]);

    const historicalAverage = useMemo(() => {
        const recentShifts = shifts.slice(0, 8);
        if (recentShifts.length === 0) return null;

        const avgGross = recentShifts.reduce((sum, s) => sum + (s.gross_pay || 0), 0) / recentShifts.length;
        const avgNet = recentShifts.reduce((sum, s) => sum + (s.net_pay || 0), 0) / recentShifts.length;
        const avgHours = recentShifts.reduce((sum, s) => sum + (s.actual_hours || s.scheduled_hours || 0), 0) / recentShifts.length;

        return { avgGross, avgNet, avgHours };
    }, [shifts]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <Card className="w-full max-w-2xl relative animate-in fade-in-0 zoom-in-95">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Paycheck Projector
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Projected Shifts</Label>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" onClick={() => setProjectedShifts(p => Math.max(0, p - 1))}>
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <Input 
                                    type="number" 
                                    value={projectedShifts} 
                                    onChange={e => setProjectedShifts(parseInt(e.target.value) || 0)} 
                                    className="text-center"
                                />
                                <Button size="icon" variant="outline" onClick={() => setProjectedShifts(p => p + 1)}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Hours per Shift</Label>
                            <Input 
                                type="number" 
                                value={shiftHours} 
                                onChange={e => setShiftHours(parseFloat(e.target.value) || 8)} 
                                min="1" 
                                max="16"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Extra Hours</Label>
                            <Input 
                                type="number" 
                                value={extraHours} 
                                onChange={e => setExtraHours(parseFloat(e.target.value) || 0)} 
                                min="0"
                            />
                        </div>
                    </div>

                    {projectedPay && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-blue-900 mb-3">Projected Pay</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Regular Hours:</span>
                                            <span>{projectedPay.regularHours}h @ {formatCurrency(projectedPay.hourlyRate)}/hr</span>
                                        </div>
                                        {projectedPay.overtimeHours > 0 && (
                                            <div className="flex justify-between">
                                                <span>Overtime Hours:</span>
                                                <span>{projectedPay.overtimeHours}h @ {formatCurrency(projectedPay.hourlyRate * 1.5)}/hr</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2 flex justify-between font-semibold">
                                            <span>Gross Pay:</span>
                                            <span className="text-blue-600">{formatCurrency(projectedPay.gross)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Est. Taxes:</span>
                                            <span>-{formatCurrency(projectedPay.taxes)}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                            <span>Net Pay:</span>
                                            <span className="text-emerald-600">{formatCurrency(projectedPay.net)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {historicalAverage && (
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-slate-900 mb-3">Recent Average</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Avg Hours:</span>
                                                <span>{historicalAverage.avgHours.toFixed(1)}h</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Avg Gross:</span>
                                                <span>{formatCurrency(historicalAverage.avgGross)}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold">
                                                <span>Avg Net:</span>
                                                <span className="text-slate-700">{formatCurrency(historicalAverage.avgNet)}</span>
                                            </div>
                                            <div className="mt-3 p-2 bg-white rounded border">
                                                <div className="text-xs text-slate-600">Difference from projection:</div>
                                                <div className={`font-semibold ${projectedPay.net > historicalAverage.avgNet ? 'text-green-600' : 'text-red-600'}`}>
                                                    {projectedPay.net > historicalAverage.avgNet ? '+' : ''}
                                                    {formatCurrency(projectedPay.net - historicalAverage.avgNet)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <div className="w-full p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="text-sm text-amber-800">
                            <strong>Note:</strong> Tax calculations are estimates. Actual withholdings may vary based on your specific tax situation, benefits, and other deductions.
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaycheckProjector;