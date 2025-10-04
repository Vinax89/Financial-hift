
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const dateRanges = [
    { label: "This Month", range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    { label: "Last Month", range: { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) } },
    { label: "Last 30 Days", range: { from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() } },
    { label: "Last 90 Days", range: { from: new Date(new Date().setDate(new Date().getDate() - 90)), to: new Date() } },
];

export default function TransactionFilters({ onFilterChange }) {
    const [type, setType] = useState('all');
    const [category, setCategory] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    const handleFilter = (filterType, value) => {
        let newFilters = { type, category, dateRange };
        if (filterType === 'type') {
            newFilters.type = value;
            setType(value);
        }
        if (filterType === 'category') {
            newFilters.category = value;
            setCategory(value);
        }
        if (filterType === 'dateRange') {
            newFilters.dateRange = value;
            setDateRange(value);
        }
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setType('all');
        setCategory('all');
        setDateRange(null);
        onFilterChange({});
    };

    return (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 border border-border rounded-lg">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={type} onValueChange={(value) => handleFilter('type', value)}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
            </Select>

            <Select value={category} onValueChange={(value) => handleFilter('category', value)}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food_dining">Food & Dining</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-full sm:w-auto justify-start text-left font-normal bg-background"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => handleFilter('dateRange', range)}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                <X className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
    );
}
