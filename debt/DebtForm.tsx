// @ts-nocheck
/**
 * @fileoverview Debt account creation and editing form with autosave
 * @description Form for managing debt accounts with validation, autosave,
 * and support for balance, interest rate, and minimum payment tracking
 */

import React, { useEffect, useState, memo } from 'react';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Save, Check } from 'lucide-react';
import { useAutosave } from '@/utils/formEnhancement';

/**
 * Default debt form state
 * @constant {Object}
 */
const defaultDebt = {
    name: '',
    balance: '',
    interest_rate: '',
    minimum_payment: '',
    status: 'active'
};

/**
 * Safely convert value to number
 * @param {*} value - Value to convert
 * @returns {number} Parsed number or 0
 */
const toNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Debt Form Component
 * @component
 * @param {Object} props
 * @param {Object} [props.debt] - Existing debt to edit (null for new)
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel handler
 * @returns {JSX.Element}
 */
function DebtForm({ debt, onSubmit, onCancel}) {
    const [formState, setFormState] = useState(defaultDebt);

    useEffect(() => {
        if (debt) {
            setFormState({
                name: debt.name || debt.account_name || '',
                balance: debt.balance ?? '',
                interest_rate: debt.interest_rate ?? '',
                minimum_payment: debt.minimum_payment ?? '',
                status: debt.status || 'active'
            });
        } else {
            setFormState(defaultDebt);
        }
    }, [debt]);

    const handleChange = (field) => (event) => {
        const value = event?.target ? event.target.value : event;
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (formState.name && formState.balance) {
            onSubmit?.({
                name: formState.name.trim(),
                balance: toNumber(formState.balance),
                interest_rate: toNumber(formState.interest_rate),
                minimum_payment: toNumber(formState.minimum_payment),
                status: formState.status
            });
        }
    };

    const { isSaving, lastSaved } = useAutosave(handleSave, {
        delay: 3000,
        enabled: debt !== null && debt !== undefined,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        handleSave();
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
                <Label htmlFor="debt-name">Account Name</Label>
                <Input
                    id="debt-name"
                    value={formState.name}
                    onChange={handleChange('name')}
                    placeholder="Credit Card"
                    required
                />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="debt-balance">Balance</Label>
                    <Input
                        id="debt-balance"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.balance}
                        onChange={handleChange('balance')}
                        placeholder="2500"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="debt-interest">Interest Rate (%)</Label>
                    <Input
                        id="debt-interest"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.interest_rate}
                        onChange={handleChange('interest_rate')}
                        placeholder="19.99"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="debt-minimum">Minimum Payment</Label>
                    <Input
                        id="debt-minimum"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.minimum_payment}
                        onChange={handleChange('minimum_payment')}
                        placeholder="75"
                    />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="debt-status">Status</Label>
                <Select value={formState.status} onValueChange={handleChange('status')}>
                    <SelectTrigger id="debt-status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-between items-center">
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
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => onCancel?.()}>
                        Cancel
                    </Button>
                    <Button type="submit">{debt ? 'Update Debt' : 'Add Debt'}</Button>
                </div>
            </div>
        </form>
    );
}

export default memo(DebtForm);

