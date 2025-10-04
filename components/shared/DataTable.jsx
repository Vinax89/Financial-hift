import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Loading, TableLoading } from '../ui/loading';
import { cn } from '@/lib/utils';

export default function DataTable({
    data = [],
    columns = [],
    renderRow,
    isLoading = false,
    loadingRows = 5,
    emptyState = null,
    searchable = false,
    searchPlaceholder = "Search...",
    pageSize = 10,
    pagination = true,
    className,
    tableClassName,
    showHeader = true
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchable || !searchTerm.trim()) return data;
        
        return data.filter(item => 
            Object.values(item).some(value => 
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm, searchable]);

    // Paginate filtered data
    const paginatedData = useMemo(() => {
        if (!pagination) return filteredData;
        
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize, pagination]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Reset page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (isLoading) {
        return (
            <Card className={cn("border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm", className)}>
                <CardContent className="p-6">
                    <TableLoading rows={loadingRows} columns={columns.length} />
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0 && emptyState) {
        return (
            <Card className={cn("border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm", className)}>
                <CardContent className="p-6">
                    {emptyState}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm", className)}>
            {searchable && (
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            )}
            
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table className={tableClassName}>
                        {showHeader && columns.length > 0 && (
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    {columns.map((column, index) => (
                                        <TableHead 
                                            key={index}
                                            className={cn("font-semibold text-slate-700", column.className)}
                                        >
                                            {column.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                        )}
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => renderRow(item, index))
                            ) : (
                                <TableRow>
                                    <TableCell 
                                        colSpan={columns.length} 
                                        className="text-center py-8 text-slate-500"
                                    >
                                        No data found
                                        {searchTerm && (
                                            <span className="block mt-1 text-sm">
                                                Try adjusting your search criteria
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {pagination && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <div className="text-sm text-slate-600">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage >= totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}