/**
 * @fileoverview BNPL plan list component displaying all payment plans
 * @description Animated list showing BNPL plans with progress, status badges, and actions
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Calendar, Edit, Trash2, CheckCircle2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ListSkeleton } from "@/shared/SkeletonLoaders";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/calculations";

/**
 * Provider-specific color schemes
 * @type {Object.<string, string>}
 */
const providerColors = {
    klarna: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
    afterpay: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    affirm: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    paypal: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    sezzle: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    quadpay: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
};

/**
 * Status-specific color schemes
 * @type {Object.<string, string>}
 */
const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    paid: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    cancelled: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
};

/**
 * BNPL plan list component with animations
 * @param {Object} props - Component props
 * @param {Array<Object>} props.plans - BNPL payment plans
 * @param {Function} props.onEdit - Edit plan handler
 * @param {Function} props.onMarkPaid - Mark payment as paid handler
 * @param {Function} props.onDelete - Delete plan handler
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Animated plan list
 */
interface BNPLPlanListProps { [key: string]: any; }`n`nfunction BNPLPlanList({ plans, onEdit, onMarkPaid, onDelete, isLoading }: BNPLPlanListProps) {
    /**
     * Check if a payment is overdue
     * @param {string|Date} dueDate - Due date to check
     * @returns {boolean} True if overdue
     */
    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    return (
        <Card className="border shadow-lg bg-card backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Your BNPL Plans ({plans.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <ListSkeleton items={3} showAvatar={true} />
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {plans.map((plan) => {
                                const progress = ((plan.total_installments - plan.remaining_installments) / plan.total_installments) * 100;
                                const remainingAmount = plan.installment_amount * plan.remaining_installments;
                                
                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`p-4 rounded-lg border transition-colors ${
                                            isOverdue(plan.next_due_date) && plan.status === 'active' 
                                                ? 'border-destructive/50 bg-destructive/5' 
                                                : 'border-border hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center">
                                                    <span className="text-primary font-bold text-sm">
                                                        {plan.provider.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{plan.merchant}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge 
                                                            variant="secondary"
                                                            className={providerColors[plan.provider]}
                                                        >
                                                            {plan.provider.charAt(0).toUpperCase() + plan.provider.slice(1)}
                                                        </Badge>
                                                        <Badge 
                                                            variant="secondary"
                                                            className={statusColors[plan.status]}
                                                        >
                                                            {plan.status === 'active' && isOverdue(plan.next_due_date) ? 'Overdue' : plan.status}
                                                        </Badge>
                                                        {plan.status === 'active' && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Due {format(new Date(plan.next_due_date), "MMM d")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-foreground sensitive">
                                                    {formatCurrency(remainingAmount)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    of <span className="sensitive">{formatCurrency(plan.principal_amount)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {plan.total_installments - plan.remaining_installments} of {plan.total_installments} payments made
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {progress.toFixed(0)}% complete
                                                </span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                <span className="sensitive">{formatCurrency(plan.installment_amount)}</span> per {plan.payment_frequency === 'biweekly' ? '2 weeks' : plan.payment_frequency}
                                            </div>
                                            <div className="flex gap-2">
                                                {plan.status === 'active' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onMarkPaid(plan.id)}
                                                        className="text-success hover:text-success/90"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Mark Paid
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(plan)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDelete(plan.id)}
                                                    className="text-destructive hover:text-destructive/90"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {plan.notes && (
                                            <div className="mt-3 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                                                {plan.notes}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
                
                {!isLoading && plans.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-lg mb-2 text-foreground">No BNPL plans found</p>
                        <p>Add your first plan to start tracking payments</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default React.memo(BNPLPlanList);
