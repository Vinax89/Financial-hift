/**
 * @fileoverview Data import/export and AI-powered cleaning manager
 * @description Manages data operations including JSON/CSV import via Data Parser agent,
 * snapshot exports, and automated data cleaning via Error Corrector agent
 */

import React, { useRef, useState, memo } from 'react';
import { logError } from '@/utils/logger';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Button } from '@/ui/button';
import { useToast } from '@/ui/use-toast';
import { Download, Upload, Server, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useFinancialData } from '../hooks/useFinancialData';
import { ThemedCard } from '../ui/enhanced-components';
import { CardHeader, CardTitle, CardContent } from '@/ui/card';
import { agentSDK } from '@/agents';
import { AgentTask } from '@/api/entities';

/**
 * Entity mappings for export operations
 * @constant {Object}
 */
const ENTITIES_FOR_EXPORT = {
    Transaction: useFinancialData.transactions, Shift: useFinancialData.shifts, Goal: useFinancialData.goals, DebtAccount: useFinancialData.debts, Budget: useFinancialData.budgets, Bill: useFinancialData.bills, Investment: useFinancialData.investments
};

/**
 * Data Manager Component
 * @component
 * @description Handles data import/export and AI-powered data cleaning operations
 * @returns {JSX.Element}
 */
function DataManager() {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const { refreshData, ...allData } = useFinancialData();

    const handleExport = async () => {
        // ... (existing export logic, slightly modified)
        setIsProcessing(true);
        toast({ title: "Exporting Data", description: "Gathering your financial snapshot..." });
        
        try {
            const snapshot = {};
            for (const key in ENTITIES_FOR_EXPORT) {
                if (allData[key.toLowerCase()]) {
                    snapshot[key] = allData[key.toLowerCase()];
                }
            }
            // ... (rest of existing export logic)
        } catch (error) {
            if (import.meta.env.DEV) logError('Export failed', error);
            toast({ title: "Export Failed", description: "Could not export your data.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        toast({ title: "Engaging Data Parser Agent...", description: "Your file is being intelligently analyzed." });

        const task = await AgentTask.create({
            agent_name: 'data_parser',
            task_input: `Parse and import the uploaded file: ${file.name}`,
            status: 'running'
        });

        // This is a simplified simulation. A real implementation would upload the file
        // and pass the URL to the agent.
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Simulate agent parsing
                const conversation = await agentSDK.createConversation({ agent_name: 'data_parser' });
                await agentSDK.addMessage(conversation, {
                    role: 'user',
                    content: `Parse the following CSV data and create the necessary Transaction records. Data: \n${e.target.result}`
                });
                
                await AgentTask.update(task.id, { status: 'completed', result_summary: 'File parsed and data imported.' });
                toast({ title: "Data Parser Finished", description: "Your data has been imported. Refreshing app data." });
                refreshData();
            } catch (error) {
                 await AgentTask.update(task.id, { status: 'failed', result_summary: 'Agent failed to parse file.' });
                toast({ title: "Import Failed", description: "The Data Parser agent could not process the file.", variant: "destructive" });
            } finally {
                setIsProcessing(false);
                event.target.value = null;
            }
        };
        reader.readAsText(file);
    };

    const handleDataCleaning = async () => {
        setIsCleaning(true);
        toast({ title: "Engaging Error Corrector Agent...", description: "Scanning for duplicates and anomalies." });
        
        const task = await AgentTask.create({
            agent_name: 'error_corrector',
            task_input: 'Scan all transactions for duplicates and potential categorization errors. Report findings.',
            status: 'running'
        });

        try {
            const conversation = await agentSDK.createConversation({ agent_name: 'error_corrector' });
            const response = await agentSDK.addMessage(conversation, {
                role: 'user',
                content: task.task_input
            });
            const finalMessage = response.messages[response.messages.length - 1];
            
            await AgentTask.update(task.id, {
                status: 'completed',
                result_summary: finalMessage.content
            });
            
            toast({ title: "Data Audit Complete", description: "Error Corrector has finished its scan. Check the Automations tab for results." });
            refreshData();
        } catch (error) {
             await AgentTask.update(task.id, { status: 'failed', result_summary: 'Agent failed to complete audit.' });
             toast({ title: "Data Audit Failed", variant: "destructive" });
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <ThemedCard elevated className="md:col-span-2">
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json,.csv"
                onChange={handleFileChange}
            />
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-primary" />Data & Automation Hub</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={handleImportClick} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Smart Import
                </Button>
                <Button variant="outline" onClick={handleExport} disabled={isProcessing}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Snapshot
                </Button>
                <Button onClick={handleDataCleaning} disabled={isCleaning} className="bg-green-600 hover:bg-green-700 text-white">
                    {isCleaning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                    Clean My Data
                </Button>
            </CardContent>
        </ThemedCard>
    );
}

export default memo(DataManager);
