import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { format } from 'date-fns';

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

export default function BudgetForm({ budget, onSubmit, onCancel }) {
    const now = new Date();
    const [formData, setFormData] = useState(budget || {
        category: '',
        monthly_limit: '',
        year: now.getFullYear(),
        month: now.getMonth() + 1
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, monthly_limit: parseFloat(formData.monthly_limit) });
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

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{budget ? 'Update Budget' : 'Set Budget'}</Button>
            </div>
        </form>
    );
}