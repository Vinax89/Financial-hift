import React, { useEffect, useState } from 'react';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { Button } from '@/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select.jsx';

const defaultDebt = {
    name: '',
    balance: '',
    interest_rate: '',
    minimum_payment: '',
    status: 'active'
};

const toNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export default function DebtForm({ debt, onSubmit, onCancel }) {
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

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit?.({
            name: formState.name.trim(),
            balance: toNumber(formState.balance),
            interest_rate: toNumber(formState.interest_rate),
            minimum_payment: toNumber(formState.minimum_payment),
            status: formState.status
        });
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
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onCancel?.()}>
                    Cancel
                </Button>
                <Button type="submit">{debt ? 'Update Debt' : 'Add Debt'}</Button>
            </div>
        </form>
    );
}
