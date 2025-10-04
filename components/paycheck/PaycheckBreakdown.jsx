import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileText, HandCoins, Receipt } from 'lucide-react';

export default function PaycheckBreakdown({ calculation }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (!calculation) {
        return (
            <Card className="h-full border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                 <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Your Paycheck Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <FileText className="h-16 w-16 mb-4 text-slate-300" />
                    <p className="font-semibold text-lg">No calculation yet</p>
                    <p>Enter your details and click "Calculate" to see your results.</p>
                </CardContent>
            </Card>
        );
    }
    
    const { grossPay, netPay, totalTaxes, totalDeductions, federalTax, stateTax, socialSecurity, medicare, preTaxDeductions, postTaxDeductions } = calculation;

    const breakdownData = [
        { name: 'Net Pay', value: netPay, color: '#10b981' },
        { name: 'Taxes', value: totalTaxes, color: '#ef4444' },
        { name: 'Deductions', value: totalDeductions, color: '#f97316' },
    ];
    
    const taxData = [
        { name: 'Federal', amount: federalTax },
        { name: 'State', amount: stateTax },
        { name: 'Social Security', amount: socialSecurity },
        { name: 'Medicare', amount: medicare },
    ];

    return (
        <Card className="h-full border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Your Paycheck Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="text-center">
                    <p className="text-slate-600">Take-Home Pay</p>
                    <p className="text-4xl font-bold text-emerald-600">{formatCurrency(netPay)}</p>
                    <p className="text-slate-500 text-sm">out of {formatCurrency(grossPay)} gross</p>
                </div>
                
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={breakdownData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {breakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <HandCoins className="h-4 w-4" />
                        Taxes & Deductions
                    </h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taxData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={formatCurrency} />
                                <YAxis type="category" dataKey="name" width={100} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="amount" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                        <span className="text-slate-600">Gross Pay</span>
                        <span className="font-medium text-slate-900">{formatCurrency(grossPay)}</span>
                    </li>
                     <li className="flex justify-between border-t pt-2">
                        <span className="text-slate-600">Total Taxes</span>
                        <span className="font-medium text-slate-900">-{formatCurrency(totalTaxes)}</span>
                    </li>
                     <li className="flex justify-between">
                        <span className="text-slate-600">Total Deductions</span>
                        <span className="font-medium text-slate-900">-{formatCurrency(totalDeductions)}</span>
                    </li>
                    <li className="flex justify-between border-t border-emerald-300 pt-2">
                        <span className="font-bold text-emerald-700">Net Pay</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(netPay)}</span>
                    </li>
                </ul>

            </CardContent>
        </Card>
    );
}