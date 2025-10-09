// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Switch } from '@/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion';
import { DollarSign, Clock, PlusCircle, Trash2, SlidersHorizontal, UserCheck, Utensils, Zap, ShieldAlert, BadgePercent, Settings2 } from 'lucide-react';
import { ThemedCard, ThemedButton } from '../ui/enhanced-components';
import { formatCurrency } from '../utils/calculations';

// Helper to create a new, empty differential
const createNewDifferential = () => ({
    id: `temp_${Date.now()}`,
    name: '',
    type: 'custom',
    rate_type: 'flat_amount',
    amount: 0,
    is_stackable: true,
    conditions: {
        start_time: '',
        end_time: '',
        days_of_week: []
    }
});

interface ShiftRuleFormProps {
  onSave: (rule: any) => void;
  onCancel: () => void;
  initialRule?: any;
}

export default function ShiftRuleForm({ onSave, onCancel, initialRule }: ShiftRuleFormProps) {
    const [rule, setRule] = useState(initialRule || {
        name: '',
        description: '',
        base_hourly_rate: 0,
        active: true,
        facility: '',
        overtime_rules: { weekly_threshold: 40, weekly_multiplier: 1.5 },
        differentials: [],
        special_pay: { on_call_rate: 0 },
        meal_break_rules: { is_auto_deducted: true }
    });

    useEffect(() => {
        if (initialRule) setRule(initialRule);
    }, [initialRule]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRule(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (section: string, field: string, value: any) => {
        setRule(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleDifferentialChange = (index: number, field: string, value: any) => {
        const newDifferentials = [...rule.differentials];
        newDifferentials[index] = { ...newDifferentials[index], [field]: value };
        setRule(prev => ({ ...prev, differentials: newDifferentials }));
    };
    
    const handleDifferentialConditionChange = (index: number, field: string, value: any) => {
        const newDifferentials = [...rule.differentials];
        newDifferentials[index].conditions = { ...newDifferentials[index].conditions, [field]: value };
        setRule(prev => ({ ...prev, differentials: newDifferentials }));
    };
    
    const addDifferential = () => {
        setRule(prev => ({
            ...prev,
            differentials: [...(prev.differentials || []), createNewDifferential()]
        }));
    };
    
    const removeDifferential = (index: number) => {
        setRule(prev => ({
            ...prev,
            differentials: rule.differentials.filter(($1: any, i: number) => i !== index)
        }));
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSave(rule);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <ThemedCard className="" className="">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {initialRule ? 'Edit Shift Rule' : 'Create New Shift Rule'}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <InputGroup label="Rule Name"><Input name="name" value={rule.name} onChange={handleInputChange} placeholder="e.g., Hospital RN Contract 2024" required /></InputGroup>
                        <InputGroup label="Facility/Company"><Input name="facility" value={rule.facility} onChange={handleInputChange} placeholder="e.g., General Hospital" /></InputGroup>
                        <div className="md:col-span-2"><InputGroup label="Description"><Input name="description" value={rule.description} onChange={handleInputChange} placeholder="A brief description of this rule set" /></InputGroup></div>
                        <InputGroup label="Base Hourly Rate">
                            <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input name="base_hourly_rate" type="number" step="0.01" min="0" value={rule.base_hourly_rate} onChange={e => setRule(p => ({...p, base_hourly_rate: parseFloat(e.target.value) || 0}))} className="pl-10" required /></div>
                        </InputGroup>
                        <div className="flex items-center space-x-4 pt-8">
                            <Label htmlFor="active-switch">Rule Active</Label>
                            <Switch id="active-switch" checked={rule.active} onCheckedChange={(checked) => setRule(prev => ({ ...prev, active: checked }))} />
                        </div>
                    </div>
                </div>
            </ThemedCard>

            <Accordion type="multiple" defaultValue={['overtime', 'differentials']} className="w-full space-y-4">
                <AccordionItem value="overtime"><ThemedCard className="" className=""><AccordionTrigger><div className="flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5"/>Overtime Rules</div></AccordionTrigger><AccordionContent className="p-6 space-y-4">
                    <h4 className="font-semibold">Weekly Overtime</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputGroup label="Threshold (hours/week)"><Input type="number" value={rule.overtime_rules.weekly_threshold} onChange={e => handleNestedChange('overtime_rules', 'weekly_threshold', parseFloat(e.target.value) || 0)} /></InputGroup>
                        <InputGroup label="Multiplier"><Input type="number" step="0.1" value={rule.overtime_rules.weekly_multiplier} onChange={e => handleNestedChange('overtime_rules', 'weekly_multiplier', parseFloat(e.target.value) || 0)} /></InputGroup>
                    </div>
                    <h4 className="font-semibold">Daily Overtime</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputGroup label="Threshold (hours/day)"><Input type="number" value={rule.overtime_rules.daily_threshold} onChange={e => handleNestedChange('overtime_rules', 'daily_threshold', parseFloat(e.target.value) || 0)} placeholder="e.g., 8 or 12" /></InputGroup>
                        <InputGroup label="Multiplier"><Input type="number" step="0.1" value={rule.overtime_rules.daily_multiplier} onChange={e => handleNestedChange('overtime_rules', 'daily_multiplier', parseFloat(e.target.value) || 0)} /></InputGroup>
                    </div>
                     <h4 className="font-semibold">Double Time</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputGroup label="Daily Threshold (hours)"><Input type="number" value={rule.overtime_rules.double_time_daily_threshold} onChange={e => handleNestedChange('overtime_rules', 'double_time_daily_threshold', parseFloat(e.target.value) || 0)} placeholder="e.g., 12" /></InputGroup>
                        <InputGroup label="Multiplier"><Input type="number" step="0.1" value={rule.overtime_rules.double_time_multiplier} onChange={e => handleNestedChange('overtime_rules', 'double_time_multiplier', parseFloat(e.target.value) || 0)} /></InputGroup>
                    </div>
                </AccordionContent></ThemedCard></AccordionItem>

                <AccordionItem value="differentials"><ThemedCard className="" className=""><AccordionTrigger><div className="flex items-center gap-2 text-lg font-semibold"><BadgePercent className="h-5 w-5"/>Pay Differentials</div></AccordionTrigger><AccordionContent className="p-6 space-y-6">
                    {rule.differentials?.map((diff: any, index: number) => (
                        <div key={diff.id || index} className="p-4 rounded-lg border bg-muted/50 space-y-4 relative">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeDifferential(index)}><Trash2 className="h-4 w-4"/></Button>
                            <div className="grid md:grid-cols-3 gap-4">
                                <InputGroup label="Differential Name"><Input value={diff.name} onChange={e => handleDifferentialChange(index, 'name', e.target.value)} placeholder="e.g., Night Shift Pay" /></InputGroup>
                                <InputGroup label="Type">
                                    <Select value={diff.type} onValueChange={(val) => handleDifferentialChange(index, 'type', val)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>{['night', 'evening', 'weekend', 'holiday', 'charge', 'preceptor', 'float', 'critical_care', 'certification', 'custom'].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                                    </Select>
                                </InputGroup>
                                <div className="flex items-center space-x-2 pt-8"><Switch checked={diff.is_stackable} onCheckedChange={c => handleDifferentialChange(index, 'is_stackable', c)}/><Label>Stackable</Label></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <InputGroup label="Rate Type">
                                    <Select value={diff.rate_type} onValueChange={(val) => handleDifferentialChange(index, 'rate_type', val)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="flat_amount">Flat Amount ($)</SelectItem><SelectItem value="multiplier">Multiplier (x)</SelectItem></SelectContent>
                                    </Select>
                                </InputGroup>
                                <InputGroup label="Amount/Multiplier"><Input type="number" step="0.01" value={diff.amount} onChange={e => handleDifferentialChange(index, 'amount', parseFloat(e.target.value) || 0)} /></InputGroup>
                            </div>
                            <div className="space-y-2"><p className="font-medium text-sm">Conditions (Optional)</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputGroup label="Start Time (HH:mm)"><Input type="time" value={diff.conditions?.start_time} onChange={e => handleDifferentialConditionChange(index, 'start_time', e.target.value)} /></InputGroup>
                                    <InputGroup label="End Time (HH:mm)"><Input type="time" value={diff.conditions?.end_time} onChange={e => handleDifferentialConditionChange(index, 'end_time', e.target.value)} /></InputGroup>
                                </div>
                                <div><Label>Days of Week</Label><div className="flex flex-wrap gap-2 mt-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <Button key={day} type="button" size="sm" variant={diff.conditions?.days_of_week?.includes(day) ? 'primary' : 'outline'} onClick={() => { const newDays = diff.conditions?.days_of_week?.includes(day) ? diff.conditions.days_of_week.filter(d => d !== day) : [...(diff.conditions?.days_of_week || []), day]; handleDifferentialConditionChange(index, 'days_of_week', newDays); }}>{day}</Button>)}</div></div>
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addDifferential}><PlusCircle className="mr-2 h-4 w-4"/>Add Differential</Button>
                </AccordionContent></ThemedCard></AccordionItem>

                <AccordionItem value="special_pay"><ThemedCard className="" className=""><AccordionTrigger><div className="flex items-center gap-2 text-lg font-semibold"><Zap className="h-5 w-5"/>Special Pay</div></AccordionTrigger><AccordionContent className="p-6 grid md:grid-cols-3 gap-4">
                    <InputGroup label="On-Call Rate ($/hr)"><Input type="number" step="0.01" value={rule.special_pay?.on_call_rate} onChange={e => handleNestedChange('special_pay', 'on_call_rate', parseFloat(e.target.value) || 0)} /></InputGroup>
                    <InputGroup label="Callback Multiplier"><Input type="number" step="0.1" value={rule.special_pay?.callback_multiplier} onChange={e => handleNestedChange('special_pay', 'callback_multiplier', parseFloat(e.target.value) || 0)} /></InputGroup>
                    <InputGroup label="Callback Min. Hours"><Input type="number" value={rule.special_pay?.callback_minimum_hours} onChange={e => handleNestedChange('special_pay', 'callback_minimum_hours', parseFloat(e.target.value) || 0)} /></InputGroup>
                </AccordionContent></ThemedCard></AccordionItem>

                <AccordionItem value="meal_breaks"><ThemedCard className="" className=""><AccordionTrigger><div className="flex items-center gap-2 text-lg font-semibold"><Utensils className="h-5 w-5"/>Meal Breaks</div></AccordionTrigger><AccordionContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-2"><Switch id="auto-deduct-switch" checked={rule.meal_break_rules?.is_auto_deducted} onCheckedChange={c => handleNestedChange('meal_break_rules', 'is_auto_deducted', c)}/><Label htmlFor="auto-deduct-switch">Auto-Deduct Unpaid Breaks</Label></div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputGroup label="Required After (hours)"><Input type="number" value={rule.meal_break_rules?.unpaid_break_threshold} onChange={e => handleNestedChange('meal_break_rules', 'unpaid_break_threshold', parseFloat(e.target.value) || 0)} /></InputGroup>
                        <InputGroup label="Break Duration (minutes)"><Input type="number" value={rule.meal_break_rules?.break_duration} onChange={e => handleNestedChange('meal_break_rules', 'break_duration', parseFloat(e.target.value) || 0)} /></InputGroup>
                    </div>
                </AccordionContent></ThemedCard></AccordionItem>
            </Accordion>
            
            <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <ThemedButton type="submit">{initialRule ? 'Save Changes' : 'Create Rule'}</ThemedButton>
            </div>
        </form>
    );
}

const InputGroup = ({ label, children }) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {children}
    </div>
);