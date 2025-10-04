import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Plus, Send, RefreshCw, Layers, ShieldCheck, Bug, GitBranch, MessageSquare, AlertCircle, Brain, TrendingUp, Terminal, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { agentSDK } from '@/agents';
import MessageBubble from '@/agents/MessageBubble';

const AGENT_CONFIGS = {
    financial_orchestrator: {
        name: 'Financial Orchestrator',
        icon: Layers,
        description: 'Master coordinator for complex financial strategies and multi-step planning',
        color: 'text-purple-600 dark:text-purple-400',
        category: 'Strategy & Planning'
    },
    data_parser: {
        name: 'Data Parser',
        icon: Bug,
        description: 'Advanced data extraction and structuring from any financial document',
        color: 'text-blue-600 dark:text-blue-400',
        category: 'Data Processing'
    },
    financial_interpolator: {
        name: 'Financial Interpolator',
        icon: GitBranch,
        description: 'Predictive modeling and forecasting for financial scenarios',
        color: 'text-green-600 dark:text-green-400',
        category: 'Analysis & Prediction'
    },
    financial_interop: {
        name: 'Financial Interop',
        icon: MessageSquare,
        description: 'Universal connectivity between financial platforms and data formats',
        color: 'text-cyan-600 dark:text-cyan-400',
        category: 'Integration'
    },
    error_corrector: {
        name: 'Error Corrector',
        icon: ShieldCheck,
        description: 'Autonomous data auditing and error correction',
        color: 'text-red-600 dark:text-red-400',
        category: 'Quality Assurance'
    },
    financial_watchdog: {
        name: 'Financial Watchdog',
        icon: AlertCircle,
        description: 'Proactive monitoring for fraud and financial risks',
        color: 'text-orange-600 dark:text-orange-400',
        category: 'Security & Monitoring'
    },
    adaptive_mentor: {
        name: 'Adaptive Mentor',
        icon: Brain,
        description: 'Self-learning AI mentor for personalized financial education',
        color: 'text-indigo-600 dark:text-indigo-400',
        category: 'Learning & Growth'
    },
    learning_optimizer: {
        name: 'Learning Optimizer',
        icon: TrendingUp,
        description: 'Meta-AI that optimizes the entire agent ecosystem',
        color: 'text-pink-600 dark:text-pink-400',
        category: 'System Optimization'
    }
};

const AGENT_CATEGORIES = {
    'Strategy & Planning': ['financial_orchestrator'],
    'Data Processing': ['data_parser'],
    'Analysis & Prediction': ['financial_interpolator'],
    'Integration': ['financial_interop'],
    'Quality Assurance': ['error_corrector'],
    'Security & Monitoring': ['financial_watchdog'],
    'Learning & Growth': ['adaptive_mentor'],
    'System Optimization': ['learning_optimizer']
};

export default function AgentsPage() {
    const [selectedAgent, setSelectedAgent] = useState('financial_orchestrator');
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const messagesEndRef = useRef(null);
    const { toast } = useToast();

    const currentAgentConfig = AGENT_CONFIGS[selectedAgent];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversations = useCallback(async () => {
        setIsInitializing(true);
        try {
            const convos = await agentSDK.listConversations({ agent_name: selectedAgent });
            setConversations(convos || []);
            
            if (convos && convos.length > 0) {
                const latestConvo = convos[0];
                setActiveConversation(latestConvo);
                setMessages(latestConvo.messages || []);
            } else {
                await createNewConversation();
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
            toast({
                title: 'Connection Issue',
                description: 'Failed to connect to agent. Creating new session...',
                variant: 'destructive'
            });
            await createNewConversation();
        } finally {
            setIsInitializing(false);
        }
    }, [selectedAgent, toast]);

    const createNewConversation = useCallback(async () => {
        try {
            const conversation = await agentSDK.createConversation({
                agent_name: selectedAgent,
                metadata: {
                    name: `${currentAgentConfig.name} Session`,
                    description: `New session with ${currentAgentConfig.name}`,
                    created_at: new Date().toISOString()
                }
            });
            
            setActiveConversation(conversation);
            setConversations(prev => [conversation, ...prev]);
            setMessages([]);
            
            // Send welcome message
            const welcomeResponse = await agentSDK.addMessage(conversation, {
                role: 'user',
                content: `Hello! I'd like to start working with the ${currentAgentConfig.name}. Please introduce yourself and let me know how you can help.`
            });
            
            setMessages(welcomeResponse.messages || []);
            
        } catch (error) {
            console.error('Failed to create conversation:', error);
            toast({
                title: 'Error',
                description: 'Failed to create new conversation',
                variant: 'destructive'
            });
        }
    }, [selectedAgent, currentAgentConfig, toast]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation) return;

        const userMessage = newMessage.trim();
        setNewMessage('');
        setIsLoading(true);

        try {
            const updatedConversation = await agentSDK.addMessage(activeConversation, {
                role: 'user',
                content: userMessage
            });

            setMessages(updatedConversation.messages || []);
            setActiveConversation(updatedConversation);

        } catch (error) {
            console.error('Failed to send message:', error);
            toast({
                title: 'Message Failed',
                description: 'Failed to send message. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const switchConversation = (conversation) => {
        setActiveConversation(conversation);
        setMessages(conversation.messages || []);
    };

    if (isInitializing) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Terminal className="w-12 h-12 animate-pulse text-primary" />
                    <div className="text-lg font-semibold">Initializing Agent Console...</div>
                    <div className="text-sm text-muted-foreground">Connecting to {currentAgentConfig.name}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background text-foreground font-sans">
            <header className="p-4 border-b border-border/80 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Terminal className="w-7 h-7 text-primary" />
                    <div>
                        <h1 className="text-xl font-bold">Agent Console</h1>
                        <p className="text-sm text-muted-foreground">Manual interaction with specialized AI agents</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-64">
                            <SelectValue>
                                <div className="flex items-center gap-2">
                                    <currentAgentConfig.icon className={`w-4 h-4 ${currentAgentConfig.color}`} />
                                    <span>{currentAgentConfig.name}</span>
                                </div>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(AGENT_CATEGORIES).map(([category, agentIds]) => (
                                <div key={category}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {category}
                                    </div>
                                    {agentIds.map(agentId => {
                                        const config = AGENT_CONFIGS[agentId];
                                        return (
                                            <SelectItem key={agentId} value={agentId}>
                                                <div className="flex items-center gap-2">
                                                    <config.icon className={`w-4 h-4 ${config.color}`} />
                                                    <span>{config.name}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                    <Separator className="my-1" />
                                </div>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm" onClick={createNewConversation}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Session
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex min-h-0">
                {/* Sidebar with conversations */}
                <div className="w-80 border-r border-border/80 bg-card/50">
                    <div className="p-4 border-b border-border/60">
                        <div className="flex items-center gap-2 mb-3">
                            <currentAgentConfig.icon className={`w-5 h-5 ${currentAgentConfig.color}`} />
                            <h3 className="font-semibold">{currentAgentConfig.name}</h3>
                        </div>
                        <Badge variant="outline" className="mb-2">{currentAgentConfig.category}</Badge>
                        <p className="text-xs text-muted-foreground">{currentAgentConfig.description}</p>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-2">
                            {conversations.map((conversation, index) => (
                                <button
                                    key={conversation.id || index}
                                    onClick={() => switchConversation(conversation)}
                                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent/80 ${
                                        activeConversation?.id === conversation.id 
                                            ? 'bg-accent border border-border' 
                                            : 'hover:bg-accent/40'
                                    }`}
                                >
                                    <div className="font-medium text-sm truncate">
                                        {conversation.metadata?.name || `Session ${index + 1}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {conversation.messages?.length || 0} messages
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main chat area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <ScrollArea className="flex-1 p-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <currentAgentConfig.icon className={`w-16 h-16 mx-auto mb-4 ${currentAgentConfig.color} opacity-50`} />
                                    <h3 className="text-lg font-semibold mb-2">Ready to assist</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        Start a conversation with {currentAgentConfig.name} to get specialized help with {currentAgentConfig.description.toLowerCase()}.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <MessageBubble key={`${message.id || index}-${message.role}`} message={message} />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input area */}
                    <div className="border-t border-border/80 p-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={`Ask ${currentAgentConfig.name} anything...`}
                                        disabled={isLoading}
                                        className="pr-12"
                                    />
                                    {isLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    onClick={sendMessage} 
                                    disabled={!newMessage.trim() || isLoading}
                                    size="icon"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                                <span>Press Enter to send, Shift+Enter for new line</span>
                                <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Powered by {currentAgentConfig.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}