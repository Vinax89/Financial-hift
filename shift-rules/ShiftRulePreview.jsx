import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card.jsx';
import { Badge } from '@/ui/badge.jsx';
import { DollarSign, Clock, ShieldAlert, BadgePercent, Utensils, Zap, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { ThemedCard } from '../ui/enhanced-components';

export default function ShiftRulePreview({ rule }) {
    if (!rule) {
        return <ThemedCard><CardContent className="p-6 text-center text-muted-foreground">Select a rule to preview its details.</CardContent></ThemedCard>;
    }

    const { name, description, base_hourly_rate, facility, active, overtime_rules, differentials, special_pay, meal_break_rules } = rule;

    return (
        <ThemedCard elevated className="sticky top-24">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl mb-1">{name}</CardTitle>
                        <CardDescription>{facility}</CardDescription>
                    </div>
                    <Badge variant={active ? 'success' : 'destructive'}>
                        {active ? <CheckCircle className="h-4 w-4 mr-1"/> : <XCircle className="h-4 w-4 mr-1"/>}
                        {active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {description && <p className="text-sm text-muted-foreground italic">"{description}"</p>}

                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">Base Rate</span>
                    </div>
                    <span className="text-xl font-bold text-primary">{formatCurrency(base_hourly_rate)}/hr</span>
                </div>

                {/* Overtime Rules */}
                <Section title="Overtime Rules" icon={Clock}>
                    <DetailItem label="Weekly OT" value={`> ${overtime_rules?.weekly_threshold || 40} hrs @ ${overtime_rules?.weekly_multiplier || 1.5}x`} />
                    {overtime_rules?.daily_threshold > 0 && <DetailItem label="Daily OT" value={`> ${overtime_rules.daily_threshold} hrs @ ${overtime_rules.daily_multiplier || 1.5}x`} />}
                    {overtime_rules?.double_time_daily_threshold > 0 && <DetailItem label="Daily Double Time" value={`> ${overtime_rules.double_time_daily_threshold} hrs @ ${overtime_rules.double_time_multiplier || 2}x`} />}
                </Section>
                
                {/* Differentials */}
                {differentials?.length > 0 && (
                    <Section title="Pay Differentials" icon={BadgePercent}>
                        {differentials.map((diff, index) => (
                            <div key={diff.id || index} className="p-2 bg-muted/50 rounded-md">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold capitalize">{diff.name || diff.type}</p>
                                    <Badge variant="secondary">
                                        {diff.rate_type === 'flat_amount' ? `+${formatCurrency(diff.amount)}` : `${diff.amount}x`}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1 mt-1">
                                    {diff.conditions?.start_time && <span>{diff.conditions.start_time} - {diff.conditions.end_time}</span>}
                                    {diff.conditions?.days_of_week?.length > 0 && <span className="ml-2">({diff.conditions.days_of_week.join(', ')})</span>}
                                </div>
                            </div>
                        ))}
                    </Section>
                )}
                
                {/* Special Pay */}
                {special_pay && (
                    <Section title="Special Pay" icon={Zap}>
                        {special_pay.on_call_rate > 0 && <DetailItem label="On-Call/Standby" value={`${formatCurrency(special_pay.on_call_rate)}/hr`} />}
                        {special_pay.callback_minimum_hours > 0 && <DetailItem label="Callback" value={`min. ${special_pay.callback_minimum_hours} hrs @ ${special_pay.callback_multiplier || 1.5}x`} />}
                    </Section>
                )}

                {/* Meal Breaks */}
                {meal_break_rules && meal_break_rules.is_auto_deducted && (
                    <Section title="Meal Breaks" icon={Utensils}>
                        <DetailItem label="Auto-Deduction" value={`${meal_break_rules.break_duration || 30} min break for shifts > ${meal_break_rules.unpaid_break_threshold || 0} hrs`} />
                    </Section>
                )}

            </CardContent>
        </ThemedCard>
    );
}

const Section = ({ title, icon: Icon, children }) => (
    <div>
        <h4 className="flex items-center gap-2 font-semibold mb-2 text-foreground">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {title}
        </h4>
        <div className="space-y-2 pl-6 border-l-2 border-border/50 ml-2">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
    </div>
);