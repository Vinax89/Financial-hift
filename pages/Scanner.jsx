
import React from 'react';
import { logInfo } from '@/utils/logger.js';
import ReceiptScanner from '@/scanning/ReceiptScanner';
import { useFinancialData } from '@/hooks/useFinancialData';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { Scan, Camera, FileText, Zap } from 'lucide-react';
import { CardContent } from '@/ui/card';

export default function ScannerPage() {
    const { refreshData } = useFinancialData();

    const handleTransactionAdded = (transaction) => {
        logInfo('New transaction from scan', { transaction });
    };

    const handleBillAdded = (bill) => {
        logInfo('New bill from scan', { bill });
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <GlassContainer className="p-6">
                    <header>
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <Scan className="h-8 w-8" />
                                        Smart Receipt Scanner
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">
                                    AI-powered OCR scanning for receipts, bills, and financial documents
                                </p>
                            </div>
                        </FloatingElement>
                    </header>
                </GlassContainer>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Scanner */}
                    <div className="lg:col-span-2 min-h-[500px]">
                        <FloatingElement>
                            <ReceiptScanner
                                onTransactionAdded={handleTransactionAdded}
                                onBillAdded={handleBillAdded}
                                refreshData={refreshData}
                            />
                        </FloatingElement>
                    </div>

                    {/* Info Panel */}
                    <div className="space-y-6">
                        <FloatingElement>
                            <ThemedCard>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-primary" />
                                        AI Features
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Camera className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Smart OCR</p>
                                                <p className="text-muted-foreground">Advanced text recognition with 95%+ accuracy</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Auto Categorization</p>
                                                <p className="text-muted-foreground">Intelligent expense categorization</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Scan className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Data Parser Agent</p>
                                                <p className="text-muted-foreground">AI refinement and error correction</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </ThemedCard>
                        </FloatingElement>

                        <FloatingElement>
                            <ThemedCard>
                                <CardContent className="p-6 space-y-3">
                                    <h3 className="font-semibold">Supported Formats</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>ðŸ“± Mobile Camera Capture</p>
                                        <p>ðŸ–¼ï¸ JPEG, PNG, WebP Images</p>
                                        <p>ðŸ“„ PDF Documents</p>
                                        <p>ðŸ“Š Up to 10MB file size</p>
                                    </div>
                                </CardContent>
                            </ThemedCard>
                        </FloatingElement>
                    </div>
                </div>
            </div>
        </div>
    );
}
