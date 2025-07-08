'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useChartData, Metric, Breakdown, TimeAggregation } from '@/hooks/use-chart-data';
import { MetricChart } from './metric-chart';
import { DateRange } from 'react-day-picker';
import { OverviewSummaryTable } from './summary-table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

type AggregatedData = {
    downloads: number;
    revenue: number;
    adSpent: number;
    customCost: number;
    totalCost: number;
    profit: number;
  };
  
interface ChartsSectionProps {
    dateRange: DateRange | undefined;
    selectedApps: string[];
    selectedPlatforms: string[];
    summaryData: {
        thisPeriod: AggregatedData;
        last30Days: AggregatedData;
        thisMonth: AggregatedData;
        lastMonth: AggregatedData;
    };
    isSummaryLoading: boolean;
}

const formatCompactNumber = (number: number) => {
    if (Math.abs(number) >= 1e9) return (number / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (Math.abs(number) >= 1e6) return (number / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(number) >= 1e3) return (number / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return number.toString();
};

const formatCurrencyCompact = (val: number) => {
    const formatted = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
        compactDisplay: 'short'
    }).format(val);
    // The default compact format might include spaces, e.g., "1,2 tr ₫". 
    // This removes them for a cleaner look, e.g., "1,2tr₫"
    return formatted.replace(/\s/g, '');
};

const METRICS: { value: Metric; label: string; formatter: (val: number) => string }[] = [
    { value: 'revenue', label: 'Revenue', formatter: formatCurrencyCompact },
    { value: 'downloads', label: 'Downloads', formatter: (val) => new Intl.NumberFormat('en-US').format(val) },
    { value: 'cost', label: 'Ad Cost', formatter: formatCurrencyCompact },
    { value: 'custom_costs', label: 'Custom Costs', formatter: formatCurrencyCompact },
    { value: 'margin', label: 'Margin', formatter: formatCurrencyCompact },
    { value: 'profit', label: 'Profit', formatter: formatCurrencyCompact },
];

export const ChartsSection = ({ dateRange, selectedApps, selectedPlatforms, summaryData, isSummaryLoading }: ChartsSectionProps) => {
    const [activeMetric, setActiveMetric] = useState<Metric>('revenue');
    const [breakdown, setBreakdown] = useState<Breakdown>('none');
    const [timeAggregation, setTimeAggregation] = useState<TimeAggregation>('daily');
    
    const handleBreakdownChange = (newBreakdown: Breakdown) => {
        setBreakdown(newBreakdown);
        if (newBreakdown !== 'none' && (activeMetric === 'custom_costs' || activeMetric === 'profit')) {
            setActiveMetric('revenue');
        }
    };
    
    const { data, keys, isLoading } = useChartData(
        dateRange,
        selectedApps,
        selectedPlatforms,
        activeMetric,
        breakdown,
        timeAggregation
    );

    const activeMetricConfig = METRICS.find(m => m.value === activeMetric);

    return (
        <Card>
            <CardHeader>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4">
                    {/* Metrics Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {METRICS.map(m => {
                            const isDisabled = breakdown !== 'none' && (m.value === 'custom_costs' || m.value === 'profit');
                            return (
                                <Button
                                    key={m.value}
                                    variant={activeMetric === m.value ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveMetric(m.value)}
                                    disabled={isDisabled}
                                    className="h-8 px-3 rounded-full"
                                >
                                    {m.label}
                                </Button>
                            )
                        })}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Select value={breakdown} onValueChange={handleBreakdownChange}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Breakdown by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Breakdown</SelectItem>
                                <SelectItem value="app_name">App</SelectItem>
                                <SelectItem value="platform">Platform</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={timeAggregation} onValueChange={(value: TimeAggregation) => setTimeAggregation(value)}>
                            <SelectTrigger className="w-full sm:w-[120px]">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <MetricChart
                   data={data}
                   keys={keys}
                   isLoading={isLoading}
                   title={activeMetricConfig?.label || ''}
                   valueFormatter={activeMetricConfig?.formatter || ((v) => `${v}`)}
                   isAreaChart={breakdown === 'none'}
                />
                <Separator />
                <OverviewSummaryTable data={summaryData} isLoading={isSummaryLoading} />
            </CardContent>
        </Card>
    );
};
