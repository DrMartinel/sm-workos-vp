'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type AggregatedData = {
  downloads: number;
  revenue: number;
  adSpent: number;
  customCost: number;
  totalCost: number;
  grossMargin: number;
};

interface SummaryTableProps {
  data: {
    thisPeriod: AggregatedData;
    last30Days: AggregatedData;
    thisMonth: AggregatedData;
    lastMonth: AggregatedData;
  };
  isLoading: boolean;
}

const formatCurrency = (value: number) => {
    if (value === 0) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatNumber = (value: number) => {
    if (value === 0) return '-';
    return new Intl.NumberFormat('en-US').format(value);
}

const SummaryRow = ({
    label,
    data,
    formatter = formatCurrency,
    isBold = false,
    isIndented = false,
    isLoading,
}: {
    label: string;
    data: (number | string)[];
    formatter?: (value: number) => string;
    isBold?: boolean;
    isIndented?: boolean;
    isLoading: boolean;
}) => (
    <TableRow>
        <TableCell className={cn('font-medium text-sm py-2 px-4', isBold && 'font-bold', isIndented && 'pl-8')}>
            {label}
        </TableCell>
        {data.map((value, index) => (
            <TableCell key={index} className={cn('text-right text-sm py-2 px-4', isBold && 'font-bold')}>
                {isLoading ? <Skeleton className="h-5 w-20 float-right" /> : (typeof value === 'string' ? value : formatter(value))}
            </TableCell>
        ))}
    </TableRow>
);


export const OverviewSummaryTable = ({ data, isLoading }: SummaryTableProps) => {
  const tableData = [
    { label: 'Downloads', dataKey: 'downloads', formatter: formatNumber },
    { label: 'DAU', dataKey: 'dau', isStatic: true },
    { label: 'Revenue', dataKey: 'revenue' },
    { label: 'Cost', dataKey: 'totalCost', isBold: true },
    { label: 'Ad Spent', dataKey: 'adSpent', isIndented: true },
    { label: 'Custom Cost', dataKey: 'customCost', isIndented: true },
    { label: 'Gross Margin', dataKey: 'grossMargin' },
  ];
  
  const periods = ['thisPeriod', 'last30Days', 'thisMonth', 'lastMonth'] as const;

  return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-2 px-4">Metric</TableHead>
              <TableHead className="text-right py-2 px-4">This Period</TableHead>
              <TableHead className="text-right py-2 px-4">Last 30 Days</TableHead>
              <TableHead className="text-right py-2 px-4">This Month</TableHead>
              <TableHead className="text-right py-2 px-4">Last Month</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map(metric => (
              <SummaryRow
                key={metric.label}
                label={metric.label}
                data={
                    metric.isStatic 
                        ? ['-', '-', '-', '-']
                        : periods.map(p => data[p][metric.dataKey as keyof AggregatedData])
                }
                formatter={metric.formatter}
                isBold={metric.isBold}
                isIndented={metric.isIndented}
                isLoading={isLoading}
              />
            ))}
          </TableBody>
        </Table>
  );
};
