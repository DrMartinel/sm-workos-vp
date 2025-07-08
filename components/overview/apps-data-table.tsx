'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, ChevronsUpDown, Apple, Smartphone } from 'lucide-react';
import { useAppsTableData, Sorting, AppMetric, ProcessedAppData } from '@/hooks/use-apps-table-data';
import { cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


interface AppsDataTableProps {
    dateRange: DateRange | undefined;
    selectedApps: string[];
    selectedPlatforms: string[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);
const formatPercent = (value: number) => {
    if (!isFinite(value)) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
};

const ChangeIndicator = ({ value }: { value: number }) => {
    if (!isFinite(value) || value === 0) return <span className="text-xs text-gray-500">-</span>;
    const isPositive = value > 0;
    return (
        <div className={cn("flex items-center justify-end text-xs", isPositive ? 'text-green-600' : 'text-red-600')}>
            {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {formatPercent(Math.abs(value))}
        </div>
    );
};

const MetricCell = ({ value, change, formatter }: { value: number, change: number, formatter?: (val: number) => string }) => {
    const finalFormatter = formatter || formatCurrency;
    return (
        <TableCell>
            <div className="flex flex-col items-end">
                <div className="font-medium">{finalFormatter(value)}</div>
                <ChangeIndicator value={change} />
            </div>
        </TableCell>
    );
};

const ITEMS_PER_PAGE = 20;

export const AppsDataTable = ({ dateRange, selectedApps, selectedPlatforms }: AppsDataTableProps) => {
    const [sorting, setSorting] = useState<Sorting>({ metric: 'revenue', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const { data, isLoading } = useAppsTableData(dateRange, selectedApps, selectedPlatforms, sorting);
    
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSort = (metric: AppMetric) => {
        setSorting(prev => ({
            metric,
            direction: prev.metric === metric && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const SortableHeader = ({ metric, label }: { metric: AppMetric; label: string }) => (
        <TableHead className="text-right">
            <Button variant="ghost" onClick={() => handleSort(metric)} className="px-2 py-1 h-auto">
                {label}
                {sorting.metric === metric 
                    ? (sorting.direction === 'desc' ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />)
                    : <ChevronsUpDown className="h-3 w-3 ml-1" />
                }
            </Button>
        </TableHead>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>App Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>App</TableHead>
                                <SortableHeader metric="downloads" label="Downloads" />
                                <SortableHeader metric="revenue" label="Revenue" />
                                <SortableHeader metric="spent" label="Spent" />
                                <SortableHeader metric="grossMargin" label="Gross Margin" />
                                <SortableHeader metric="roi" label="ROI" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                        {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-8 w-24" /></TableCell>)}
                                    </TableRow>
                                ))
                            ) : paginatedData.map((app) => (
                                <TableRow key={app.app_id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {app.platform === 'iOS' ? <Apple className="h-5 w-5 text-gray-700" /> : <Smartphone className="h-5 w-5 text-gray-700" />}
                                            <div>
                                                <div className="font-medium">{app.app_name}</div>
                                                <div className="text-xs text-gray-500">{app.app_id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <MetricCell value={app.downloads} change={app.downloads_change} formatter={formatNumber} />
                                    <MetricCell value={app.revenue} change={app.revenue_change} />
                                    <MetricCell value={app.spent} change={app.spent_change} />
                                    <MetricCell value={app.grossMargin} change={app.grossMargin_change} />
                                    <MetricCell value={app.roi} change={app.roi_change} formatter={formatPercent} />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <Pagination className="mt-4">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </CardContent>
        </Card>
    );
};
