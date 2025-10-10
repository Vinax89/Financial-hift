/**
 * @fileoverview Budget form component for creating and editing monthly budget limits
 * @description Provides a form interface for setting budget limits per category with autosave
 * functionality and validation
 */

import React, { useState } from 'react';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select.jsx';
import { DollarSign, Save, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useAutosave } from '@/utils/formEnhancement.jsx';

/**
 * Budget category options with display labels
 * @type {Array<{value: string, label: string}>}
 */
const categoryOptions = [
    { value: "food_dining", label: "Food & Dining" },
    { value: "groceries", label: "Groceries" },
    { value: "transportation", label: "Transportation" },
    { value: "shopping", label: "Shopping" },
    { value: "entertainment", label: "Entertainment" },
    { value: "bills_utilities", label: "Bills & Utilities" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "travel", label: "Travel" },
    { value: "housing", label: "Housing" },
    { value: "insurance", label: "Insurance" },
    { value: "other_expense", label: "Other" }
];

/**
 * Budget form component with autosave functionality
 * @param {Object} props - Component props
 * @param {Object|null} props.budget - Existing budget to edit (null for new)
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel handler
 * @returns {JSX.Element} Budget form
 */
function BudgetForm({ budget, onSubmit, onCancel }) {
    const now = new Date();
    const [formData, setFormData] = useState(budget || {
        category: '',
        monthly_limit: '',
        year: now.getFullYear(),
        month: now.getMonth() + 1
    });

    /**
     * Save budget data with validation
     */
    const handleSave = () => {
        if (formData.category && formData.monthly_limit) {
            onSubmit({ ...formData, monthly_limit: parseFloat(formData.monthly_limit) });
        }
    };

    /**
     * Autosave hook - saves after 3 seconds of inactivity (edit mode only)
     */
    const { isSaving, lastSaved } = useAutosave(handleSave, {
        delay: 3000,
        enabled: budget !== null,
    });

    /**
     * Handle form submission
     * @param {React.FormEvent} e - Form event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    required
                >
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="monthly_limit" className="text-foreground">Monthly Limit</Label>
                 <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="monthly_limit"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-10"
                        value={formData.monthly_limit}
                        onChange={(e) => setFormData({...formData, monthly_limit: e.target.value})}
                        required
                    />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <Label htmlFor="month" className="text-foreground">Month</Label>
                     <Input id="month" type="text" value={format(new Date(formData.year, formData.month - 1), 'MMMM')} disabled />
                 </div>
                 <div className="space-y-2">
                     <Label htmlFor="year" className="text-foreground">Year</Label>
                     <Input id="year" type="number" value={formData.year} disabled />
                 </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isSaving && (
                        <>
                            <Save className="h-4 w-4 animate-pulse" />
                            <span>Saving...</span>
                        </>
                    )}
                    {!isSaving && lastSaved && (
                        <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{budget ? 'Update Budget' : 'Set Budget'}</Button>
                </div>
            </div>
        </form>
    );
}

export default React.memo(BudgetForm);