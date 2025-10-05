
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table.jsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu.jsx";
import { MoreHorizontal, Clock } from 'lucide-react';
import { format, formatDistance, parseISO } from "date-fns";
import { TableLoading } from '@/ui/loading.jsx';
import { EmptyState } from '../ui/empty-state';
import { VirtualizedList } from '../optimized/VirtualizedList';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const ShiftCell = ({ shift }) => (
    <div className="flex items-center gap-3 min-w-0">
        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">{shift.title}</div>
            <div className="text-xs text-muted-foreground truncate">{shift.location || 'N/A'}</div>
        </div>
    </div>
);

const DurationCell = ({ shift }) => {
    const hours = shift.actual_hours || shift.scheduled_hours || 0;
    return <span className="font-mono text-right block">{hours.toFixed(2)} hrs</span>;
};

const DateTimeCell = ({ shift }) => {
    try {
        const start = parseISO(shift.start_datetime);
        return (
            <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{format(start, 'EEE, MMM d')}</div>
                <div className="text-xs text-muted-foreground truncate">{format(start, 'h:mm a')}</div>
            </div>
        );
    } catch {
        return <div className="text-muted-foreground">Invalid Date</div>;
    }
};

const ShiftRow = ({ shift, onEdit, onDelete }) => (
    <TableRow className="hover:bg-muted/50 h-[60px]">
        <TableCell className="py-3 w-[40%] min-w-[200px]"><ShiftCell shift={shift} /></TableCell>
        <TableCell className="py-3 w-[25%] min-w-[120px]"><DateTimeCell shift={shift} /></TableCell>
        <TableCell className="py-3 w-[20%] min-w-[100px] text-right"><DurationCell shift={shift} /></TableCell>
        <TableCell className="py-3 w-[10%] min-w-[80px] font-medium text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(shift.net_pay)}</TableCell>
        <TableCell className="py-3 w-[5%] min-w-[50px] text-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* Add aria-label to actions trigger button for accessibility */}
                    <button className="p-2 rounded-md hover:bg-muted" aria-label="Shift actions"><MoreHorizontal className="h-4 w-4" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit(shift)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(shift.id)} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
);

const MemoizedShiftRow = React.memo(ShiftRow);

export default function ShiftList({ shifts, onEdit, onDelete, isLoading }) {

    if (isLoading) {
        return <TableLoading rows={8} columns={5} />;
    }

    if (!shifts || shifts.length === 0) {
        return (
            <EmptyState
                icon={Clock}
                title="No Shifts Yet"
                description="Add a new shift to start tracking your work and earnings."
            />
        );
    }
    
    return (
        <div className="w-full">
            {/* Fixed Header */}
            <div className="sticky top-0 bg-background border-b border-border/60 z-10">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold uppercase tracking-wider text-muted-foreground/80 text-xs w-[40%] min-w-[200px]">Shift</TableHead>
                            <TableHead className="font-bold uppercase tracking-wider text-muted-foreground/80 text-xs w-[25%] min-w-[120px]">Date</TableHead>
                            <TableHead className="font-bold uppercase tracking-wider text-muted-foreground/80 text-xs w-[20%] min-w-[100px] text-right">Duration</TableHead>
                            <TableHead className="font-bold uppercase tracking-wider text-muted-foreground/80 text-xs w-[10%] min-w-[80px] text-right">Pay (Net)</TableHead>
                            <TableHead className="w-[5%] min-w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>
            
            {/* Scrollable Body */}
            <div className="overflow-hidden">
                <VirtualizedList
                    items={shifts}
                    renderItem={(shift) => (
                        <div style={{ width: '100%' }}>
                            <Table>
                                <TableBody>
                                    <MemoizedShiftRow shift={shift} onEdit={onEdit} onDelete={onDelete} />
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    itemHeight={60}
                    containerHeight="50vh"
                />
            </div>
        </div>
    );
}
