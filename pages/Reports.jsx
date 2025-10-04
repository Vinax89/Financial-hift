
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs.jsx';
import IncomeStatement from '@/reports/IncomeStatement.jsx';
import BalanceSheet from '@/reports/BalanceSheet.jsx';
import CashFlowStatement from '@/reports/CashFlowStatement.jsx';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components.jsx';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations.jsx';
import { BarChart3 } from 'lucide-react';
import { CardContent } from '@/ui/card.jsx';

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <GlassContainer className="p-6">
                    <header>
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <BarChart3 className="h-8 w-8" />
                                        Financial Reports
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Generate formal financial statements.</p>
                            </div>
                        </FloatingElement>
                    </header>
                </GlassContainer>

                <FloatingElement>
                    <ThemedCard elevated className="min-h-[600px]">
                        <CardContent className="p-6">
                            <Tabs defaultValue="income">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="income">Income Statement</TabsTrigger>
                                    <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
                                    <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                                </TabsList>
                                <TabsContent value="income" className="mt-6">
                                    <IncomeStatement />
                                </TabsContent>
                                <TabsContent value="balance" className="mt-6">
                                    <BalanceSheet />
                                </TabsContent>
                                <TabsContent value="cashflow" className="mt-6">
                                    <CashFlowStatement />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
