import React, { useState } from "react";
import { Button } from "@/ui/button.jsx";
import { Input } from "@/ui/input.jsx";
import { Textarea } from "@/ui/textarea.jsx";
import { Label } from "@/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Calendar } from "@/ui/calendar.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover.jsx";
import { CalendarIcon, DollarSign, X, Save, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { validateTransaction, sanitizeInput } from "@/utils/validation";
import { useToast } from "@/ui/toast.jsx";

const transactionCategories = {
    income: [
        { value: "salary", label: "Salary" },
        { value: "freelance", label: "Freelance" },
        { value: "business", label: "Business Income" },
        { value: "investments", label: "Investment Returns" },
        { value: "gifts", label: "Gifts Received" },
        { value: "other_income", label: "Other Income" }
    ],
    expense: [
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
        { value: "other_expense", label: "Other Expense" }
    ]
};

const accounts = [
    { value: "checking", label: "Checking Account" },
    { value: "savings", label: "Savings Account" },
    { value: "credit_card", label: "Credit Card" },
    { value: "cash", label: "Cash" },
    { value: "investment", label: "Investment Account" }
];

export default function TransactionForm({ transaction, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(transaction || {
        title: "",
        amount: "",
        category: "",
        type: "expense",
        date: format(new Date(), "yyyy-MM-dd"),
        account: "checking",
        notes: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const sanitizedData = {
                ...formData,
                title: sanitizeInput(formData.title),
                notes: sanitizeInput(formData.notes),
                amount: parseFloat(formData.amount)
            };

            const { isValid, errors: validationErrors } = validateTransaction(sanitizedData);
            if (!isValid) {
                setErrors(validationErrors);
                toast.error("Validation Error", "Please fix the highlighted fields");
                return;
            }

            await onSubmit(sanitizedData);
            toast.success(
                transaction ? "Transaction Updated" : "Transaction Created",
                `Successfully ${transaction ? 'updated' : 'added'} transaction`
            );
        } catch (error) {
            toast.error("Error", "Failed to save transaction. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const availableCategories = transactionCategories[formData.type] || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                            Description *
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Lunch at restaurant"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`transition-all duration-200 ${errors.title ? 'border-destructive focus:border-destructive' : ''}`}
                            maxLength={200}
                        />
                        {errors.title && (
                            <div className="flex items-center gap-1 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.title}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
                            Amount *
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1000000"
                                placeholder="0.00"
                                className={`pl-10 transition-all duration-200 ${errors.amount ? 'border-destructive focus:border-destructive' : ''}`}
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                            />
                        </div>
                        {errors.amount && (
                            <div className="flex items-center gap-1 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.amount}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Type *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => {
                                handleChange('type', value);
                                handleChange('category', '');
                            }}
                        >
                            <SelectTrigger className={`transition-all duration-200 ${errors.type ? 'border-destructive' : ''}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">💰 Income</SelectItem>
                                <SelectItem value="expense">💸 Expense</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <div className="flex items-center gap-1 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.type}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Category *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleChange('category', value)}
                        >
                            <SelectTrigger className={`transition-all duration-200 ${errors.category ? 'border-destructive' : ''}`}>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCategories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && (
                            <div className="flex items-center gap-1 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.category}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Account</Label>
                        <Select
                            value={formData.account}
                            onValueChange={(value) => handleChange('account', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.value} value={acc.value}>
                                        {acc.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${errors.date ? 'border-destructive' : ''}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.date ? format(new Date(formData.date), 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.date ? new Date(formData.date) : undefined}
                                    onSelect={(date) => handleChange('date', format(date, 'yyyy-MM-dd'))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date && (
                            <div className="flex items-center gap-1 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.date}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional notes (optional)"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="resize-none transition-all duration-200"
                            rows={3}
                            maxLength={500}
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {(formData.notes || '').length}/500
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="transition-all duration-200"
                    >
                        {isSubmitting ? (
                            <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                    <Save className="mr-2 h-4 w-4" />
                                </motion.div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {transaction ? "Update Transaction" : "Add Transaction"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}