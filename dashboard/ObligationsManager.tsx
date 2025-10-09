// @ts-nocheck
/**
 * @fileoverview Bill obligations manager with urgency tracking
 * @description Manages monthly bills with status indicators (critical/due soon/upcoming),
 * auto-pay tracking, and quick pay actions based on due dates
 */

import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Progress } from '@/ui/progress';
import { AlertTriangle, CheckCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { format, addMonths } from 'date-fns';

/**
 * Obligations Manager Component
 * @component
 * @param {Object} props
 * @param {Array} props.bills - List of bills with due dates and amounts
 * @param {Function} props.refreshData - Callback to refresh data
 * @returns {JSX.Element}
 */
function ObligationsManager({ bills, refreshData }) {
    const obligationData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Calculate when each bill is due this month
        const billsWithDates = bills.map(bill => {
            let dueDate = new Date(currentYear, currentMonth, bill.due_date);
            
            // If the due date has passed this month, show next month
            if (dueDate < now) {
                dueDate = new Date(currentYear, currentMonth + 1, bill.due_date);
            }

            const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            
            let status = 'upcoming';
            let urgency = 'low';
            
            if (daysUntilDue <= 3) {
                status = 'critical';
                urgency = 'high';
            } else if (daysUntilDue <= 7) {
                status = 'due_soon';
                urgency = 'medium';
            }

            return {
                ...bill,
                dueDate,
                daysUntilDue,
                status,
                urgency,
                formattedDueDate: format(dueDate, 'MMM d')
            };
        });

        // Sort by urgency and due date
        const sortedBills = billsWithDates.sort((a, b) => {
            if (a.urgency !== b.urgency) {
                const urgencyOrder = { high: 0, medium: 1, low: 2 };
                return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            }
            return a.daysUntilDue - b.daysUntilDue;
        });

        const totalMonthlyObligations = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const criticalBills = billsWithDates.filter(b => b.status === 'critical');
        const upcomingBills = billsWithDates.filter(b => b.status === 'due_soon');

        return {
            sortedBills,
            totalMonthlyObligations,
            criticalBills,
            upcomingBills,
            totalBills: bills.length
        };
    }, [bills]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'critical':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case 'due_soon':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical':
                return 'bg-red-50 border-red-200';
            case 'due_soon':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-green-50 border-green-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-red-50 to-red-100/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Critical Bills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-800">{obligationData.criticalBills.length}</div>
                        <p className="text-xs text-red-600 mt-1">Due within 3 days</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-700">Due Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-800">{obligationData.upcomingBills.length}</div>
                        <p className="text-xs text-yellow-600 mt-1">Due within 1 week</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Monthly Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-800">
                            {formatCurrency(obligationData.totalMonthlyObligations)}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">{obligationData.totalBills} obligations</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bills List */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        All Obligations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {obligationData.sortedBills.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No bills tracked yet</p>
                            <Button variant="outline" className="mt-2">Add Your First Bill</Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {obligationData.sortedBills.map((bill) => (
                                <div 
                                    key={bill.id} 
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getStatusColor(bill.status)}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            {getStatusIcon(bill.status)}
                                            <div>
                                                <h4 className="font-medium text-slate-900">{bill.name}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                    <span>Due {bill.formattedDueDate}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{bill.category.replace('_', ' ')}</span>
                                                    {bill.auto_pay && (
                                                        <>
                                                            <span>•</span>
                                                            <Badge variant="secondary" className="text-xs">Auto Pay</Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900">{formatCurrency(bill.amount)}</div>
                                            <div className="text-xs text-slate-500">
                                                {bill.daysUntilDue === 0 ? 'Due today' :
                                                 bill.daysUntilDue === 1 ? 'Due tomorrow' :
                                                 `${bill.daysUntilDue} days left`}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {bill.status === 'critical' && (
                                        <div className="mt-3 flex gap-2">
                                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                                Pay Now
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                Reschedule
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3 flex-wrap">
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Add New Bill
                </Button>
                <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Reminders
                </Button>
                <Button variant="outline" onClick={refreshData}>
                    Refresh Data
                </Button>
            </div>
        </div>
    );
}

export default memo(ObligationsManager);
