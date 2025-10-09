import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { Bot, Terminal, MessageCircle, Zap, Send, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Textarea } from '@/ui/textarea';
import { Badge } from '@/ui/badge';
import MessageBubble from '@/agents/MessageBubble';
import { AgentTask } from '@/api/entities';
import { agentSDK } from '@/agents';
import { LoadingWrapper, CardLoading } from '@/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { useToast } from '@/ui/use-toast';
import { useFinancialData } from '@/hooks/useFinancialData';
import { InvokeLLM } from '@/api/integrations';
import { logError, sanitizeError } from '@/utils/errorLogging';
import { useRateLimit, formatRetryTime } from '@/utils/rateLimiting';
import type { ChatMessage, AgentTaskData, AgentType } from '@/types/ai.types';

const QUICK_PROMPTS = [
  "Analyze my spending from last month.",
  "What's my biggest expense category?",
  "How can I save more money?",
  "Forecast my income for the next 30 days."
];

export default function AIAssistantContent() {
  const [activeTab, setActiveTab] = useState('advisor');

  // AI Advisor state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Agent Console state
  const [agentTasks, setAgentTasks] = useState<AgentTaskData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('financial_orchestrator');
  const [agentInput, setAgentInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);

  const { toast } = useToast();
  const { transactions, shifts, bills, goals } = useFinancialData();
  
  // Rate limiting: 5 AI chat requests per minute
  const chatRateLimit = useRateLimit({
    maxRequests: 5,
    windowMs: 60000,
    identifier: 'ai-chat'
  });
  
  // Rate limiting: 10 agent tasks per minute
  const agentRateLimit = useRateLimit({
    maxRequests: 10,
    windowMs: 60000,
    identifier: 'agent-tasks'
  });

  // Load agent tasks
  const loadAgentTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const tasks = await AgentTask.list('-created_date', 50);
      setAgentTasks(tasks);
    } catch (error) {
      const sanitized = sanitizeError(error);
      logError(error, { component: 'AIAssistantContent', action: 'load_agent_tasks' });
      toast({
        title: 'Failed to load agent tasks',
        description: sanitized.userMessage,
        variant: 'destructive'
      });
    }
    setTasksLoading(false);
  }, [toast]);

  useEffect(() => {
    loadAgentTasks();
  }, [loadAgentTasks]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Advisor message handler
  const handleSendMessage = async (message = input) => {
    if (!message.trim() || isLoading) return;

    // Check rate limit
    if (!chatRateLimit.canMakeRequest()) {
      const retryAfter = chatRateLimit.getRetryAfter();
      const remaining = chatRateLimit.getRemainingRequests();
      
      toast({
        title: 'Rate Limit Reached',
        description: `Please wait ${formatRetryTime(retryAfter)} before sending another message. (${remaining}/5 requests remaining)`,
        variant: 'destructive'
      });
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare financial context
      const context = {
        recent_transactions: transactions.slice(-10),
        active_shifts: shifts.filter(s => s.status === 'scheduled').slice(-5),
        upcoming_bills: bills.filter(b => b.status === 'active').slice(-5),
        active_goals: goals.filter(g => g.status === 'active')
      };

      const response = await InvokeLLM({
        prompt: `As a financial advisor for shift workers, help the user with their question: "${message}"\n\nFinancial Context:\n${JSON.stringify(context, null, 2)}\n\nProvide practical, actionable advice specific to their situation.`,
        add_context_from_internet: false
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response || 'I apologize, but I encountered an issue processing your request. Please try again.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const sanitized = sanitizeError(error);
      logError(error, { component: 'AIAssistantContent', action: 'ai_chat', prompt: message });
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I encountered an error while processing your request. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: 'Failed to get AI response',
        description: sanitized.userMessage,
        variant: 'destructive'
      });
    }
    setIsLoading(false);
  };

  // Agent task handler
  const handleRunAgent = async () => {
    if (!agentInput.trim() || agentLoading) return;

    // Check rate limit
    if (!agentRateLimit.canMakeRequest()) {
      const retryAfter = agentRateLimit.getRetryAfter();
      const remaining = agentRateLimit.getRemainingRequests();
      
      toast({
        title: 'Rate Limit Reached',
        description: `Please wait ${formatRetryTime(retryAfter)} before creating another agent task. (${remaining}/10 requests remaining)`,
        variant: 'destructive'
      });
      return;
    }

    setAgentLoading(true);
    try {
      const task = await AgentTask.create({
        agent_name: selectedAgent,
        task_input: agentInput,
        status: 'pending'
      });

      setAgentInput('');
      toast({ title: 'Agent task created successfully', description: 'Your task has been submitted.' });
      await loadAgentTasks();

      // Simulate agent processing (placeholder)
      setTimeout(async () => {
        try {
          await AgentTask.update(task.id, {
            status: 'completed',
            result_summary: 'Task completed successfully',
            completed_at: new Date().toISOString()
          });
          await loadAgentTasks();
        } catch (error) {
          logError(error, { component: 'AIAssistantContent', action: 'update_agent_task', taskId: task.id });
        }
      }, 3000);

    } catch (error) {
      const sanitized = sanitizeError(error);
      logError(error, { component: 'AIAssistantContent', action: 'create_agent_task', agent: selectedAgent });
      toast({
        title: 'Failed to create agent task',
        description: sanitized.userMessage,
        variant: 'destructive'
      });
    }
    setAgentLoading(false);
  };

  const availableAgents = [
    { id: 'financial_orchestrator', name: 'Financial Orchestrator', description: 'Comprehensive financial analysis and planning' },
    { id: 'data_parser', name: 'Data Parser', description: 'Extract and organize financial data' },
    { id: 'financial_interpolator', name: 'Financial Interpolator', description: 'Fill gaps in financial records' },
    { id: 'error_corrector', name: 'Error Corrector', description: 'Identify and fix data inconsistencies' },
    { id: 'financial_watchdog', name: 'Financial Watchdog', description: 'Monitor for unusual patterns and alerts' }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'running':
      case 'pending': return 'badge-warning';
      case 'failed': return 'badge-danger';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <GlassContainer className="p-6">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <FloatingElement className="">
              <div>
                <GlowEffect color="emerald" intensity="medium" className="">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                    <Bot className="h-8 w-8" />
                    AI Assistant
                  </h1>
                </GlowEffect>
                <p className="text-muted-foreground mt-1">Get personalized financial advice and run advanced AI agents.</p>
              </div>
            </FloatingElement>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{messages.filter(m => m.role === 'user').length}</div>
                <div className="text-xs text-muted-foreground">Chat Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{agentTasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs text-muted-foreground">Tasks Completed</div>
              </div>
            </div>
          </header>
        </GlassContainer>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <GlassContainer className="sticky top-4 z-20 bg-card/95 backdrop-blur-xl">
            <div className="p-4">
              <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 h-auto p-0">
                <TabsTrigger value="advisor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat Advisor
                </TabsTrigger>
                <TabsTrigger value="agents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4">
                  <Terminal className="h-4 w-4 mr-2" />
                  Agent Console
                </TabsTrigger>
              </TabsList>
            </div>
          </GlassContainer>

          <div className="space-y-8">
            <TabsContent value="advisor" className="mt-0">
              <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
                <FloatingElement className="">
                  <ThemedCard elevated className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                      ))}
                      {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <MessageBubble message={{role: 'assistant', tool_calls: [{name: 'Thinking', status: 'running'}]}} />
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t p-4 bg-background/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {QUICK_PROMPTS.map(p => (
                          <Button
                            key={p}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendMessage(p)}
                            disabled={isLoading}
                            className="h-auto py-2 px-3 text-xs leading-relaxed whitespace-normal text-left justify-start min-h-[44px]"
                          >
                            {p}
                          </Button>
                        ))}
                      </div>
                      <div className="relative">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask your financial question..."
                          className="pr-12"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          className="absolute right-2 bottom-2"
                          onClick={() => handleSendMessage()}
                          disabled={isLoading || !input.trim()}
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                        </Button>
                      </div>
                    </div>
                  </ThemedCard>
                </FloatingElement>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-8 mt-0">
              <div className="grid lg:grid-cols-2 gap-8">
                <FloatingElement className="">
                  <ThemedCard elevated className="min-h-[500px]">
                    <CardHeader>
                      <CardTitle>Run AI Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Agent</label>
                        <select
                          value={selectedAgent}
                          onChange={(e) => setSelectedAgent(e.target.value as AgentType)}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          {[
                            { id: 'financial_orchestrator', name: 'Financial Orchestrator', description: 'Comprehensive financial analysis and planning' },
                            { id: 'data_parser', name: 'Data Parser', description: 'Extract and organize financial data' },
                            { id: 'financial_interpolator', name: 'Financial Interpolator', description: 'Fill gaps in financial records' },
                            { id: 'error_corrector', name: 'Error Corrector', description: 'Identify and fix data inconsistencies' },
                            { id: 'financial_watchdog', name: 'Financial Watchdog', description: 'Monitor for unusual patterns and alerts' }
                          ].map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-muted-foreground mt-1">
                          {[ // description lookup
                            { id: 'financial_orchestrator', description: 'Comprehensive financial analysis and planning' },
                            { id: 'data_parser', description: 'Extract and organize financial data' },
                            { id: 'financial_interpolator', description: 'Fill gaps in financial records' },
                            { id: 'error_corrector', description: 'Identify and fix data inconsistencies' },
                            { id: 'financial_watchdog', description: 'Monitor for unusual patterns and alerts' }
                          ].find(a => a.id === selectedAgent)?.description}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Task Instructions</label>
                        <Textarea
                          value={agentInput}
                          onChange={(e) => setAgentInput(e.target.value)}
                          placeholder="Describe what you want the agent to do..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <Button
                        onClick={handleRunAgent}
                        disabled={agentLoading || !agentInput.trim()}
                        className="w-full"
                      >
                        {agentLoading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Running Agent...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Run Agent
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </ThemedCard>
                </FloatingElement>

                <FloatingElement className="">
                  <ThemedCard elevated className="min-h-[500px]">
                    <CardHeader>
                      <CardTitle>Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LoadingWrapper isLoading={tasksLoading} error={null} success={true} className="" fallback={<CardLoading className="" />}>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                          {agentTasks.map(task => (
                            <div key={task.id} className="p-4 border border-border rounded-lg bg-muted/30">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium capitalize">
                                  {task.agent_name.replace('_', ' ')}
                                </div>
                                <Badge className={getStatusColor(task.status)}>
                                  {task.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {task.task_input}
                              </p>
                              {task.result_summary && (
                                <p className="text-sm text-foreground">
                                  Result: {task.result_summary}
                                </p>
                              )}
                            </div>
                          ))}
                          {agentTasks.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No agent tasks yet. Create your first task to get started!
                            </div>
                          )}
                        </div>
                      </LoadingWrapper>
                    </CardContent>
                  </ThemedCard>
                </FloatingElement>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}