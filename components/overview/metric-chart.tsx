'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
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
}

// A color palette for the chart lines
const COLORS = [
    '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6',
    '#06b6d4', '#d946ef', '#f59e0b', '#10b981', '#64748b'
];

export const MetricChart = ({ data, keys, isLoading, title, valueFormatter }: MetricChartProps) => {
    const [hoveredLineKey, setHoveredLineKey] = useState<string | null>(null);

    const CustomTooltip = ({ active, payload, label }: any) => {
        // Only show tooltip if a line is actively hovered
        if (hoveredLineKey && active && payload && payload.length) {
            const finalPayload = payload.filter((p: any) => p.dataKey === hoveredLineKey);

            if (!finalPayload.length) return null;

            return (
                <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm">
                    <p className="font-bold text-gray-800">{`Date: ${label}`}</p>
                    {finalPayload.map((pld: any, index: number) => (
                        <div key={index} style={{ color: pld.color }}>
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
    
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                onMouseLeave={() => setHoveredLineKey(null)}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={valueFormatter} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }} isAnimationActive={false}/>
                {keys.map((key, index) => (
                    <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                        onMouseEnter={() => setHoveredLineKey(key)}
                        isAnimationActive={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};
