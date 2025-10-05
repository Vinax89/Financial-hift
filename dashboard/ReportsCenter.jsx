import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs.jsx';
import { BarChart3, TrendingUp, TrendingDown, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from '../utils/calculations';
import { startOfMonth, subMonths, format } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#eab308'];

const getMonthlyData = (transactions) => {
    const months = {};
    for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthKey = format(monthStart, 'MMM yy');
        months[monthKey] = { name: monthKey, income: 0, expenses: 0 };
    }
    
    transactions.forEach(t => {
        const monthKey = format(new Date(t.date), 'MMM yy');
        if (months[monthKey]) {
            if (t.type === 'income') months[monthKey].income += t.amount;
            else months[monthKey].expenses += t.amount;
        }
    });

    return Object.values(months);
};

const getCategoryData = (transactions) => {
    const categories = {};
    const currentMonthStart = startOfMonth(new Date());

    transactions.filter(t => t.type === 'expense' && new Date(t.date) >= currentMonthStart).forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    return Object.entries(categories).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
};


export default function ReportsCenter({ transactions, debts, goals, investments }) {
    const monthlyData = getMonthlyData(transactions);
    const categoryData = getCategoryData(transactions);

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gray-700" />
                    Financial Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income_expense">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="income_expense">Income vs. Expense</TabsTrigger>
                        <TabsTrigger value="spending">Spending by Category</TabsTrigger>
                    </TabsList>
                    <TabsContent value="income_expense" className="mt-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="name" tick={{fontSize: 12}}/>
                                <YAxis tickFormatter={(val) => formatCurrency(val).slice(0,-3)+'k'} tick={{fontSize: 12}} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="income" fill="#22c55e" name="Income" />
                                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="spending" className="mt-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}