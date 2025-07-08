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
    const response = await fetch(`/api/data-source/AppboomOverviewData?startDate=${start}&endDate=${end}`);
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
        if (!rawData) return { data: [], keys: [] };

        // 1. Pre-filter and add calculated metrics
        const baseData = rawData
            .filter(row => 
                (selectedApps.length === 0 || selectedApps.includes(row.app_name)) &&
                (selectedPlatforms.length === 0 || selectedPlatforms.includes(row.platform))
            )
            .map(row => ({
                ...row,
                margin: (row.revenue || 0) - (row.cost || 0),
                profit: (row.revenue || 0) - (row.cost || 0) - (row.custom_costs || 0)
            }));
            
        // 2. Aggregate by time period
        const timeAggregatedData = baseData.reduce((acc, row) => {
            const date = parseISO(row.date);
            let key = '';
            if (timeAggregation === 'daily') key = format(date, 'yyyy-MM-dd');
            else if (timeAggregation === 'weekly') key = format(startOfWeek(date), 'yyyy-MM-dd');
            else if (timeAggregation === 'monthly') key = format(startOfMonth(date), 'yyyy-MM-dd');

            const breakdownKey = breakdown === 'none' ? 'total' : row[breakdown];

            if (!acc[key]) acc[key] = {};
            if (!acc[key][breakdownKey]) {
                acc[key][breakdownKey] = {
                    downloads: 0, revenue: 0, cost: 0, custom_costs: 0, margin: 0, profit: 0,
                };
            }
            
            acc[key][breakdownKey][metric] += row[metric] || 0;
            
            return acc;
        }, {} as Record<string, Record<string, Record<Metric, number>>>);

        // 3. Handle Top 10 and "Others" if breakdown is active
        let finalKeys: string[] = ['total'];
        let dataForChart: ({ date: string; [key: string]: number | string })[] = [];

        if (breakdown !== 'none') {
            // Calculate totals for each breakdown item to find the top 10
            const totals = baseData.reduce((acc, row) => {
                const key = row[breakdown];
                if (!acc[key]) acc[key] = 0;
                acc[key] += row[metric] || 0;
                return acc;
            }, {} as Record<string, number>);

            const sortedKeys = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
            const top10Keys = sortedKeys.slice(0, 10);
            finalKeys = [...top10Keys];

            // If there are more than 10, group the rest into "Others"
            if(sortedKeys.length > 10) {
                finalKeys.push('Others');
                const otherKeys = sortedKeys.slice(10);
                
                Object.keys(timeAggregatedData).forEach(date => {
                    timeAggregatedData[date]['Others'] = {
                        downloads: 0, revenue: 0, cost: 0, custom_costs: 0, margin: 0, profit: 0,
                    };
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
                allDatesInRange = eachDayOfInterval({
                    start: from,
                    end: to
                });
            } else if (timeAggregation === 'weekly') {
                allDatesInRange = eachWeekOfInterval({
                    start: from,
                    end: to
                }, {
                    weekStartsOn: 1
                });
            } else { // monthly
                allDatesInRange = eachMonthOfInterval({
                    start: from,
                    end: to
                });
            }
            
            dataForChart = allDatesInRange.map(date => {
                let formattedDate = format(date, 'yyyy-MM-dd');
                const entry: { date: string; [key: string]: number | string } = {
                    date: formattedDate
                };
                const dataForDate = dateMap.get(formattedDate);

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
