'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type KpiCardProps = {
    title: string;
    value: number;
    change: number;
    sparklineData: { value: number }[];
    icon: React.ReactNode;
    formatAsCurrency?: boolean;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(num);
};

export function OverviewKpiCard({ title, value, change, sparklineData, icon, formatAsCurrency = false }: KpiCardProps) {
    const isPositive = change >= 0;
    const isChangeFinite = isFinite(change);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {formatAsCurrency ? formatCurrency(value) : formatNumber(value)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                    <Badge
                        variant={isPositive ? 'default' : 'destructive'}
                        className={cn(
                            "text-xs",
                            isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                        )}
                    >
                        {isPositive ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {isChangeFinite ? `${change.toFixed(1)}%` : 'N/A'}
                    </Badge>
                    <div className="w-20 h-8 ml-auto">
                        <ChartContainer config={{
                            value: {
                                label: title,
                                color: isPositive ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))",
                            }
                        }}>
                            <BarChart accessibilityLayer data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" hide />
                                <ChartTooltip 
                                    cursor={false} 
                                    content={<ChartTooltipContent indicator="line" hideLabel />} 
                                />
                                <Bar dataKey="value" fill={isPositive ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-5))'} radius={2} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 