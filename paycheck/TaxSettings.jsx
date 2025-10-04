import React, { useState, useEffect } from "react";
import { Button } from "@/ui/button.jsx";
import { Input } from "@/ui/input.jsx";
import { Label } from "@/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Badge } from "@/ui/badge.jsx";
import { FileSliders, Save, DollarSign } from "lucide-react";
import { Skeleton } from "@/ui/skeleton.jsx";

export default function TaxSettings({ settings, onUpdate, isLoading }) {
    const [localSettings, setLocalSettings] = useState(settings || {});
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        setLocalSettings(settings || {
            filing_status: 'single',
            tax_state: '',
            federal_allowances: 1,
            state_allowances: 1,
            additional_federal_withholding: 0,
            additional_state_withholding: 0,
            pre_tax_deductions: 0,
            post_tax_deductions: 0
        });
        setIsModified(false);
    }, [settings]);

    const handleUpdate = () => {
        onUpdate(localSettings);
        setIsModified(false);
    };

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setIsModified(true);
    };
    
    if (isLoading) {
        return (
             <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileSliders className="h-5 w-5" />
                    Tax & Deduction Settings
                </CardTitle>
                {isModified && (
                    <Badge variant="destructive">Unsaved changes</Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="filing_status">Filing Status</Label>
                        <Select
                            value={localSettings.filing_status || 'single'}
                            onValueChange={(value) => handleChange('filing_status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married_jointly">Married Filing Jointly</SelectItem>
                                <SelectItem value="married_separately">Married Filing Separately</SelectItem>
                                <SelectItem value="head_of_household">Head of Household</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tax_state">State</Label>
                        <Input
                            id="tax_state"
                            placeholder="e.g., CA, NY"
                            value={localSettings.tax_state || ''}
                            onChange={(e) => handleChange('tax_state', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pre_tax_deductions">Pre-Tax Deductions</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                id="pre_tax_deductions"
                                type="number"
                                step="1"
                                placeholder="0.00"
                                className="pl-10"
                                value={localSettings.pre_tax_deductions || ''}
                                onChange={(e) => handleChange('pre_tax_deductions', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="post_tax_deductions">Post-Tax Deductions</Label>
                         <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                id="post_tax_deductions"
                                type="number"
                                step="1"
                                placeholder="0.00"
                                className="pl-10"
                                value={localSettings.post_tax_deductions || ''}
                                onChange={(e) => handleChange('post_tax_deductions', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
                
                <Button 
                    onClick={handleUpdate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={!isModified}
                >
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                </Button>
            </CardContent>
        </Card>
    );
}