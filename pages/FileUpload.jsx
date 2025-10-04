
import React from 'react';
import ShiftImport from '@/shifts/ShiftImport';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { Upload } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

export default function FileUploadPage() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <GlassContainer className="p-6">
                    <header>
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <Upload className="h-8 w-8" />
                                        Import Schedule
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Bulk upload your shifts from a CSV file.</p>
                            </div>
                        </FloatingElement>
                    </header>
                </GlassContainer>

                <FloatingElement>
                    <ThemedCard elevated className="min-h-[400px]">
                        <CardContent className="p-6">
                            <ShiftImport />
                        </CardContent>
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
