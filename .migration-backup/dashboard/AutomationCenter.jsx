/**
 * @fileoverview Autonomous agent orchestration center
 * @description Triggers and monitors multi-agent workflows with health checks,
 * chaos mode testing, and real-time activity tracking with markdown results
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { AgentTask } from '@/api/entities';
import { Button } from '@/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Bot, Play, RefreshCw, Layers, ShieldCheck, Bug, GitBranch, MessageSquare, AlertCircle, Brain, TrendingUp, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { ThemedCard } from '../ui/enhanced-components';
import { ScrollArea } from '@/ui/scroll-area';
import { useToast } from '@/ui/use-toast';
import { logError } from '@/utils/logger';
import { agentSDK } from '@/agents';
import ReactMarkdown from 'react-markdown';
import { Loading, LoadingWrapper } from '@/ui/loading';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { InlineError, ErrorMessage } from '@/shared/ErrorMessage';

/**
 * Agent icon mappings for UI display
 * @constant {Object.<string, React.Component>}
 */
const AGENT_ICONS = {
    financial_orchestrator: Layers,
    data_parser: Bug,
    financial_interpolator: GitBranch,
    financial_interop: MessageSquare,
    error_corrector: ShieldCheck,
    financial_watchdog: AlertCircle,
    adaptive_mentor: Brain,
    learning_optimizer: TrendingUp
};

/**
 * Automation Center Component
 * @component
 * @description Manages autonomous AI agent workflows with chaos engineering support
 * @returns {JSX.Element}
 */
function AutomationCenter() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTriggering, setIsTriggering] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [error, setError] = useState(null);
    const [chaosMode] = useLocalStorage('apex-finance:chaos-mode', false);
    const { toast } = useToast();

    const loadTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Chaos Engineering: Add artificial delays and failures
            if (chaosMode) {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));
                if (Math.random() < 0.25) { // 25% chance of failure in chaos mode
                    throw new Error('Chaos Test: Agent task loading failure');
                }
            }
            
            const agentTasks = await AgentTask.list('-created_date', 50);
            setTasks(Array.isArray(agentTasks) ? agentTasks : []);
            setLastRefresh(Date.now());
        } catch (error) {
            logError('Failed to load agent tasks', error);
            setError(error.message);
            
            // In chaos mode, show different error messages
            const errorMessage = chaosMode 
                ? 'Chaos mode detected network instability while loading agent tasks.'
                : 'Failed to fetch automation history. Please try again.';
                
            toast({ 
                title: 'Error loading agent tasks', 
                variant: 'destructive',
                description: errorMessage
            });
            setTasks([]); // Fallback to empty state
        } finally {
            setIsLoading(false);
        }
    }, [toast, chaosMode]);

    useEffect(() => {
        loadTasks();
        
        // Set up periodic refresh (less frequent in chaos mode to reduce noise)
        const refreshInterval = chaosMode ? 60000 : 30000; // 60s vs 30s
        const interval = setInterval(loadTasks, refreshInterval);
        return () => clearInterval(interval);
    }, [loadTasks, chaosMode]);

    const triggerHealthCheck = async () => {
        setIsTriggering(true);
        
        const initialMessage = chaosMode 
            ? 'Starting Financial Health Check-up in CHAOS MODE... Systems may be unstable.' 
            : 'Starting Financial Health Check-up... The Orchestrator will coordinate multiple agents.';
            
        toast({ 
            title: initialMessage, 
            description: 'This may take a moment.',
            variant: chaosMode ? 'destructive' : 'default'
        });
        
        try {
            // Chaos Engineering: Add delays and potential failures
            if (chaosMode) {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
                if (Math.random() < 0.3) { // 30% chance of failure
                    throw new Error('Chaos Test: Health check orchestration failed');
                }
            }

            // Create a placeholder task
            const task = await AgentTask.create({
                agent_name: 'financial_orchestrator',
                task_input: `Perform a full financial health check-up ${chaosMode ? 'under chaos conditions' : ''}. Coordinate with the Error Corrector and Financial Watchdog to scan for issues, then provide a summary of findings and recommended actions.`,
                status: 'running',
                started_at: new Date().toISOString()
            });

            // Simulate agent interaction
            const conversation = await agentSDK.createConversation({ 
                agent_name: 'financial_orchestrator' 
            });
            
            const response = await agentSDK.addMessage(conversation, {
                role: 'user',
                content: task.task_input
            });
            
            // Wait for the final agent response
            const finalMessage = response.messages[response.messages.length - 1];

            // Update the task with the result
            await AgentTask.update(task.id, {
                status: 'completed',
                completed_at: new Date().toISOString(),
                result_summary: finalMessage.content
            });
            
            toast({ 
                title: 'Health Check-up Complete!', 
                description: chaosMode 
                    ? 'Chaos mode health check completed - check results below.' 
                    : 'View the summary in the activity log below.'
            });
            
            // Refresh the tasks list
            await loadTasks();

        } catch (error) {
            logError('Health check failed', error);
            
            const errorTitle = chaosMode 
                ? 'Health check failed due to chaos conditions' 
                : 'Failed to trigger health check-up';
                
            toast({ 
                title: errorTitle, 
                variant: 'destructive',
                description: error.message || 'Please try again later.'
            });
        } finally {
            setIsTriggering(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            pending: { icon: Loader2, color: 'bg-gray-500', spin: true, text: 'Pending' },
            running: { icon: Loader2, color: 'bg-blue-500', spin: true, text: 'Running' },
            completed: { icon: CheckCircle, color: 'bg-green-500', spin: false, text: 'Completed' },
            failed: { icon: XCircle, color: 'bg-red-500', spin: false, text: 'Failed' },
        };
        
        const { icon: Icon, color, spin, text } = config[status] || config.pending;
        
        return (
            <Badge className={`flex items-center gap-1.5 ${color} text-white`}>
                <Icon className={`w-3 h-3 ${spin ? 'animate-spin' : ''}`} />
                <span>{text}</span>
            </Badge>
        );
    };

    const TaskItem = ({ task }) => {
        const AgentIcon = AGENT_ICONS[task.agent_name] || Bot;
        const createdDate = new Date(task.created_date);
        const isRecent = Date.now() - createdDate.getTime() < 5 * 60 * 1000; // 5 minutes
        const isChaosTask = task.task_input?.includes('chaos') || task.task_input?.includes('Chaos');
        
        return (
            <ThemedCard className={`p-4 transition-all duration-200 ${isRecent ? 'ring-2 ring-primary/20' : ''} ${isChaosTask ? 'border-destructive/30' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <AgentIcon className="w-5 h-5 text-primary flex-shrink-0" />
                            <h4 className="font-semibold capitalize text-foreground">
                                {task.agent_name.replace(/_/g, ' ')}
                            </h4>
                            {isRecent && (
                                <Badge variant="secondary" className="text-xs">
                                    New
                                </Badge>
                            )}
                            {isChaosTask && (
                                <Badge variant="destructive" className="text-xs">
                                    <Bug className="w-3 h-3 mr-1" />
                                    Chaos
                                </Badge>
                            )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground italic line-clamp-2">
                            "{task.task_input}"
                        </p>
                        
                        {task.result_summary && (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 p-3 bg-muted/50 rounded-lg border">
                                <ReactMarkdown className="text-sm">
                                    {task.result_summary}
                                </ReactMarkdown>
                            </div>
                        )}
                        
                        {task.status === 'failed' && (
                            <InlineError 
                                message={isChaosTask ? 'Task failed due to chaos conditions' : 'Task failed to complete'}
                            />
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <StatusBadge status={task.status} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {createdDate.toLocaleString()}
                        </span>
                        {task.completed_at && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                                Completed {new Date(task.completed_at).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
            </ThemedCard>
        );
    };

    return (
        <div className="space-y-6">
            <ThemedCard elevated>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-6 h-6 text-primary" />
                                Autonomous Agent Center
                                {chaosMode && (
                                    <Badge variant="destructive" className="ml-2">
                                        <Bug className="w-3 h-3 mr-1" />
                                        Chaos Mode Active
                                    </Badge>
                                )}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">
                                {chaosMode 
                                    ? 'Trigger and monitor autonomous agent workflows under unstable conditions'
                                    : 'Trigger and monitor autonomous agent workflows'
                                }
                            </p>
                        </div>
                        <Button 
                            onClick={triggerHealthCheck} 
                            disabled={isTriggering}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isTriggering ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 mr-2" />
                            )}
                            Run Financial Health Check-up
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{tasks.length}</div>
                            <div className="text-sm text-muted-foreground">Total Tasks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {tasks.filter(t => t.status === 'completed').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {tasks.filter(t => t.status === 'running').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Running</div>
                        </div>
                    </div>
                </CardContent>
            </ThemedCard>

            <ThemedCard>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Recent Agent Activity</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                                {chaosMode && ' â€¢ Chaos mode may cause instability'}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={loadTasks} disabled={isLoading}>
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] -mx-4 px-4">
                        <ErrorBoundary fallback={
                            <ErrorMessage
                                title="Component Error"
                                message="Failed to render agent activity. This could be due to chaos conditions."
                                severity="error"
                            />
                        }>
                            <LoadingWrapper 
                                isLoading={isLoading} 
                                error={error}
                                fallback={<Loading text="Loading agent activity..." variant="dots" />}
                                emptyState={
                                    <div className="text-center py-16">
                                        <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                        <h3 className="text-lg font-semibold mb-2">No agent activity yet</h3>
                                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                            {chaosMode 
                                                ? 'Trigger a workflow above to test your AI agents under chaos conditions. They\'ll work to analyze and optimize despite system instability.'
                                                : 'Trigger a workflow above to see your AI agents in action. They\'ll work autonomously to analyze and optimize your financial situation.'
                                            }
                                        </p>
                                        <Button variant="outline" onClick={triggerHealthCheck} disabled={isTriggering}>
                                            <Zap className="w-4 h-4 mr-2" />
                                            Get Started
                                        </Button>
                                    </div>
                                }
                                isEmpty={tasks.length === 0}
                            >
                                <div className="space-y-4">
                                    {tasks.map(task => (
                                        <ErrorBoundary key={task.id} fallback={
                                            <ThemedCard className="p-4 border-destructive/30">
                                                <div className="flex items-center gap-2 text-destructive">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span className="text-sm">Failed to render task</span>
                                                </div>
                                            </ThemedCard>
                                        }>
                                            <TaskItem task={task} />
                                        </ErrorBoundary>
                                    ))}
                                </div>
                            </LoadingWrapper>
                        </ErrorBoundary>
                    </ScrollArea>
                </CardContent>
            </ThemedCard>
        </div>
    );
}

export default memo(AutomationCenter);
