'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Define the structure of our new data
interface AppboomOverviewData {
  date: string;
  app_id: string;
  app_name: string;
  revenue: number;
  cost: number;
  downloads: number;
  custom_costs: number;
}

// Custom hook to fetch the data
const useAppboomOverviewData = (startDate: string, endDate: string) => {
  return useQuery<AppboomOverviewData[], Error>({
    queryKey: ['appboomOverviewData', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/data-source/AppboomOverviewData?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch data');
      }
      return response.json();
    },
  });
};

export default function SqlExamplePage() {
  // Use the new hook and a relevant date range
  const { data, error, isLoading } = useAppboomOverviewData('2025-06-01', '2025-07-01');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Appboom Overview Report (MySQL)</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App Overview Data</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Data</AlertTitle>
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>App Name</TableHead>
                  <TableHead>App ID</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                  <TableHead className="text-right">Custom Costs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: AppboomOverviewData, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell>{row.app_name}</TableCell>
                    <TableCell>{row.app_id}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.cost)}</TableCell>
                    <TableCell className="text-right">{row.downloads.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.custom_costs)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 