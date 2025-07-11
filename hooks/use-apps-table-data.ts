'use client';

import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { differenceInDays, format } from 'date-fns';
import { useMemo, useState } from 'react';

// --- TYPE DEFINITIONS ---
type OverviewDataRow = {
  date: string;
  app_id: string;
  app_name: string;
  node_icon: string;
  platform: 'Android' | 'iOS';
  revenue: number;
  cost: number; // ad_cost
  downloads: number;
  custom_costs: number;
};

export type AppMetric = 'downloads' | 'revenue' | 'spent' | 'grossMargin' | 'roi';
export type SortDirection = 'asc' | 'desc';
export type Sorting = {
    metric: AppMetric;
    direction: SortDirection;
};

export interface ProcessedAppData {
    app_id: string;
    app_name: string;
    node_icon: string;
    platform: 'Android' | 'iOS';
    downloads: number;
    downloads_change: number;
    revenue: number;
    revenue_change: number;
    spent: number;
    spent_change: number;
    grossMargin: number;
    grossMargin_change: number;
    roi: number;
    roi_change: number;
}

// --- DATA FETCHING ---
const fetchData = async (startDate?: Date, endDate?: Date): Promise<OverviewDataRow[]> => {
    if (!startDate || !endDate) return [];
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    const response = await fetch(`/api/data-source/MySQL_AppboomOverviewData?startDate=${start}&endDate=${end}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch table data');
    }
    return response.json();
};

const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous);
};

// --- DATA PROCESSING ---
const processPeriodData = (data: OverviewDataRow[] | undefined) => {
    if (!data) return new Map<string, Omit<ProcessedAppData, 'platform' | 'app_name'>>();

    const aggregated = data.reduce((acc, row) => {
        if (!acc[row.app_id]) {
            acc[row.app_id] = { app_id: row.app_id, downloads: 0, revenue: 0, spent: 0, node_icon: row.node_icon || '' };
        }
        const app = acc[row.app_id];
        app.downloads += row.downloads || 0;
        app.revenue += row.revenue || 0;
        app.spent += row.cost || 0; // cost is ad_spend

        return acc;
    }, {} as Record<string, { app_id: string; downloads: number; revenue: number; spent: number; node_icon: string; }>);

    const final = new Map<string, Omit<ProcessedAppData, 'platform' | 'app_name'>>();
    Object.values(aggregated).forEach(app => {
        const grossMargin = app.revenue - app.spent;
        const roi = app.spent === 0 ? (grossMargin > 0 ? Infinity : 0) : grossMargin / app.spent;

        final.set(app.app_id, {
            app_id: app.app_id,
            node_icon: app.node_icon,
            downloads: app.downloads, downloads_change: 0,
            revenue: app.revenue, revenue_change: 0,
            spent: app.spent, spent_change: 0,
            grossMargin, grossMargin_change: 0,
            roi, roi_change: 0,
        });
    });

    return final;
};

// --- MAIN HOOK ---
export const useAppsTableData = (
    dateRange: DateRange | undefined,
    selectedApps: string[],
    selectedPlatforms: string[],
    sorting: Sorting
) => {
    const { from: currentFrom, to: currentTo } = dateRange || {};
    const duration = currentFrom && currentTo ? differenceInDays(currentTo, currentFrom) : 29;
    const previousTo = currentFrom ? new Date(currentFrom.getTime() - 86400000) : undefined;
    const previousFrom = previousTo ? new Date(previousTo.getTime() - duration * 86400000) : undefined;
    
    const { data: rawCurrentData, isLoading: isLoadingCurrent } = useQuery<OverviewDataRow[]>({
        queryKey: ['appsTableData', 'current', dateRange],
        queryFn: () => fetchData(currentFrom, currentTo),
        enabled: !!currentFrom && !!currentTo,
    });
    
    const { data: rawPreviousData, isLoading: isLoadingPrevious } = useQuery<OverviewDataRow[]>({
        queryKey: ['appsTableData', 'previous', { from: previousFrom, to: previousTo }],
        queryFn: () => fetchData(previousFrom, previousTo),
        enabled: !!previousFrom && !!previousTo,
    });

    const processedData = useMemo(() => {
        const filteredCurrent = rawCurrentData?.filter(row => 
            (selectedApps.length === 0 || selectedApps.includes(row.app_name)) &&
            (selectedPlatforms.length === 0 || selectedPlatforms.includes(row.platform))
        );
        const filteredPrevious = rawPreviousData?.filter(row => 
            (selectedApps.length === 0 || selectedApps.includes(row.app_name)) &&
            (selectedPlatforms.length === 0 || selectedPlatforms.includes(row.platform))
        );

        const currentPeriodData = processPeriodData(filteredCurrent);
        const previousPeriodData = processPeriodData(filteredPrevious);
        
        const combinedData: ProcessedAppData[] = [];
        
        // Find app_name and platform from the latest data
        const appInfo = new Map<string, { app_name: string; platform: 'Android' | 'iOS'; node_icon: string }>();
        filteredCurrent?.forEach(row => {
            if (!appInfo.has(row.app_id)) {
                appInfo.set(row.app_id, { app_name: row.app_name, platform: row.platform, node_icon: row.node_icon });
            }
        });
        
        currentPeriodData.forEach((current, appId) => {
            const previous = previousPeriodData.get(appId) || { downloads: 0, revenue: 0, spent: 0, grossMargin: 0, roi: 0 };
            
            combinedData.push({
                ...current,
                app_name: appInfo.get(appId)?.app_name || '',
                platform: appInfo.get(appId)?.platform || 'Android',
                node_icon: appInfo.get(appId)?.node_icon || '',
                downloads_change: calculateChange(current.downloads, previous.downloads),
                revenue_change: calculateChange(current.revenue, previous.revenue),
                spent_change: calculateChange(current.spent, previous.spent),
                grossMargin_change: calculateChange(current.grossMargin, previous.grossMargin),
                roi_change: calculateChange(current.roi, previous.roi),
            });
        });

        // Sorting
        combinedData.sort((a, b) => {
            if (sorting.direction === 'asc') {
                return a[sorting.metric] - b[sorting.metric];
            } else {
                return b[sorting.metric] - a[sorting.metric];
            }
        });
        
        return combinedData;

    }, [rawCurrentData, rawPreviousData, selectedApps, selectedPlatforms, sorting]);
    
    return {
        data: processedData,
        isLoading: isLoadingCurrent || isLoadingPrevious,
    };
};
