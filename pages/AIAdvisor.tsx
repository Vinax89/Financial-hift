// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Loader2, Brain, ChevronDown } from 'lucide-react';
import { agentSDK } from '@/agents';
import { Button } from '@/ui/button';
import { Textarea } from '@/ui/textarea';
import MessageBubble from '@/agents/MessageBubble';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { logError } from '@/utils/logger.js';

const QUICK_PROMPTS = [
  "Analyze my spending from last month.",
  "What's my biggest expense category?",
  "How can I save more money?",
  "Forecast my income for the next 30 days."
];

export default function AIAdvisorPage() {
    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const initConversation = async () => {
            setIsLoading(true);
            try {
                const conv = await agentSDK.createConversation({
                    agent_name: "financial_advisor"
                });
                setConversation(conv);
                if (conv.messages) {
                    setMessages(conv.messages);
                }
            } catch (error) {
                logError('Failed to initialize conversation', error);
            }
            setIsLoading(false);
        };
        initConversation();
    }, []);

    useEffect(() => {
        if (!conversation) return;
        const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => {
            setMessages(data.messages);
            setIsLoading(data.status === 'running');
        });
        return () => unsubscribe();
    }, [conversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (prompt) => {
        const content = typeof prompt === 'string' ? prompt : input;
        if (!content.trim() || !conversation) return;

        setInput('');
        setIsLoading(true);
        await agentSDK.addMessage(conversation, { role: 'user', content });
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
                <GlassContainer className="p-6 mb-8">
                    <header>
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <Sparkles className="h-8 w-8 text-primary" />
                                        AI Financial Advisor
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Your personal AI-powered financial guide.</p>
                            </div>
                        </FloatingElement>
                    </header>
                </GlassContainer>

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
                                onChange={(e: any) => setInput(e.target.value)}
                                placeholder="Ask your financial question..."
                                className="pr-12"
                                onKeyDown={(e: any) => {
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
            </div>
        </div>
    );
}
