// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Textarea } from '@/ui/textarea';
import { InvokeLLM } from '@/api/integrations';
import { Sparkles, Brain, TrendingUp, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatCurrency } from '../utils/calculations';
import { logError, sanitizeError } from '@/utils/errorLogging';
import { useRateLimit, formatRetryTime } from '@/utils/rateLimiting';

/**
 * AI Financial Advisor Panel
 * Provides AI-powered financial analysis and recommendations
 * Features:
 * - Financial health assessment
 * - Debt payoff strategy generation
 * - Savings optimization
 * - Shift work financial advice
 * - Custom financial Q&A
 * - Rate limiting: 5 requests per minute
 * - Secure error handling with no data leakage
 * 
 * @param {Object} props
 * @param {Array<Object>} props.transactions - User's transaction history
 * @param {Array<Object>} props.debts - User's debt accounts
 * @param {Array<Object>} props.goals - User's financial goals
 * @param {Object} props.metrics - Financial metrics (income, expenses, savings rate, etc.)
 * @returns {JSX.Element} AI advisor interface with service cards
 */
export default function AIAdvisorPanel({ transactions, debts, goals, metrics }) {
    const [activeService, setActiveService] = useState(null);
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [customQuestion, setCustomQuestion] = useState('');
    
    // Rate limiting: 5 AI requests per minute
    const { canMakeRequest, getRemainingRequests, getRetryAfter } = useRateLimit({
        maxRequests: 5,
        windowMs: 60000,
        identifier: 'ai-advisor'
    });

    const aiServices = [
        {
            id: 'financial-health',
            title: 'Financial Health Check',
            description: 'Comprehensive analysis of your financial position',
            icon: TrendingUp,
            color: 'emerald'
        },
        {
            id: 'debt-strategy',
            title: 'Debt Payoff Strategy',
            description: 'Personalized debt elimination plan',
            icon: AlertTriangle,
            color: 'rose'
        },
        {
            id: 'savings-optimizer',
            title: 'Savings Optimizer',
            description: 'Find opportunities to increase savings',
            icon: Brain,
            color: 'blue'
        },
        {
            id: 'shift-advisor',
            title: 'Shift Work Advisor',
            description: 'Optimize your work schedule for financial goals',
            icon: MessageSquare,
            color: 'purple'
        },
        {
            id: 'custom-advisor',
            title: 'Ask Financial Question',
            description: 'Get personalized advice on any financial topic',
            icon: Sparkles,
            color: 'amber'
        }
    ];

    const handleServiceClick = async (serviceId) => {
        if (isLoading) return;

        // Check rate limit
        if (!canMakeRequest()) {
            const retryAfter = getRetryAfter();
            const remaining = getRemainingRequests();
            setResults(prev => ({ 
                ...prev, 
                [serviceId]: `âš ï¸ **Rate Limit Reached**\n\nYou've reached the limit of 5 AI requests per minute. Please wait ${formatRetryTime(retryAfter)} before trying again.\n\nRemaining requests: ${remaining}/5` 
            }));
            return;
        }

        setActiveService(serviceId);
        setIsLoading(true);

        try {
            let prompt = '';
            const financialContext = {
                monthlyIncome: metrics.monthlyIncome,
                monthlyExpenses: metrics.monthlyExpenses,
                netIncome: metrics.netIncome,
                totalDebt: metrics.totalDebtBalance,
                debtToIncomeRatio: metrics.debtToIncomeRatio,
                savingsRate: metrics.savingsRate,
                numGoals: goals.length,
                numDebts: debts.length
            };

            switch (serviceId) {
                case 'financial-health':
                    prompt = `
                        As a certified financial advisor, perform a comprehensive financial health assessment based on this data:
                        
                        Monthly Income: $${metrics.monthlyIncome}
                        Monthly Expenses: $${metrics.monthlyExpenses}
                        Net Income: $${metrics.netIncome}
                        Total Debt: $${metrics.totalDebtBalance}
                        Debt-to-Income Ratio: ${metrics.debtToIncomeRatio.toFixed(1)}%
                        Savings Rate: ${metrics.savingsRate.toFixed(1)}%
                        Active Goals: ${goals.length}
                        Debt Accounts: ${debts.length}
                        
                        Provide a health score (1-10), identify strengths and areas for improvement, and give 3-5 specific actionable recommendations. Use markdown formatting.
                    `;
                    break;

                case 'debt-strategy':
                    const debtDetails = debts.map(d => 
                        `${d.name}: $${d.balance} at ${d.apr}% APR, min payment $${d.minimum_payment}`
                    ).join(', ');
                    
                    prompt = `
                        As a debt specialist, create a personalized debt payoff strategy for these debts:
                        ${debtDetails}
                        
                        Monthly income: $${metrics.monthlyIncome}
                        Current debt payments: $${metrics.monthlyDebtPayments}
                        Extra available: $${Math.max(0, metrics.netIncome)}
                        
                        Compare avalanche vs snowball methods, calculate payoff times, and recommend the best approach. Include specific monthly payment recommendations.
                    `;
                    break;

                case 'savings-optimizer':
                    const recentExpenses = transactions
                        .filter(t => t.type === 'expense')
                        .slice(0, 20)
                        .map(t => `${t.category}: $${t.amount}`)
                        .join(', ');
                    
                    prompt = `
                        Analyze these recent expenses to find savings opportunities:
                        ${recentExpenses}
                        
                        Current savings rate: ${metrics.savingsRate.toFixed(1)}%
                        Target: 20%+ savings rate
                        Monthly income: $${metrics.monthlyIncome}
                        
                        Identify 3-5 specific areas where expenses can be reduced and estimate potential monthly savings for each.
                    `;
                    break;

                case 'shift-advisor':
                    prompt = `
                        As a shift work financial advisor, help optimize work scheduling:
                        
                        Current monthly income: $${metrics.monthlyIncome}
                        Monthly expenses: $${metrics.monthlyExpenses}
                        Debt payments: $${metrics.monthlyDebtPayments}
                        Financial goals: ${goals.length} active goals
                        
                        Should this shift worker pick up extra shifts? Consider burnout risk, financial goals, and work-life balance. Provide specific recommendations.
                    `;
                    break;

                case 'custom-advisor':
                    if (!customQuestion.trim()) {
                        setResults(prev => ({ ...prev, [serviceId]: 'Please enter a question first.' }));
                        setIsLoading(false);
                        return;
                    }
                    
                    prompt = `
                        As a personal financial advisor, answer this question based on the user's financial situation:
                        
                        Question: ${customQuestion}
                        
                        Financial context:
                        - Monthly income: $${metrics.monthlyIncome}
                        - Monthly expenses: $${metrics.monthlyExpenses}
                        - Net income: $${metrics.netIncome}
                        - Total debt: $${metrics.totalDebtBalance}
                        - Savings rate: ${metrics.savingsRate.toFixed(1)}%
                        - Active financial goals: ${goals.length}
                        
                        Provide a personalized, actionable response.
                    `;
                    break;
            }

            const response = await InvokeLLM({ prompt });
            setResults(prev => ({ ...prev, [serviceId]: response }));
        } catch (error) {
            // Sanitize error for user display - don't expose sensitive details
            const sanitized = sanitizeError(error, {
                fallbackMessage: 'Unable to generate AI advice at this time.'
            });
            
            // Log full error details securely (development only)
            logError(error, {
                component: 'AIAdvisorPanel',
                service: serviceId,
                action: 'invoke_llm'
            });
            
            // Show user-friendly message only
            setResults(prev => ({ 
                ...prev, 
                [serviceId]: `Sorry, ${sanitized.userMessage} Please try again later.` 
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const getColorClasses = (color) => {
        const colors = {
            emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            rose: 'bg-rose-100 text-rose-700 border-rose-200',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            amber: 'bg-amber-100 text-amber-700 border-amber-200'
        };
        return colors[color] || colors.blue;
    };

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Financial Advisor
                </CardTitle>
                <p className="text-sm text-slate-600">
                    Get personalized financial guidance powered by AI analysis
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* AI Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiServices.map((service) => (
                        <Card 
                            key={service.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                                activeService === service.id ? getColorClasses(service.color) : 'border-slate-200'
                            }`}
                            onClick={() => handleServiceClick(service.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        service.color === 'emerald' ? 'bg-emerald-100' :
                                        service.color === 'rose' ? 'bg-rose-100' :
                                        service.color === 'blue' ? 'bg-blue-100' :
                                        service.color === 'purple' ? 'bg-purple-100' :
                                        'bg-amber-100'
                                    }`}>
                                        <service.icon className={`h-4 w-4 ${
                                            service.color === 'emerald' ? 'text-emerald-600' :
                                            service.color === 'rose' ? 'text-rose-600' :
                                            service.color === 'blue' ? 'text-blue-600' :
                                            service.color === 'purple' ? 'text-purple-600' :
                                            'text-amber-600'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 mb-1">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {service.description}
                                        </p>
                                        {isLoading && activeService === service.id && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-blue-600">
                                                    Analyzing...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Custom Question Input */}
                {activeService === 'custom-advisor' && (
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Ask any financial question... e.g., 'Should I pay off credit cards or invest in my 401k?'"
                            value={customQuestion}
                            onChange={(e) => setCustomQuestion(e.target.value)}
                            rows={3}
                        />
                        <Button 
                            onClick={() => handleServiceClick('custom-advisor')}
                            disabled={isLoading || !customQuestion.trim()}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Getting Advice...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Get AI Advice
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Results Display */}
                {activeService && results[activeService] && (
                    <Card className={`border-2 ${getColorClasses(
                        aiServices.find(s => s.id === activeService)?.color || 'blue'
                    )}`}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {aiServices.find(s => s.id === activeService)?.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm prose-slate max-w-none">
                                <ReactMarkdown>{results[activeService]}</ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Financial Context */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Your Financial Snapshot</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-slate-600">Net Income</span>
                                <div className="font-semibold">
                                    {formatCurrency(metrics.netIncome)}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-600">Total Debt</span>
                                <div className="font-semibold">
                                    {formatCurrency(metrics.totalDebtBalance)}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-600">Savings Rate</span>
                                <div className="font-semibold">
                                    {metrics.savingsRate.toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-600">Active Goals</span>
                                <div className="font-semibold">
                                    {goals.length}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
