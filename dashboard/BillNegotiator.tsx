/**
 * @fileoverview AI-powered bill negotiation script generator
 * @description Generates personalized negotiation scripts for lowering bills
 * using LLM integration with markdown formatting
 */

import React, { useState, memo } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { logError } from '@/utils/logger';
import { Textarea } from '@/ui/textarea';
import { Label } from '@/ui/label';
import { InvokeLLM } from '@/api/integrations';
import { MessageSquare, Sparkles, Loader2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/ui/use-toast';
import { ThemedCard } from '../ui/enhanced-components';

/**
 * Bill Negotiator Component
 * @component
 * @param {Object} props
 * @param {Array} props.bills - List of bills (unused currently)
 * @returns {JSX.Element}
 */
function BillNegotiator({ bills }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        provider: '',
        billType: '',
        issue: 'My bill is too high and I want to lower it.'
    });
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const generateScript = async () => {
        if (!formData.provider || !formData.billType || !formData.issue) {
            toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive"});
            return;
        }
        setIsLoading(true);
        setScript('');
        try {
            const prompt = `
                Act as an expert bill negotiator. Create a polite but firm script for me to read to a customer service representative.
                My service provider is: ${formData.provider}
                The bill is for: ${formData.billType}
                My issue is: "${formData.issue}"
                
                The script should include:
                1. A clear opening stating the purpose of the call.
                2. Mentioning I am a loyal customer (if applicable).
                3. Clearly stating my issue and desired outcome (e.g., lower bill, remove charge).
                4. A point where I can ask about available promotions or retention offers.
                5. A polite closing, summarizing the agreement or next steps.
                
                Format the response in markdown, using headings for different parts of the conversation (e.g., Opening, Stating the Problem, The Ask, Closing).
            `;
            const response = await InvokeLLM({ prompt });
            setScript(response);
        } catch (error) {
            toast({ title: "Error", description: "Failed to generate script.", variant: "destructive"});
            if (import.meta.env.DEV) logError('Failed to generate negotiation script', error);
        }
        setIsLoading(false);
    };

    const copyScript = () => {
        navigator.clipboard.writeText(script);
        toast({ title: "Copied!", description: "Negotiation script copied to clipboard." });
    };

    return (
        <ThemedCard elevated>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    Bill Negotiation Helper
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="provider">Service Provider</Label>
                        <Input id="provider" value={formData.provider} onChange={(e) => handleChange('provider', e.target.value)} placeholder="e.g., Comcast, Verizon" />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="billType">Bill Type</Label>
                        <Input id="billType" value={formData.billType} onChange={(e) => handleChange('billType', e.target.value)} placeholder="e.g., Internet, Phone" />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="issue">Your Issue</Label>
                    <Textarea id="issue" value={formData.issue} onChange={(e) => handleChange('issue', e.target.value)} />
                </div>
                <Button onClick={generateScript} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Negotiation Script
                </Button>

                {script && (
                    <div className="p-4 bg-muted rounded-lg border border-border relative group">
                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={copyScript}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{script}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </CardContent>
        </ThemedCard>
    );
}

export default memo(BillNegotiator);
