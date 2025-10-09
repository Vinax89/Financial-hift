/**
 * @fileoverview Safe-to-spend forecast component showing discretionary income
 * @description Displays projected net income, fixed bills, and safe-to-spend amount
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Wallet, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/ui/skeleton';

/**
 * Format amount as USD currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

/**
 * Safe-to-spend forecast component
 * @param {Object} props - Component props
 * @param {number} props.netCashflow - Current month's net cashflow
 * @param {Array<Object>} props.forecasts - Cashflow forecasts
 * @returns {JSX.Element} Safe-to-spend card
 */
function SafeToSpend({ netCashflow, forecasts }) {
    const latestForecast = forecasts[0];

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Safe-to-Spend Forecast
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center mb-6">
                    <p className="text-sm text-slate-600 mb-1">Estimated Discretionary Income</p>
                    {latestForecast ? (
                        <h3 className="text-4xl font-bold text-emerald-600">
                            {formatCurrency(latestForecast.safe_to_spend || 0)}
                        </h3>
                    ) : (
                        <Skeleton className="h-10 w-40 mx-auto" />
                    )}
                    <p className="text-xs text-slate-500 mt-1">for this pay period</p>
                </div>
                <div className="space-y-3 text-sm">
                     <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-600">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Projected Net Income
                        </span>
                        {latestForecast ? (
                            <span className="font-semibold text-slate-800">{formatCurrency(latestForecast.projected_net || 0)}</span>
                        ) : (
                            <Skeleton className="h-4 w-16" />
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-600">
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                            Total Fixed Bills
                        </span>
                        {latestForecast ? (
                             <span className="font-semibold text-slate-800">{formatCurrency(latestForecast.total_bills || 0)}</span>
                        ) : (
                            <Skeleton className="h-4 w-16" />
                        )}
                    </div>
                     <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <span className="flex items-center gap-2 text-slate-600 font-bold">
                            <Wallet className="h-4 w-4 text-blue-500" />
                            This Month's Net
                        </span>
                        {netCashflow !== null ? (
                             <span className={`font-bold ${netCashflow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {formatCurrency(netCashflow)}
                            </span>
                        ) : (
                            <Skeleton className="h-4 w-16" />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default React.memo(SafeToSpend);