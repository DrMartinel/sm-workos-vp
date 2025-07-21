"use client"

import { useState, useMemo, useEffect } from "react"
import { format, subDays, startOfToday, startOfMonth, subMonths, endOfMonth } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"


// --- Custom Hook to Fetch Mediation Revenue Data ---
interface MediationDataRow {
    date: string;
    app_fullname: string;
    platform: string;
    mediationPlatform: string;
    countryCode: string;
    adUnits: string;
    revenue: number;
    impressions: number;
    activeUsers: number;
    appFillRate: number;
    eCPM: number;
    appFills: number;
    appRequests: number;
    engagedUsers: number;
    [key: string]: any;
}

function useMediationRevenueData(startDate?: string, endDate?: string) {
    const [rawData, setRawData] = useState<MediationDataRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!startDate || !endDate) {
            setLoading(false);
            setRawData([]);
            return;
        };

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/data-source/BigQuery_MediationRevenueData?startDate=${startDate}&endDate=${endDate}`);
                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }
                const result = await response.json();
                console.log(`[Debug] Fetched ${result.length} rows from the data source.`);
                if (result.error) {
                    throw new Error(result.details || result.error);
                }
                setRawData(result);
            } catch (e) {
                setError(e instanceof Error ? e.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [startDate, endDate]);

    return { data: rawData, loading, error };
}

// --- Date Range Picker Component ---
function DatePickerWithRange({
  className,
  date,
  setDate,
}: {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}


export default function ExampleMediationPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: subDays(new Date(), 29),
      to: new Date(),
    })

    const formattedStartDate = date?.from ? format(date.from, "yyyyMMdd") : undefined;
    const formattedEndDate = date?.to ? format(date.to, "yyyyMMdd") : undefined;

    const { data, loading, error } = useMediationRevenueData(formattedStartDate, formattedEndDate);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    const paginatedData = useMemo(() => {
        if (!data) return [];
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage]);

    const totalPages = useMemo(() => {
        if (!data) return 0;
        return Math.ceil(data.length / rowsPerPage);
    }, [data]);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const columns = [
      { accessorKey: 'date', header: 'Date' },
      { accessorKey: 'app_fullname', header: 'App' },
      { accessorKey: 'platform', header: 'Platform' },
      { accessorKey: 'mediationPlatform', header: 'Mediation Platform' },
      { accessorKey: 'countryCode', header: 'Country' },
      { accessorKey: 'adUnits', header: 'Ad Unit' },
      { accessorKey: 'revenue', header: 'Revenue' },
      { accessorKey: 'impressions', header: 'Impressions' },
      { accessorKey: 'activeUsers', header: 'Active Users' },
      { accessorKey: 'appFillRate', header: 'Fill Rate' },
      { accessorKey: 'eCPM', header: 'eCPM' },
      { accessorKey: 'appFills', header: 'Fills' },
      { accessorKey: 'appRequests', header: 'Requests' },
      { accessorKey: 'engagedUsers', header: 'Engaged Users' },
    ];
    
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Mediation Revenue Report</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Data Filters</CardTitle>
                    <CardDescription>Select a date range to view the data.</CardDescription>
                </CardHeader>
                <CardContent>
                     <DatePickerWithRange date={date} setDate={setDate} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Mediation Data</CardTitle>
                    {data.length > 0 && !loading &&
                      <CardDescription>
                        Showing <strong>{paginatedData.length}</strong> of <strong>{data.length}</strong> rows. Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>.
                      </CardDescription>
                    }
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                      <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((col) => <TableHead key={col.accessorKey}>{col.header}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {columns.map((col) => (
                                            <TableCell key={col.accessorKey}>
                                                {typeof row[col.accessorKey] === 'number' 
                                                    ? (row[col.accessorKey] as number).toFixed(2) 
                                                    : row[col.accessorKey]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {totalPages > 1 &&
                          <div className="flex items-center justify-end pt-4">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); currentPage > 1 && handlePreviousPage(); }}
                                    aria-disabled={currentPage === 1}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                  />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationNext
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); currentPage < totalPages && handleNextPage(); }}
                                    aria-disabled={currentPage === totalPages}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        }
                      </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 