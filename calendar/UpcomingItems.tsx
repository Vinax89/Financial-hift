// @ts-nocheck
/**
 * @fileoverview Upcoming items component showing next shifts, bills, and BNPL payments
 * @description Dashboard widget displaying chronologically upcoming financial events
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Briefcase, Receipt, Zap, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
 * Individual upcoming item row
 * @param {Object} props - Component props
 * @param {React.Element} props.icon - Icon element
 * @param {string} props.title - Item title
 * @param {string} props.date - Formatted date string
 * @param {string} props.amount - Formatted amount
 * @param {string} props.amountColor - Tailwind color class
 * @returns {JSX.Element} Item row
 */
const Item = ({ icon, title, date, amount, amountColor }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-full">
                {icon}
            </div>
            <div>
                <p className="font-medium text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500">{date}</p>
            </div>
        </div>
        <div className={`font-semibold text-sm ${amountColor}`}>
            {amount}
        </div>
    </div>
);

/**
 * Upcoming items widget component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.shifts - Upcoming shifts
 * @param {Array<Object>} props.bills - Upcoming bills
 * @param {Array<Object>} props.bnplPlans - BNPL payment plans
 * @returns {JSX.Element} Upcoming items card
 */
interface UpcomingItemsProps { [key: string]: any; }

function UpcomingItems({ shifts, bills, bnplPlans }: UpcomingItemsProps) {
    const upcomingBnpl = bnplPlans
        .filter(plan => new Date(plan.next_due_date) > new Date())
        .slice(0, 3);

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    What's Next
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" /> Upcoming Shifts
                    </h4>
                    <div className="space-y-1">
                        {shifts.length > 0 ? shifts.map(shift => (
                            <Item 
                                key={`shift-${shift.id}`}
                                icon={<Briefcase className="h-4 w-4 text-blue-600" />}
                                title={shift.title}
                                date={format(new Date(shift.start_datetime), "eee, MMM d 'at' p")}
                                amount={`+${formatCurrency(shift.net_pay || 0)}`}
                                amountColor="text-emerald-600"
                            />
                        )) : <p className="text-xs text-slate-500 p-2">No upcoming shifts scheduled.</p>}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                        <Receipt className="h-4 w-4" /> Upcoming Bills
                    </h4>
                     <div className="space-y-1">
                        {bills.length > 0 ? bills.map(bill => (
                             <Item 
                                key={`bill-${bill.id}`}
                                icon={<Receipt className="h-4 w-4 text-rose-600" />}
                                title={bill.name}
                                date={`Due on ${format(bill.nextDue, "MMM d")}`}
                                amount={`-${formatCurrency(bill.amount)}`}
                                amountColor="text-rose-600"
                            />
                        )) : <p className="text-xs text-slate-500 p-2">No upcoming bills.</p>}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                        <Zap className="h-4 w-4" /> Upcoming BNPL
                    </h4>
                     <div className="space-y-1">
                        {upcomingBnpl.length > 0 ? upcomingBnpl.map(plan => (
                             <Item 
                                key={`bnpl-${plan.id}`}
                                icon={<Zap className="h-4 w-4 text-orange-600" />}
                                title={plan.merchant}
                                date={`Due on ${format(new Date(plan.next_due_date), "MMM d")}`}
                                amount={`-${formatCurrency(plan.installment_amount)}`}
                                amountColor="text-orange-600"
                            />
                        )) : <p className="text-xs text-slate-500 p-2">No upcoming BNPL payments.</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default React.memo(UpcomingItems);
