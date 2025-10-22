/**
 * @fileoverview Shift list component displaying shifts in a virtualized table (TypeScript)
 * @description Shows shift details including date, duration, and pay with edit/delete actions
 */

import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { MoreHorizontal, Clock } from 'lucide-react';
import { format, parseISO } from "date-fns";
import { TableLoading } from '@/ui/loading';
import { EmptyState } from '../ui/empty-state';
import { VirtualizedList } from '../optimized/VirtualizedList';
import type { Shift } from '@/types/entities';

/**
 * Component props
 */
interface ShiftListProps {
    shifts: Shift[];
    onEdit: (shift: Shift) => void;
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

interface ShiftCellProps {
    shift: Shift;
}

interface ShiftRowProps {
    shift: Shift;
    onEdit: (shift: Shift) => void;
    onDelete: (id: number) => void;
}

/**
 * Format amount as USD currency
 */
const formatCurrency = (amount: number): string => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

/**
 * Shift cell displaying title and location
 */
const ShiftCell: React.FC<ShiftCellProps> = ({ shift }) => (
    <div className="flex items-center gap-3 min-w-0">
        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">{shift.title}</div>
            <div className="text-xs text-muted-foreground truncate">{shift.location || 'N/A'}</div>
        </div>
    </div>
);

/**
 * Duration cell displaying hours worked
 */
const DurationCell: React.FC<ShiftCellProps> = ({ shift }) => {
    const hours = shift.actual_hours || shift.scheduled_hours || 0;
    return <span className="font-mono text-right block">{hours.toFixed(2)} hrs</span>;
};

/**
 * Date and time cell for shift start
 */
const DateTimeCell: React.FC<ShiftCellProps> = ({ shift }) => {
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

/**
 * Single shift row with actions
 */
const ShiftRow: React.FC<ShiftRowProps> = ({ shift, onEdit, onDelete }) => (
    <TableRow className="hover:bg-muted/50 h-[60px]">
        <TableCell className="py-3 w-[40%] min-w-[200px]"><ShiftCell shift={shift} /></TableCell>
        <TableCell className="py-3 w-[25%] min-w-[120px]"><DateTimeCell shift={shift} /></TableCell>
        <TableCell className="py-3 w-[20%] min-w-[100px] text-right"><DurationCell shift={shift} /></TableCell>
        <TableCell className="py-3 w-[10%] min-w-[80px] font-medium text-emerald-600 dark:text-emerald-400 text-right">
            {formatCurrency(shift.net_pay || 0)}
        </TableCell>
        <TableCell className="py-3 w-[5%] min-w-[50px] text-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-md hover:bg-muted" aria-label="Shift actions">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit(shift)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(shift.id!)} className="text-destructive">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
);

const MemoizedShiftRow = React.memo(ShiftRow);

/**
 * Shift list component with virtualization
 */
const ShiftList: React.FC<ShiftListProps> = ({ shifts, onEdit, onDelete, isLoading = false }) => {
    const sortedShifts = useMemo(() => {
        return [...shifts].sort((a, b) => 
            new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime()
        );
    }, [shifts]);

    if (isLoading) {
        return <TableLoading />;
    }

    if (shifts.length === 0) {
        return (
            <EmptyState
                title="No shifts yet"
                description="Start by adding your first shift"
            />
        );
    }

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Shift</TableHead>
                        <TableHead className="font-semibold">Date & Time</TableHead>
                        <TableHead className="font-semibold text-right">Hours</TableHead>
                        <TableHead className="font-semibold text-right">Net Pay</TableHead>
                        <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <VirtualizedList
                        items={sortedShifts}
                        itemHeight={60}
                        containerHeight={600}
                        renderItem={(shift) => (
                            <MemoizedShiftRow
                                key={shift.id}
                                shift={shift}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    />
                </TableBody>
            </Table>
        </div>
    );
};

export default React.memo(ShiftList);
