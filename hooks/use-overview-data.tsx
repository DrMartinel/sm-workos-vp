'use client';

import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { differenceInDays, format } from 'date-fns';
import { useMemo } from 'react';

type OverviewDataRow = {
  date: string;
  app_name: string;
  platform: 'Android' | 'iOS';
  revenue: number;
  cost: number;
  downloads: number;
  custom_costs: number;
};

const fetchData = async (startDate?: Date, endDate?: Date): Promise<OverviewDataRow[]> => {
    if (!startDate || !endDate) return [];
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    const response = await fetch(`/api/data-source/MySQL_AppboomOverviewData?startDate=${start}&endDate=${end}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch overview data');
    }
    return response.json();
}

export const useOverviewData = (
    dateRange: DateRange | undefined,
    selectedApps: string[],
    selectedPlatforms: string[]
) => {
    const { from: currentFrom, to: currentTo } = dateRange || {};

    // Calculate previous period
    const duration = currentFrom && currentTo ? differenceInDays(currentTo, currentFrom) : 29;
    const previousTo = currentFrom ? new Date(currentFrom.getTime() - 86400000) : undefined;
    const previousFrom = previousTo ? new Date(previousTo.getTime() - duration * 86400000) : undefined;
    
    // Fetch data for current and previous periods
    const { data: rawCurrentData, isLoading: isLoadingCurrent, error: errorCurrent } = useQuery<OverviewDataRow[]>({
        queryKey: ['overviewData', 'current', dateRange],
        queryFn: () => fetchData(currentFrom, currentTo),
        enabled: !!currentFrom && !!currentTo,
    });
    
    const { data: rawPreviousData, isLoading: isLoadingPrevious, error: errorPrevious } = useQuery<OverviewDataRow[]>({
        queryKey: ['overviewData', 'previous', { from: previousFrom, to: previousTo }],
        queryFn: () => fetchData(previousFrom, previousTo),
        enabled: !!previousFrom && !!previousTo,
    });

    const processedData = useMemo(() => {
        const appOptions = [...new Set(rawCurrentData?.map(d => d.app_name) || [])]
            .sort()
            .map(name => ({ value: name, label: name }));

        const filterData = (data: OverviewDataRow[] | undefined) => {
            if (!data) return [];
            return data.filter(row => 
                (selectedApps.length === 0 || selectedApps.includes(row.app_name)) &&
                (selectedPlatforms.length === 0 || selectedPlatforms.includes(row.platform))
            );
        };

        const currentData = filterData(rawCurrentData);
        const previousData = filterData(rawPreviousData);

        const calculateTotals = (data: OverviewDataRow[]) => {
            // Anti-duplication for custom costs, since it's a daily total applied to all apps
            const dailyCustomCosts = data.reduce((acc, row) => {
                const day = row.date.split('T')[0];
                acc.set(day, row.custom_costs || 0);
                return acc;
            }, new Map<string, number>());
            const totalCustomCost = Array.from(dailyCustomCosts.values()).reduce((sum, cost) => sum + cost, 0);

            const totals = data.reduce((acc, row) => {
                acc.revenue += row.revenue || 0;
                acc.cost += row.cost || 0; // This is now just ad cost
                acc.downloads += row.downloads || 0;
                return acc;
            }, { revenue: 0, cost: 0, downloads: 0 });

            const totalCost = totals.cost + totalCustomCost;
            const margin = totals.revenue - totalCost;
            
            return { ...totals, custom_costs: totalCustomCost, totalCost, margin };
        };

        const currentTotals = calculateTotals(currentData);
        const previousTotals = calculateTotals(previousData);

        // --- DEBUG LOG ---
        console.log("Data for Margin Calculation (Current Period):", {
            revenue: currentTotals.revenue,
            cost: currentTotals.cost,
            custom_costs: currentTotals.custom_costs,
            calculated_margin: currentTotals.margin,
        });

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };

        const groupDataByDay = (data: OverviewDataRow[]) => {
            const grouped = data.reduce((acc, row) => {
                const day = row.date.split('T')[0];
                if (!acc[day]) {
                    acc[day] = { revenue: 0, downloads: 0, cost: 0, margin: 0 };
                }
                acc[day].revenue += row.revenue;
                acc[day].downloads += row.downloads;
                const totalCost = row.cost + row.custom_costs; // Daily total cost
                acc[day].cost += totalCost;
                acc[day].margin += row.revenue - totalCost;
                return acc;
            }, {} as Record<string, { revenue: number, downloads: number, cost: number, margin: number }>);
            
            return Object.entries(grouped)
                .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                .map(([_, values]) => values);
        }

        const dailyData = groupDataByDay(currentData);

        return {
            kpi: {
                revenue: { value: currentTotals.revenue, change: calculateChange(currentTotals.revenue, previousTotals.revenue), sparkline: dailyData.map(d => ({ value: d.revenue })) },
                downloads: { value: currentTotals.downloads, change: calculateChange(currentTotals.downloads, previousTotals.downloads), sparkline: dailyData.map(d => ({ value: d.downloads })) },
                cost: { value: currentTotals.totalCost, change: calculateChange(currentTotals.totalCost, previousTotals.totalCost), sparkline: dailyData.map(d => ({ value: d.cost })) },
                margin: { value: currentTotals.margin, change: calculateChange(currentTotals.margin, previousTotals.margin), sparkline: dailyData.map(d => ({ value: d.margin })) },
            },
            filters: {
                appOptions,
            }
        }

    }, [rawCurrentData, rawPreviousData, selectedApps, selectedPlatforms]);

    return {
        data: processedData,
        isLoading: isLoadingCurrent || isLoadingPrevious,
        error: errorCurrent || errorPrevious,
    };
}; 