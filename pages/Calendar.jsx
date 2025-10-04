
import React, { useState, useMemo } from 'react';
import CashflowCalendar from '@/calendar/CashflowCalendar.jsx';
import { ThemedCard, GlassContainer, ThemedButton } from '@/ui/enhanced-components.jsx';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations.jsx';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData.jsx';
import { LoadingWrapper, CardLoading } from '@/ui/loading.jsx';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    addMonths,
    subMonths,
    isSameDay
} from 'date-fns';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { transactions, shifts, bills, isLoading: isFinancialDataLoading, dataLoaded, loadAllData } = useFinancialData();

    React.useEffect(() => {
        if (!dataLoaded) {
            loadAllData();
        }
    }, [dataLoaded, loadAllData]);

    const calendarData = useMemo(() => {
        if (!dataLoaded) return []; // Return empty array if no data, loader will handle visual

        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return days.map(day => {
            let totalIncome = 0;
            let totalExpenses = 0;

            (transactions || []).forEach(t => {
                if (isSameDay(new Date(t.date), day)) {
                    if (t.type === 'income') totalIncome += t.amount;
                    else totalExpenses += t.amount;
                }
            });

            (shifts || []).forEach(s => {
                if (isSameDay(new Date(s.start_datetime), day)) {
                    totalIncome += s.net_pay || s.gross_pay || 0;
                }
            });

            (bills || []).forEach(b => {
                // Ensure b.due_date is treated as a number for comparison
                if (b.due_date === day.getDate()) {
                    totalExpenses += b.amount;
                }
            });

            const hasItems = totalIncome > 0 || totalExpenses > 0;

            return {
                date: day,
                totalIncome,
                totalExpenses,
                hasItems,
            };
        });
    }, [currentDate, transactions, shifts, bills, dataLoaded]);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <GlassContainer className="p-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <CalendarIcon className="h-8 w-8" />
                                        Cashflow Calendar
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Visualize your daily financial events and cash flow.</p>
                            </div>
                        </FloatingElement>
                        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                            <ThemedButton variant="ghost" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-5 w-5" />
                            </ThemedButton>
                            <span className="font-semibold text-foreground w-32 text-center">
                                {format(currentDate, 'MMMM yyyy')}
                            </span>
                            <ThemedButton variant="ghost" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="h-5 w-5" />
                            </ThemedButton>
                        </div>
                    </header>
                </GlassContainer>

                <FloatingElement disabled={isFinancialDataLoading}>
                    <ThemedCard elevated className="min-h-[70vh]">
                        <LoadingWrapper isLoading={isFinancialDataLoading && !dataLoaded} fallback={<CardLoading/>}>
                            <CashflowCalendar
                                calendarData={calendarData}
                                currentDate={currentDate}
                            />
                        </LoadingWrapper>
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
