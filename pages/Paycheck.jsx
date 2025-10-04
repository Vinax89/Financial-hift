
import React from 'react';
import PaycheckCalculator from '@/paycheck/PaycheckCalculator.jsx';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components.jsx';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations.jsx';
import { Calculator } from 'lucide-react';

export default function PaycheckPage() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <GlassContainer className="p-6">
                    <header>
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <Calculator className="h-8 w-8" />
                                        Paycheck Calculator
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Estimate your take-home pay with detailed breakdowns.</p>
                            </div>
                        </FloatingElement>
                    </header>
                </GlassContainer>

                <FloatingElement>
                    <ThemedCard elevated className="min-h-[500px]">
                        <PaycheckCalculator />
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
