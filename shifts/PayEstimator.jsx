/**
 * @fileoverview Pay estimator component for calculating shift earnings
 * @description Interactive calculator for estimating gross and net pay with differentials and premiums
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Checkbox } from '@/ui/checkbox';
import { Calculator, X, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Pay estimator component with differentials and overtime calculation
 * @param {Object} props - Component props
 * @param {Array<Object>} props.shiftRules - Shift rules with base rates
 * @param {Function} props.onCancel - Close handler
 * @returns {JSX.Element} Pay estimator calculator
 */
function PayEstimator({ shiftRules, onCancel }) {
    const [estimateData, setEstimateData] = useState({
        hours: '8',
        tags: [],
        base_rate: shiftRules?.[0]?.base_hourly_rate || 25
    });

    const [estimate, setEstimate] = useState({ gross: 0, net: 0 });

    /**
     * Available shift differentials and premiums
     * @type {Array<{id: string, label: string, multiplier?: number, amount?: number}>}
     */
    const availableTags = [
        { id: "night", label: "Night Shift", multiplier: 1.1 },
        { id: "weekend", label: "Weekend", multiplier: 1.05 },
        { id: "holiday", label: "Holiday", multiplier: 1.5 },
        { id: "charge", label: "Charge Nurse", amount: 2 },
        { id: "call", label: "On-Call", amount: 1 },
        { id: "hazard", label: "Hazard Pay", amount: 3 }
    ];

    /**
     * Calculate gross and net pay based on hours, rate, and differentials
     */
    const calculateEstimate = useCallback(() => {
        const hours = parseFloat(estimateData.hours) || 0;
        const baseRate = parseFloat(estimateData.base_rate) || 0;
        let gross = hours * baseRate;

        // Apply differentials
        estimateData.tags.forEach(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            if (tag) {
                if (tag.multiplier) {
                    gross *= tag.multiplier;
                } else if (tag.amount) {
                    gross += hours * tag.amount;
                }
            }
        });

        // Apply overtime if over 40 hours (simplified)
        if (hours > 8) {
            const overtimeHours = hours - 8;
            const regularHours = 8;
            gross = (regularHours * baseRate) + (overtimeHours * baseRate * 1.5);
        }

        const net = gross * 0.73; // Simplified net calculation
        setEstimate({ gross, net });
    }, [estimateData.hours, estimateData.base_rate, estimateData.tags]);

    React.useEffect(() => {
        calculateEstimate();
    }, [calculateEstimate]);

    /**
     * Toggle shift differential/premium tag
     * @param {string} tagId - Tag identifier
     */
    const handleTagToggle = (tagId) => {
        const newTags = estimateData.tags.includes(tagId)
            ? estimateData.tags.filter(t => t !== tagId)
            : [...estimateData.tags, tagId];
        setEstimateData({...estimateData, tags: newTags});
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Quick Pay Estimator
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="hours">Hours to Work</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    id="hours"
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    placeholder="8.0"
                                    className="pl-10"
                                    value={estimateData.hours}
                                    onChange={(e) => setEstimateData({...estimateData, hours: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="base_rate">Hourly Rate</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    id="base_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="25.00"
                                    className="pl-10"
                                    value={estimateData.base_rate}
                                    onChange={(e) => setEstimateData({...estimateData, base_rate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Differentials & Premiums</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {availableTags.map((tag) => (
                                <div key={tag.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={tag.id}
                                        checked={estimateData.tags.includes(tag.id)}
                                        onCheckedChange={() => handleTagToggle(tag.id)}
                                    />
                                    <Label htmlFor={tag.id} className="text-sm">
                                        {tag.label}
                                        {tag.multiplier && (
                                            <span className="text-xs text-slate-500 ml-1">
                                                (+{((tag.multiplier - 1) * 100).toFixed(0)}%)
                                            </span>
                                        )}
                                        {tag.amount && (
                                            <span className="text-xs text-slate-500 ml-1">
                                                (+${tag.amount}/hr)
                                            </span>
                                        )}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                        <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Pay Estimate
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <p className="text-sm text-emerald-700 mb-1">Gross Pay</p>
                                <p className="text-2xl font-bold text-emerald-900">
                                    ${estimate.gross.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-emerald-700 mb-1">Net Pay (Est.)</p>
                                <p className="text-2xl font-bold text-emerald-900">
                                    ${estimate.net.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-600 text-center mt-3">
                            Estimates include differentials and simplified tax withholding
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={onCancel} className="bg-emerald-600 hover:bg-emerald-700">
                            Close Calculator
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default React.memo(PayEstimator);
