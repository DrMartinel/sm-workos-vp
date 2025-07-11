'use client';

import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { format, startOfWeek, startOfMonth, parseISO, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { useMemo } from 'react';

// --- TYPE DEFINITIONS ---
export type Metric = 'downloads' | 'revenue' | 'cost' | 'custom_costs' | 'margin' | 'profit';
export type Breakdown = 'none' | 'app_name' | 'platform';
export type TimeAggregation = 'daily' | 'weekly' | 'monthly';

type OverviewDataRow = {
  date: string; // ISO 8601 format string e.g. "2024-07-29T00:00:00.000Z"
  app_name: string;
  platform: 'Android' | 'iOS';
  revenue: number;
  cost: number; // This is ad_cost
  downloads: number;
  custom_costs: number;
};

// --- DATA FETCHING ---
const fetchData = async (startDate?: Date, endDate?: Date): Promise<OverviewDataRow[]> => {
    if (!startDate || !endDate) return [];
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    const response = await fetch(`/api/data-source/MySQL_AppboomOverviewData?startDate=${start}&endDate=${end}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch chart data');
    }
    return response.json();
};

// --- MAIN HOOK ---
export const useChartData = (
    dateRange: DateRange | undefined,
    selectedApps: string[],
    selectedPlatforms: string[],
    metric: Metric,
    breakdown: Breakdown,
    timeAggregation: TimeAggregation
) => {
    const { from, to } = dateRange || {};

    const { data: rawData, isLoading, error } = useQuery<OverviewDataRow[]>({
        queryKey: ['chartData', from, to],
        queryFn: () => fetchData(from, to),
        enabled: !!from && !!to,
    });

    const processedData = useMemo(() => {
        if (!rawData || !from || !to) return { data: [], keys: [] };

        // Create a map of the unique custom cost for each day from the original data source.
        const dailyUniqueCustomCosts = (rawData || []).reduce((acc, row) => {
            const dateKey = format(parseISO(row.date), 'yyyy-MM-dd');
            acc.set(dateKey, row.custom_costs || 0);
            return acc;
        }, new Map<string, number>());

        // This map tracks which days have already had their custom cost assigned.
        const costAssignedPerDay = new Set<string>();

        // 1. Filter data and correctly distribute the daily custom_cost ONCE per day.
        const baseData = rawData
            .filter(row => 
                (selectedApps.length === 0 || selectedApps.includes(row.app_name)) &&
                (selectedPlatforms.length === 0 || selectedPlatforms.includes(row.platform))
            )
            .map(row => {
                const dateKey = format(parseISO(row.date), 'yyyy-MM-dd');
                let customCostForThisRow = 0;
                
                // If we haven't added the cost for this day yet, add it to this row and mark the day as processed.
                if (!costAssignedPerDay.has(dateKey)) {
                    customCostForThisRow = dailyUniqueCustomCosts.get(dateKey) || 0;
                    costAssignedPerDay.add(dateKey);
                }
                
                return {
                    ...row,
                    // The custom_costs for this specific row is now either the full daily amount or 0.
                    custom_costs: customCostForThisRow,
                    margin: (row.revenue || 0) - (row.cost || 0),
                    // The profit calculation now uses the corrected custom cost for the row.
                    profit: (row.revenue || 0) - (row.cost || 0) - customCostForThisRow
                };
            });
            
        // 2. Aggregate by time period. The aggregation now correctly sums the custom_costs.
        const timeAggregatedData = baseData.reduce((acc, row) => {
            const date = parseISO(row.date);
            let key = '';
            if (timeAggregation === 'daily') key = format(date, 'yyyy-MM-dd');
            else if (timeAggregation === 'weekly') key = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            else if (timeAggregation === 'monthly') key = format(startOfMonth(date), 'yyyy-MM-dd');

            const breakdownKey = breakdown === 'none' ? 'total' : row[breakdown];

            if (!acc[key]) acc[key] = {};
            if (!acc[key][breakdownKey]) {
                acc[key][breakdownKey] = { downloads: 0, revenue: 0, cost: 0, custom_costs: 0, margin: 0, profit: 0 };
            }
            
            // This += now works correctly because custom_costs is 0 for all but one row per day.
            acc[key][breakdownKey][metric] += row[metric] || 0;
            
            return acc;
        }, {} as Record<string, Record<string, Record<Metric, number>>>);

        // 3. Handle Top 10 and "Others" if breakdown is active
        let finalKeys: string[] = ['total'];
        let dataForChart: ({ date: string; [key: string]: number | string })[] = [];

        if (breakdown !== 'none') {
            const totals = baseData.reduce((acc, row) => {
                const key = row[breakdown];
                if (!acc[key]) acc[key] = 0;
                acc[key] += row[metric] || 0;
                return acc;
            }, {} as Record<string, number>);

            const sortedKeys = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
            const top10Keys = sortedKeys.slice(0, 10);
            finalKeys = [...top10Keys];

            if(sortedKeys.length > 10) {
                finalKeys.push('Others');
                const otherKeys = sortedKeys.slice(10);
                
                Object.keys(timeAggregatedData).forEach(date => {
                    if (!timeAggregatedData[date]['Others']) {
                         timeAggregatedData[date]['Others'] = { downloads: 0, revenue: 0, cost: 0, custom_costs: 0, margin: 0, profit: 0 };
                    }
                    otherKeys.forEach(key => {
                        if (timeAggregatedData[date][key]) {
                            timeAggregatedData[date]['Others'][metric] += timeAggregatedData[date][key][metric]
                            delete timeAggregatedData[date][key];
                        }
                    });
                });
            }
        }
        
        // 4. Format data for recharts, ensuring the timeline is continuous
        if (from && to) {
            let dateMap: Map<string, Record<string, any>> = new Map(
                Object.entries(timeAggregatedData).map(([date, values]) => [date, values])
            );

            let allDatesInRange: Date[] = [];
            if (timeAggregation === 'daily') {
                allDatesInRange = eachDayOfInterval({ start: from, end: to });
            } else if (timeAggregation === 'weekly') {
                allDatesInRange = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
            } else {
                allDatesInRange = eachMonthOfInterval({ start: from, end: to });
            }
            
            dataForChart = allDatesInRange.map(date => {
                const formattedDateKey = format(date, 'yyyy-MM-dd');
                const entry: { date: string; [key: string]: number | string } = { date: format(date, 'MMM dd') };
                const dataForDate = dateMap.get(formattedDateKey);

                finalKeys.forEach(key => {
                    entry[key] = dataForDate?.[key]?.[metric] ?? 0;
                });
                return entry;
            });
        }

        return { data: dataForChart, keys: finalKeys };

    }, [rawData, metric, breakdown, timeAggregation, selectedApps, selectedPlatforms, from, to]);

    return {
        data: processedData.data,
        keys: processedData.keys,
        isLoading,
        error,
    };
};
