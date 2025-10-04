import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, isToday } from 'date-fns';
import { Skeleton } from '@/ui/skeleton.jsx';
import { cn } from '@/lib/utils';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatTime = (datetime) => {
    return format(new Date(datetime), 'HH:mm');
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function ShiftCalendar({ shifts, onEdit, onSelectDate, isLoading }) {
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = getDay(monthStart);

    const getDayShifts = (day) => {
        return shifts.filter(shift => 
            isSameDay(new Date(shift.start_datetime), day)
        );
    };

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Shift Calendar - {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-7 gap-2">
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-600 mb-2 col-span-7">
                            {weekDays.map(day => <div key={day}>{day}</div>)}
                        </div>
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-600 mb-2">
                            {weekDays.map(day => <div key={day}>{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {/* Empty cells for days before month starts */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            
                            {/* Calendar days */}
                            {days.map(day => {
                                const dayShifts = getDayShifts(day);
                                const hasShifts = dayShifts.length > 0;
                                
                                return (
                                    <Button
                                        key={day.toString()}
                                        variant="ghost"
                                        onClick={() => onSelectDate(day)}
                                        className={cn(
                                            'h-24 p-2 border rounded-lg flex flex-col justify-start items-start hover:bg-emerald-50',
                                            isToday(day) ? 'bg-emerald-50 border-emerald-300' : 'border-slate-200',
                                            hasShifts ? 'bg-blue-50' : ''
                                        )}
                                    >
                                        <span className={cn(
                                            'font-semibold text-sm',
                                            isToday(day) ? 'text-emerald-700' : 'text-slate-700'
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        
                                        {hasShifts && (
                                            <div className="mt-1 w-full">
                                                {dayShifts.slice(0, 2).map((shift, index) => (
                                                    <div
                                                        key={shift.id}
                                                        className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded mb-1 truncate"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(shift);
                                                        }}
                                                    >
                                                        {formatTime(shift.start_datetime)}
                                                    </div>
                                                ))}
                                                {dayShifts.length > 2 && (
                                                    <div className="text-xs text-slate-500">
                                                        +{dayShifts.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}