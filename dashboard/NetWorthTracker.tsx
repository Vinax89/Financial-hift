/**
 * @fileoverview Net worth tracking and visualization component (TypeScript)
 * @description Displays total net worth with historical trends, asset breakdown,
 * and interactive charts for investments, savings, and liabilities
 */

import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Progress } from '@/ui/progress.jsx';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Legend, Pie } from 'recharts';
import type { Goal, Debt } from '@/types/entities';

/**
 * Investment account interface
 */
interface Investment {
    id: string;
    name?: string;
    current_value?: number;
    type?: string;
}

/**
 * Historical data point for net worth tracking
 */
interface HistoricalDataPoint {
    month: string;
    netWorth: number;
    assets: number;
    liabilities: number;
}

/**
 * Asset breakdown item
 */
interface AssetBreakdownItem {
    name: string;
    value: number;
    color: string;
}

/**
 * Computed net worth data
 */
interface NetWorthData {
    totalInvestments: number;
    totalSavings: number;
    totalDebt: number;
    assets: number;
    liabilities: number;
    netWorth: number;
    historicalData: HistoricalDataPoint[];
    assetBreakdown: AssetBreakdownItem[];
}

/**
 * Props for NetWorthTracker component
 */
interface NetWorthTrackerProps {
    /** List of investment accounts */
    investments: Investment[];
    /** List of debt accounts */
    debts: Debt[];
    /** List of savings goals */
    goals: Goal[];
}

/** Color palette for pie chart segments */
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * Net Worth Tracker Component
 * 
 * Displays comprehensive net worth information including:
 * - Current total net worth (assets - liabilities)
 * - 12-month historical trend line chart
 * - Asset breakdown pie chart
 * - Quick action buttons for adding investments and goals
 * 
 * @component
 * @param {NetWorthTrackerProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
function NetWorthTracker({ investments, debts, goals }: NetWorthTrackerProps): JSX.Element {
    const netWorthData = useMemo<NetWorthData>(() => {
        const totalInvestments = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
        const totalSavings = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
        const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
        
        const assets = totalInvestments + totalSavings;
        const liabilities = totalDebt;
        const netWorth = assets - liabilities;

        // Simulate historical data (in a real app, this would come from stored snapshots)
        const historicalData: HistoricalDataPoint[] = Array.from({ length: 12 }, (_, i) => {
            const monthsAgo = 11 - i;
            const date = new Date();
            date.setMonth(date.getMonth() - monthsAgo);
            
            return {
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                netWorth: netWorth * (0.8 + (i * 0.02)) + (Math.random() - 0.5) * 1000,
                assets: assets * (0.85 + (i * 0.015)),
                liabilities: liabilities * (1.1 - (i * 0.01))
            };
        });

        const assetBreakdown: AssetBreakdownItem[] = [
            { name: 'Investments', value: totalInvestments, color: '#10b981' },
            { name: 'Savings Goals', value: totalSavings, color: '#3b82f6' },
            { name: 'Cash', value: Math.max(0, netWorth * 0.1), color: '#f59e0b' }
        ].filter(item => item.value > 0);

        return {
            totalInvestments,
            totalSavings,
            totalDebt,
            assets,
            liabilities,
            netWorth,
            historicalData,
            assetBreakdown
        };
    }, [investments, debts, goals]);

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Net Worth Tracker
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Net Worth */}
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className={`text-3xl font-bold ${netWorthData.netWorth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(netWorthData.netWorth)}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">Total Net Worth</p>
                    <div className="flex justify-center items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Assets: {formatCurrency(netWorthData.assets)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">Liabilities: {formatCurrency(netWorthData.liabilities)}</span>
                        </div>
                    </div>
                </div>

                {/* Historical Trend */}
                <div>
                    <h4 className="font-medium text-slate-900 mb-3">12-Month Trend</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={netWorthData.historicalData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value: number) => formatCurrency(value)} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Line type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Asset Breakdown */}
                {netWorthData.assetBreakdown.length > 0 && (
                    <div>
                        <h4 className="font-medium text-slate-900 mb-3">Asset Breakdown</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={netWorthData.assetBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {netWorthData.assetBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {netWorthData.assetBreakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors">
                        Add Investment
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors">
                        Set Goal
                    </button>
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors">
                        View Details
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

export default memo(NetWorthTracker);
