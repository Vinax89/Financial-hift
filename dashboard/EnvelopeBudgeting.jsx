
import React, { useState, useMemo } from 'react';
import { logError } from '@/utils/logger';
import { CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Badge } from '@/ui/badge';
import { agentSDK } from '@/agents';
import { AgentTask } from '@/api/entities';
import { Wallet, Brain, AlertTriangle, Target, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ThemedCard, ThemedProgress } from '../ui/enhanced-components';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/ui/use-toast';
import { Loading } from '@/ui/loading';


const CATEGORY_COLORS = {
    // This object would typically contain category names mapped to specific color codes.
    // For example:
    // "Groceries": "bg-green-100 text-green-800",
    // "Utilities": "bg-blue-100 text-blue-800",
    // "Rent": "bg-red-100 text-red-800",
    // "Savings": "bg-purple-100 text-purple-800",
    // "Entertainment": "bg-yellow-100 text-yellow-800",
};

/**
 * Envelope Budgeting Component
 * Implements zero-based budgeting where income is allocated to spending categories
 * Features:
 * - Manual allocation to categories
 * - Auto-allocation based on spending patterns
 * - AI-powered optimization suggestions
 * - Visual progress tracking
 * - Input validation (min: $0, max: $1,000,000)
 * 
 * @param {Object} props
 * @param {Array<Object>} props.budgets - Array of budget objects
 * @param {Array<Object>} props.transactions - Array of transaction objects
 * @param {number} props.income - Total monthly income
 * @param {Function} props.refreshData - Callback to refresh data
 * @returns {JSX.Element} Envelope budgeting interface
 */
function EnvelopeBudgeting({ budgets, transactions, income, refreshData }) {
    const [envelopes, setEnvelopes] = useLocalStorage('envelope-allocations', {});
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationSuggestion, setOptimizationSuggestion] = useState('');
    const { toast } = useToast();

    const { envelopeCategories, totalAllocated, remainingToAllocate } = useMemo(() => {
        const uniqueBudgets = budgets && Array.isArray(budgets) ? budgets : [];
        const uniqueTransactions = transactions && Array.isArray(transactions) ? transactions : [];

        // FIX: Use transaction type === 'expense' instead of negative amounts (schema enforces non-negative amounts)
        const spending = uniqueTransactions
            .filter(t => t && t.type === 'expense')
            .reduce((acc, t) => {
                const category = t.category || 'Uncategorized';
                const amt = typeof t.amount === 'number' ? Math.abs(t.amount) : 0;
                acc[category] = (acc[category] || 0) + amt;
                return acc;
            }, {});

        const budgetCategories = uniqueBudgets.map(b => b.category);
        const spendingCategories = Object.keys(spending);
        const allCategories = [...new Set([...budgetCategories, ...spendingCategories])];

        const calculatedCategories = allCategories.map(category => ({
            category,
            allocated: parseFloat(envelopes[category]) || 0,
            spent: spending[category] || 0,
        }));

        const allocated = Object.values(envelopes).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
        const remaining = (income || 0) - allocated;

        return {
            envelopeCategories: calculatedCategories,
            totalAllocated: allocated,
            remainingToAllocate: remaining,
        };
    }, [budgets, transactions, envelopes, income]);

    const getAIOptimization = useCallback(async () => {
        setIsOptimizing(true);
        setOptimizationSuggestion('');
        toast({ title: "Engaging Financial Orchestrator...", description: "Performing a holistic budget analysis." });
        
        try {
            const spendingData = envelopeCategories.map(env => 
                `${env.category}: Allocated ${formatCurrency(env.allocated)}, Spent ${formatCurrency(env.spent)}`
            ).join('\n');

            const prompt = `
                As the Financial Orchestrator, perform a deep analysis of this envelope budget.
                User's Monthly Income: ${formatCurrency(income)}
                Current Allocations & Spending:
                ${spendingData}
                Total Allocated: ${formatCurrency(totalAllocated)}
                Remaining to Allocate: ${formatCurrency(remainingToAllocate)}

                Using your full access to financial data, provide specific, actionable recommendations to optimize this budget. Present the output as a concise, actionable summary in markdown.
            `;
            
            // This assumes AgentTask.create and agentSDK.createConversation/addMessage exist and work as intended.
            // Mocking these for a fully functional example would require more context.
            const task = await AgentTask.create({
                agent_name: 'financial_orchestrator',
                task_input: prompt,
                status: 'running'
            });

            const conversation = await agentSDK.createConversation({ agent_name: 'financial_orchestrator' });
            const response = await agentSDK.addMessage(conversation, { role: 'user', content: prompt });
            const finalMessage = response.messages[response.messages.length - 1];

            setOptimizationSuggestion(finalMessage.content);
            
            await AgentTask.update(task.id, {
                status: 'completed',
                result_summary: 'Budget optimization recommendations generated.'
            });

        } catch (error) {
            logError('AI optimization failed', error);
            setOptimizationSuggestion('Error: Could not generate suggestions.');
            toast({ 
                title: 'Optimization Failed', 
                description: error.message || 'Please try again later.',
                variant: 'destructive' 
            });
        } finally {
            setIsOptimizing(false);
        }
    }, [envelopeCategories, income, totalAllocated, remainingToAllocate, toast]); // Removed AgentTask, agentSDK from deps

    /**
     * Handle allocation with validation
     * Prevents negative values, very large numbers, and invalid input
     */
    const handleAllocate = useCallback((category, amount) => {
        // Parse and validate the input
        const parsedAmount = parseFloat(amount);
        
        // Empty input - allow it (represents 0)
        if (amount === '' || amount === null || amount === undefined) {
            setEnvelopes(prev => ({
                ...prev,
                [category]: 0
            }));
            return;
        }
        
        // Validate: must be a valid number
        if (isNaN(parsedAmount)) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid number.",
                variant: "destructive",
            });
            return;
        }
        
        // Validate: must be non-negative
        if (parsedAmount < 0) {
            toast({
                title: "Invalid Amount",
                description: "Allocation amount cannot be negative.",
                variant: "destructive",
            });
            return;
        }
        
        // Validate: must not exceed reasonable limit (e.g., $1 million)
        const MAX_ALLOCATION = 1000000;
        if (parsedAmount > MAX_ALLOCATION) {
            toast({
                title: "Amount Too Large",
                description: `Maximum allocation is ${formatCurrency(MAX_ALLOCATION)}.`,
                variant: "destructive",
            });
            return;
        }
        
        // Round to 2 decimal places for currency
        const roundedAmount = Math.round(parsedAmount * 100) / 100;
        
        setEnvelopes(prev => ({
            ...prev,
            [category]: roundedAmount
        }));
    }, [setEnvelopes, toast]);

    const autoAllocate = useCallback(() => {
        if (!income || income <= 0) {
            toast({
                title: "Income Required",
                description: "Please set your monthly income to use auto-allocation.",
                variant: "destructive",
            });
            return;
        }
    
        const newEnvelopes = { ...envelopes };
        let currentRemaining = income;
    
        // Prioritize existing allocations
        for (const category of Object.keys(newEnvelopes)) {
            const allocatedAmount = parseFloat(newEnvelopes[category]) || 0;
            currentRemaining -= allocatedAmount;
        }
    
        // Distribute remaining income to unallocated categories or adjust proportionally if over-allocated
        if (currentRemaining < 0) {
            toast({
                title: "Over-allocated",
                description: "Your current allocations exceed your income. Adjusting proportionally...",
                variant: "warning",
            });
            const totalAllocatedAmount = Object.values(newEnvelopes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            if (totalAllocatedAmount > 0) {
                for (const category of Object.keys(newEnvelopes)) {
                    newEnvelopes[category] = ((parseFloat(newEnvelopes[category]) || 0) / totalAllocatedAmount) * income;
                }
            }
        } else if (currentRemaining > 0) {
            // Find categories that have no explicit allocation yet, or have 0
            const unallocatedCategories = envelopeCategories
                .filter(env => !envelopes[env.category] || parseFloat(envelopes[env.category]) === 0)
                .map(env => env.category);
    
            if (unallocatedCategories.length > 0) {
                const amountPerCategory = currentRemaining / unallocatedCategories.length;
                unallocatedCategories.forEach(category => {
                    newEnvelopes[category] = (parseFloat(newEnvelopes[category]) || 0) + amountPerCategory;
                });
            } else {
                // If all categories have some allocation, distribute remaining proportionally
                const totalAllocatedAmount = Object.values(newEnvelopes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                if (totalAllocatedAmount > 0) {
                    for (const category of Object.keys(newEnvelopes)) {
                        newEnvelopes[category] = ((parseFloat(newEnvelopes[category]) || 0) / totalAllocatedAmount) * income;
                    }
                } else {
                     // Fallback if no categories and no existing allocations - just put it all into first category
                    if (envelopeCategories.length > 0) {
                        newEnvelopes[envelopeCategories[0].category] = income;
                    }
                }
            }
        }
    
        setEnvelopes(newEnvelopes);
        toast({
            title: "Auto-allocated",
            description: "Budget allocations have been adjusted.",
        });
    }, [income, toast, envelopes, setEnvelopes, envelopeCategories]);

    return (
        <div className="space-y-6">
            <ThemedCard elevated>
                <CardHeader className="pb-2">
                    <div className="space-y-4">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Wallet className="h-6 w-6 text-primary" /> Envelope Budgeting
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Button 
                                variant="outline" 
                                onClick={autoAllocate} 
                                disabled={!income || income <= 0}
                                className="w-full sm:w-auto sm:min-w-[140px]"
                            >
                                <Target className="mr-2 h-4 w-4" /> 
                                Auto Allocate
                            </Button>
                            <Button 
                                onClick={getAIOptimization} 
                                disabled={isOptimizing}
                                className="w-full sm:w-auto sm:min-w-[140px]"
                            >
                                {isOptimizing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Brain className="mr-2 h-4 w-4" />
                                )}
                                AI Optimize
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium">
                            Monthly Income: <span className="font-bold text-success sensitive">{formatCurrency(income)}</span>
                        </div>
                        <div className="font-medium sm:text-right">
                            Remaining to Allocate: <span className={`font-bold ${remainingToAllocate < 0 ? 'text-expense' : 'text-success'} sensitive`}>{formatCurrency(remainingToAllocate)}</span>
                        </div>
                    </div>
                    
                    <ThemedProgress
                        value={(totalAllocated / (income || 1)) * 100}
                        className="h-2"
                        indicatorColor={totalAllocated > income ? "bg-red-500" : "bg-primary"}
                    />

                    <div className="space-y-4">
                        {envelopeCategories.map((envelope) => {
                            const progress = envelope.allocated > 0 ? (envelope.spent / envelope.allocated) * 100 : 0;
                            const amountLeft = envelope.allocated - envelope.spent;
                            const isOverspent = amountLeft < 0;

                            return (
                                <div key={envelope.category} className="p-3 bg-muted/50 rounded-lg space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <Badge 
                                            variant="secondary" 
                                            className={`px-3 py-1 text-sm font-medium ${CATEGORY_COLORS[envelope.category] || 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {envelope.category}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Allocated:</span>
                                            <Input
                                                type="number"
                                                value={envelope.allocated > 0 ? envelope.allocated.toFixed(2) : ''}
                                                placeholder="0.00"
                                                onChange={(e) => handleAllocate(envelope.category, e.target.value)}
                                                className="w-28 text-right text-base font-medium"
                                                step="0.01"
                                                min="0"
                                                max="1000000"
                                                aria-label={`Allocate budget for ${envelope.category}`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <ThemedProgress value={progress} className="h-2 mb-2" indicatorColor={isOverspent ? 'bg-expense' : 'bg-primary'} />
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>Spent: <span className="sensitive">{formatCurrency(envelope.spent)}</span></span>
                                            <span className={`font-medium ${isOverspent ? 'text-expense' : 'text-foreground'}`}>
                                                <span className="sensitive">{formatCurrency(amountLeft)}</span> Left
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                
                {totalAllocated > income && (
                    <CardFooter className="text-expense flex items-center gap-2 !pt-0">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">You have allocated more than your total income!</span>
                    </CardFooter>
                )}
            </ThemedCard>

            {(isOptimizing || optimizationSuggestion) && (
                <ThemedCard glowing>
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Brain className="w-5 h-5"/>
                            AI Budget Optimization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isOptimizing && !optimizationSuggestion ? (
                            <Loading text="Orchestrator is analyzing..." />
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{optimizationSuggestion}</ReactMarkdown>
                            </div>
                        )}
                    </CardContent>
                </ThemedCard>
            )}
        </div>
    );
}

export default React.memo(EnvelopeBudgeting);
