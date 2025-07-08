'use client';

import React, { useState } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricChartProps {
    data: any[];
    keys: string[];
    isLoading: boolean;
    title: string;
    valueFormatter: (value: number) => string;
    isAreaChart: boolean; // Use Area chart if true
}

// A color palette for the chart lines/areas
const COLORS = [
    '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6',
    '#06b6d4', '#d946ef', '#f59e0b', '#10b981', '#64748b'
];
const PRIMARY_COLOR = '#3b82f6';

const formatCompactNumber = (number: number): string => {
    if (Math.abs(number) >= 1e9) {
        return (number / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (Math.abs(number) >= 1e6) {
        return (number / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (Math.abs(number) >= 1e3) {
        return (number / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return number.toString();
};

const chartGlobalStyles = `
    .recharts-wrapper:focus-visible,
    .recharts-surface:focus-visible {
        outline: none !important;
    }
`;

export const MetricChart = ({ data, keys, isLoading, title, valueFormatter, isAreaChart }: MetricChartProps) => {
    const [hoveredLineKey, setHoveredLineKey] = useState<string | null>(null);

    const CustomTooltip = ({ active, payload, label }: any) => {
        const lineKey = isAreaChart ? keys[0] : hoveredLineKey;
        if (lineKey && active && payload && payload.length) {
            const finalPayload = payload.filter((p: any) => p.dataKey === lineKey);

            if (!finalPayload.length) return null;

            return (
                <div className="bg-background p-2 border rounded-md shadow-sm">
                    <p className="font-bold text-foreground">{`${label}`}</p>
                    {finalPayload.map((pld: any, index: number) => (
                        <div key={index} style={{ color: pld.color || pld.stroke }}>
                            {`${pld.name}: ${valueFormatter(pld.value)}`}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        );
    }
    
    const ChartComponent = isAreaChart ? AreaChart : LineChart;

    return (
        <>
            <style>{chartGlobalStyles}</style>
            <div className="focus:outline-none" tabIndex={-1} style={{ outline: 'none' }}>
                <ResponsiveContainer width="100%" height={350}>
                    <ChartComponent
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        onMouseLeave={() => setHoveredLineKey(null)}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }} isAnimationActive={false}/>
                        {keys.map((key, index) => (
                            isAreaChart ? (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={PRIMARY_COLOR}
                                    fill={PRIMARY_COLOR}
                                    fillOpacity={0.25}
                                    strokeWidth={2}
                                    onMouseEnter={() => setHoveredLineKey(key)}
                                    isAnimationActive={false}
                                />
                            ) : (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6, fill: COLORS[index % COLORS.length], stroke: 'white', strokeWidth: 2 }}
                                    onMouseEnter={() => setHoveredLineKey(key)}
                                    isAnimationActive={false}
                                />
                            )
                        ))}
                    </ChartComponent>
                </ResponsiveContainer>
            </div>
        </>
    );
};
