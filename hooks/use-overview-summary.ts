'use client';

import { useQueries } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, endOfMonth, startOfToday, endOfToday, lastDayOfMonth } from 'date-fns';
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

type AggregatedData = {
  downloads: number;
  revenue: number;
  adSpent: number;
  customCost: number;
  totalCost: number;
  grossMargin: number;
};

const fetchData = async (startDate?: Date, endDate?: Date): Promise<OverviewDataRow[]> => {
    if (!startDate || !endDate) return [];
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    // Ensure the data source name matches exactly.
    const response = await fetch(`/api/data-source/AppboomOverviewData?startDate=${start}&endDate=${end}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch overview summary data');
    }
    return response.json();
}

const aggregateData = (
    data: OverviewDataRow[] | undefined, 
    selectedApps: string[], 
    selectedPlatforms: string[]
): AggregatedData => {
    if (!data) {
        return { downloads: 0, revenue: 0, adSpent: 0, customCost: 0, totalCost: 0, grossMargin: 0 };
    }

    const filteredData = data.filter(row => 
        (selectedApps.length === 0 || selectedApps.includes(row.app_name)) &&
        (selectedPlatforms.length === 0 || selectedPlatforms.includes(row.platform))
    );

    const totals = filteredData.reduce((acc, row) => {
        acc.downloads += row.downloads || 0;
        acc.revenue += row.revenue || 0;
        acc.adSpent += row.cost || 0;
        // Note: custom_costs from the query is not per-day, it's a total.
        // To avoid double counting, we should handle it carefully.
        // For this implementation, we sum it up as requested. A better approach might be needed.
        acc.customCost += row.custom_costs || 0;
        return acc;
    }, { downloads: 0, revenue: 0, adSpent: 0, customCost: 0 });

    // To avoid massive duplication of custom_cost, we can try to get the unique costs by app
    const uniqueCustomCosts = filteredData.reduce((acc, row) => {
        acc.set(row.app_name, row.custom_costs || 0);
        return acc;
    }, new Map<string, number>());
    
    totals.customCost = Array.from(uniqueCustomCosts.values()).reduce((sum, cost) => sum + cost, 0);

    const totalCost = totals.adSpent + totals.customCost;
    const grossMargin = totals.revenue - totalCost;

    return { ...totals, totalCost, grossMargin };
};


export const useOverviewSummary = (
    dateRange: DateRange | undefined,
    selectedApps: string[],
    selectedPlatforms: string[]
) => {
    const today = startOfToday();
    const { from: currentFrom, to: currentTo } = dateRange || {};

    const dateRanges = useMemo(() => ({
        thisPeriod: { from: currentFrom, to: currentTo },
        last30Days: { from: subDays(today, 29), to: endOfToday() },
        thisMonth: { from: startOfMonth(today), to: endOfToday() },
        lastMonth: { from: startOfMonth(subDays(today, 30)), to: endOfMonth(subDays(today, 30)) },
    }), [currentFrom, currentTo, today]);

    const results = useQueries({
        queries: Object.entries(dateRanges).map(([key, range]) => ({
            queryKey: ['overviewSummary', key, range, selectedApps, selectedPlatforms],
            queryFn: () => fetchData(range.from, range.to),
            enabled: !!range.from && !!range.to,
        })),
    });

    const isLoading = results.some(r => r.isLoading);

    const data = useMemo(() => {
        const [thisPeriodRaw, last30DaysRaw, thisMonthRaw, lastMonthRaw] = results.map(r => r.data);
        
        return {
            thisPeriod: aggregateData(thisPeriodRaw, selectedApps, selectedPlatforms),
            last30Days: aggregateData(last30DaysRaw, selectedApps, selectedPlatforms),
            thisMonth: aggregateData(thisMonthRaw, selectedApps, selectedPlatforms),
            lastMonth: aggregateData(lastMonthRaw, selectedApps, selectedPlatforms),
        }
    }, [results, selectedApps, selectedPlatforms]);

    return { data, isLoading };
};
