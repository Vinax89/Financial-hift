// @ts-nocheck
/**
 * @fileoverview BNPL plan form component for creating and editing plans
 * @description Comprehensive form for managing Buy Now Pay Later payment plans
 */

import React, { useState } from "react";
import type { BNPLPlan, BNPLPlanFormData, BNPLPlanFormProps } from "./types";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Textarea } from "@/ui/textarea";
import { X, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

/**
 * BNPL provider options
 * @type {Array<{value: string, label: string}>}
 */
const providers = [
    { value: "klarna", label: "Klarna" },
    { value: "afterpay", label: "Afterpay" },
    { value: "affirm", label: "Affirm" },
    { value: "paypal", label: "PayPal Pay in 4" },
    { value: "sezzle", label: "Sezzle" },
    { value: "quadpay", label: "Zip (Quadpay)" },
    { value: "other", label: "Other" }
];

/**
 * Payment frequency options
 * @type {Array<{value: string, label: string}>}
 */
const frequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Every 2 weeks" },
    { value: "monthly", label: "Monthly" }
];

/**
 * Plan status options
 * @type {Array<{value: string, label: string}>}
 */
const statuses = [
    { value: "active", label: "Active" },
    { value: "paid", label: "Paid Off" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" }
];

/**
 * BNPL plan form component
 * @param {Object} props - Component props
 * @param {Object|null} props.plan - Existing plan to edit (null for new)
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel handler
 * @returns {JSX.Element} Plan form
 */


function BNPLPlanForm({ plan, onSubmit, onCancel }: BNPLPlanFormProps) {
    const [formData, setFormData] = useState<BNPLPlanFormData>(plan || {
        provider: "",
        merchant: "",
        principal_amount: "",
        installment_amount: "",
        total_installments: 4,
        remaining_installments: 4,
        first_payment_date: new Date().toISOString().split('T')[0],
        payment_frequency: "biweekly",
        next_due_date: new Date().toISOString().split('T')[0],
        status: "active",
        notes: ""
    });

    /**
     * Handle form submission with data parsing
     * @param {React.FormEvent} e - Form event
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            principal_amount: formData.principal_amount ? parseFloat(String(formData.principal_amount)) : 0,
            installment_amount: formData.installment_amount ? parseFloat(String(formData.installment_amount)) : 0,
            total_installments: formData.total_installments ? parseInt(String(formData.total_installments)) : 0,
            remaining_installments: formData.remaining_installments ? parseInt(String(formData.remaining_installments)) : 0
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="border shadow-xl bg-card backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-foreground">
                        {plan ? "Edit BNPL Plan" : "Add New BNPL Plan"}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="provider" className="text-foreground">Provider</Label>
                                <Select
                                    value={formData.provider}
                                    onValueChange={(value) => setFormData({...formData, provider: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.map((provider) => (
                                            <SelectItem key={provider.value} value={provider.value}>
                                                {provider.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="merchant" className="text-foreground">Merchant/Store</Label>
                                <Input
                                    id="merchant"
                                    placeholder="e.g., Amazon, Target"
                                    value={formData.merchant}
                                    onChange={(e: any): any => setFormData({...formData, merchant: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="principal_amount" className="text-foreground">Purchase Amount</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="principal_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="pl-10"
                                        value={formData.principal_amount}
                                        onChange={(e: any): any => setFormData({...formData, principal_amount: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="installment_amount" className="text-foreground">Payment Amount</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="installment_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="pl-10"
                                        value={formData.installment_amount}
                                        onChange={(e: any): any => setFormData({...formData, installment_amount: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_installments" className="text-foreground">Total Payments</Label>
                                <Input
                                    id="total_installments"
                                    type="number"
                                    min="1"
                                    value={formData.total_installments}
                                    onChange={(e: any): any => setFormData({...formData, total_installments: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remaining_installments" className="text-foreground">Payments Left</Label>
                                <Input
                                    id="remaining_installments"
                                    type="number"
                                    min="0"
                                    value={formData.remaining_installments}
                                    onChange={(e: any): any => setFormData({...formData, remaining_installments: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_frequency" className="text-foreground">Payment Schedule</Label>
                                <Select
                                    value={formData.payment_frequency}
                                    onValueChange={(value) => setFormData({...formData, payment_frequency: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {frequencies.map((freq) => (
                                            <SelectItem key={freq.value} value={freq.value}>
                                                {freq.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="next_due_date" className="text-foreground">Next Payment Due</Label>
                                <Input
                                    id="next_due_date"
                                    type="date"
                                    value={formData.next_due_date}
                                    onChange={(e: any): any => setFormData({...formData, next_due_date: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-foreground">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({...formData, status: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-foreground">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Additional details..."
                                value={formData.notes}
                                onChange={(e: any): any => setFormData({...formData, notes: e.target.value})}
                                className="h-20"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-primary hover:bg-primary/90"
                            >
                                {plan ? 'Update' : 'Add'} Plan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default React.memo(BNPLPlanForm);
