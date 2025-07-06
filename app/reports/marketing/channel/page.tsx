"use client"

import { Label } from "@/components/ui/label"

import { useState, useMemo, useEffect } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ComposedChart,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import { format, subDays, eachDayOfInterval, parseISO, startOfToday, startOfMonth, subMonths, endOfMonth } from "date-fns"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  UserMinus,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MultiSelectFilter } from "@/components/ui/multi-select-filter"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import React from "react"

// --- Helper Functions ---
function formatLargeNumber(value: number, decimalPlaces: number = 2): string {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(decimalPlaces)}B`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(decimalPlaces)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(decimalPlaces)}K`;
    }
    return value.toFixed(decimalPlaces);
}

// --- Custom Hook to Fetch and Process Adjust Cohort Data ---
interface RawDataRow {
    date: string;
    cost: number;
    install: number;
    REV_D0: number;
    REV_D3: number;
    REV_D30: number;
    RATIO_REVD30_REVD3: number;
    app_fullname?: string;
    country_code?: string;
    channel?: string;
    campaign_name?: string;
    mmp?: string;
    [key: string]: any;
}

const dateRanges = {
  'last_7_days': { label: 'Last 7 days' },
  'last_30_days': { label: 'Last 30 days' },
  'last_90_days': { label: 'Last 90 days' },
  'this_month': { label: 'This month' },
  'last_month': { label: 'Last month' },
};
type DateRangeKey = keyof typeof dateRanges;

function calculateDateRange(key: DateRangeKey): { startDate: string, endDate: string } {
    const today = startOfToday();
    const end = today; // Most ranges end today
    let start;

    switch (key) {
        case 'last_7_days':
            start = subDays(today, 6);
            break;
        case 'last_30_days':
            start = subDays(today, 29);
            break;
        case 'last_90_days':
            start = subDays(today, 89);
            break;
        case 'this_month':
            start = startOfMonth(today);
            break;
        case 'last_month':
            const startOfThisMonth = startOfMonth(today);
            start = startOfMonth(subMonths(startOfThisMonth, 1));
            const endOfLastMonth = endOfMonth(start);
            return {
                startDate: format(start, 'yyyyMMdd'),
                endDate: format(endOfLastMonth, 'yyyyMMdd'),
            };
        default:
            // Default to last 30 days
            start = subDays(today, 29);
    }
    return {
        startDate: format(start, 'yyyyMMdd'),
        endDate: format(end, 'yyyyMMdd'),
    };
}

function useAdjustCohortData(startDate?: string, endDate?: string) {
    const [rawData, setRawData] = useState<RawDataRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!startDate || !endDate) {
            setLoading(false);
            setRawData([]);
            return;
        };

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/data-source/AdjustCohortData?startDate=${startDate}&endDate=${endDate}`);
                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }
                const result = await response.json();
                if (result.error) {
                    throw new Error(result.details || result.error);
                }
                setRawData(result);
            } catch (e) {
                setError(e instanceof Error ? e.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [startDate, endDate]);

    const processedData = useMemo(() => {
        if (rawData.length === 0) return { roasData: [], cpiData: [] };

        // 1. Group all raw data by date and aggregate metrics
        const dailyAggregates = rawData.reduce((acc: Record<string, { cost: number; install: number; rev_d0: number; rev_d3: number; rev_d30: number; ratio_d30_d3: number; }>, row: RawDataRow) => {
            const date = row.date;
            if (!acc[date]) {
                acc[date] = {
                    cost: 0,
                    install: 0,
                    rev_d0: 0,
                    rev_d3: 0,
                    rev_d30: 0,
                    ratio_d30_d3: row.RATIO_REVD30_REVD3 || 1 
                };
            }
            acc[date].cost += row.cost || 0;
            acc[date].install += row.install || 0;
            acc[date].rev_d0 += row.REV_D0 || 0;
            acc[date].rev_d3 += row.REV_D3 || 0;
            acc[date].rev_d30 += row.REV_D30 || 0;
            return acc;
        }, {} as Record<string, { cost: number; install: number; rev_d0: number; rev_d3: number; rev_d30: number; ratio_d30_d3: number; }>);
        
        const sortedDates = Object.keys(dailyAggregates).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

        // 2. Map aggregated data to the specific structures required by the charts
        const roasData = sortedDates.map(date => {
            const metrics = dailyAggregates[date];
            const cost = metrics.cost;
            
            const roasD0 = cost > 0 ? (metrics.rev_d0 / cost) * 100 : 0;
            const roasD30 = cost > 0 ? (metrics.rev_d30 / cost) * 100 : 0;
            const eRoasD30 = cost > 0 ? (metrics.rev_d3 * metrics.ratio_d30_d3) / cost * 100 : 0;

            return {
                date: format(parseISO(date), 'MMM dd'),
                roasD0,
                roasD30,
                eRoasD30
            };
        });

        const cpiData = sortedDates.map(date => {
            const metrics = dailyAggregates[date];
            const install = metrics.install;

            const cpi = install > 0 ? metrics.cost / install : 0;
            const eLtvD30 = install > 0 ? (metrics.rev_d3 * metrics.ratio_d30_d3) / install : 0;
            
            return {
                date: format(parseISO(date), 'MMM dd'),
                cpi,
                eLtvD30,
                cost: metrics.cost
            };
        });

        return { roasData, cpiData };

    }, [rawData]);

    return { ...processedData, rawData, loading, error };
}

// Custom hook to extract filter options from raw data, sort theo cost giảm dần
function useAdjustCohortFilters(rawData: RawDataRow[]) {
    return useMemo(() => {
        const costMap = {
            app_fullname: new Map<string, number>(),
            country_code: new Map<string, number>(),
            channel: new Map<string, number>(),
            campaign_name: new Map<string, number>(),
            mmp: new Map<string, number>(),
        };
        rawData.forEach(row => {
            if (row.app_fullname) costMap.app_fullname.set(row.app_fullname, (costMap.app_fullname.get(row.app_fullname) || 0) + (row.cost || 0));
            if (row.country_code) costMap.country_code.set(row.country_code, (costMap.country_code.get(row.country_code) || 0) + (row.cost || 0));
            if (row.channel) costMap.channel.set(row.channel, (costMap.channel.get(row.channel) || 0) + (row.cost || 0));
            if (row.campaign_name) costMap.campaign_name.set(row.campaign_name, (costMap.campaign_name.get(row.campaign_name) || 0) + (row.cost || 0));
            if (row.mmp) costMap.mmp.set(row.mmp, (costMap.mmp.get(row.mmp) || 0) + (row.cost || 0));
        });
        const sortByCostDesc = (map: Map<string, number>) =>
            Array.from(map.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([key]) => key);
        return {
            app_fullname: sortByCostDesc(costMap.app_fullname),
            country_code: sortByCostDesc(costMap.country_code),
            channel: sortByCostDesc(costMap.channel),
            campaign_name: sortByCostDesc(costMap.campaign_name),
            mmp: sortByCostDesc(costMap.mmp),
        };
    }, [rawData]);
}

// Mock Data
const kpiData = [
  {
    title: "Total Revenue",
    value: "$2,847,392",
    change: 12.5,
    trend: "up",
    icon: DollarSign,
    sparkline: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
  },
  {
    title: "Active Users",
    value: "24,847",
    change: 8.2,
    trend: "up",
    icon: Users,
    sparkline: [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86],
  },
  {
    title: "Churn Rate",
    value: "3.2%",
    change: -2.1,
    trend: "down",
    icon: UserMinus,
    sparkline: [35, 25, 15, 30, 20, 25, 15, 35, 25, 15, 30, 20],
  },
  {
    title: "Avg Session Time",
    value: "4m 32s",
    change: 5.7,
    trend: "up",
    icon: Clock,
    sparkline: [20, 30, 25, 35, 30, 40, 35, 20, 30, 25, 35, 30],
  },
]

const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "MMM dd"),
  users: Math.floor(Math.random() * 5000) + 15000,
  sessions: Math.floor(Math.random() * 8000) + 20000,
  pageViews: Math.floor(Math.random() * 15000) + 50000,
}))

const trafficSourcesData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "MMM dd"),
  organic: Math.floor(Math.random() * 3000) + 5000,
  paid: Math.floor(Math.random() * 2000) + 3000,
  social: Math.floor(Math.random() * 1500) + 2000,
  direct: Math.floor(Math.random() * 2500) + 4000,
}))

const revenueByProductData = [
  { product: "Product A", revenue: 847392, percentage: 35 },
  { product: "Product B", revenue: 634829, percentage: 26 },
  { product: "Product C", revenue: 523847, percentage: 22 },
  { product: "Product D", revenue: 384729, percentage: 17 },
]

const conversionFunnelData = [
  { stage: "Visitors", desktop: 12000, mobile: 8000 },
  { stage: "Sign-ups", desktop: 3600, mobile: 2400 },
  { stage: "Trials", desktop: 1800, mobile: 1200 },
  { stage: "Purchases", desktop: 540, mobile: 360 },
]

const categoryBreakdownData = [
  { name: "Technology", value: 35, color: "#3b82f6" },
  { name: "Marketing", value: 25, color: "#10b981" },
  { name: "Sales", value: 20, color: "#f59e0b" },
  { name: "Support", value: 12, color: "#ef4444" },
  { name: "Operations", value: 8, color: "#8b5cf6" },
]

const radarData = [
  { metric: "Performance", value: 85, fullMark: 100 },
  { metric: "Usability", value: 92, fullMark: 100 },
  { metric: "Security", value: 78, fullMark: 100 },
  { metric: "Scalability", value: 88, fullMark: 100 },
  { metric: "Reliability", value: 95, fullMark: 100 },
  { metric: "Innovation", value: 82, fullMark: 100 },
]

const generateCalendarData = () => {
  const days = eachDayOfInterval({
    start: subDays(new Date(), 89),
    end: new Date(),
  })
  return days.map((day) => ({
    date: format(day, "yyyy-MM-dd"),
    value: Math.floor(Math.random() * 100),
  }))
}

const scatterData = Array.from({ length: 50 }, (_, i) => ({
  revenue: Math.floor(Math.random() * 100000) + 10000,
  retention: Math.floor(Math.random() * 100) + 1,
  cohort: ["Q1", "Q2", "Q3", "Q4"][Math.floor(Math.random() * 4)],
  size: Math.floor(Math.random() * 1000) + 100,
}))

const projectsData = [
  {
    id: 1,
    name: "E-commerce Platform",
    owner: "John Doe",
    status: "Active",
    updated: "2024-01-15",
    revenue: 125000,
    tags: ["Frontend", "React"],
  },
  {
    id: 2,
    name: "Mobile App",
    owner: "Jane Smith",
    status: "In Progress",
    updated: "2024-01-14",
    revenue: 89000,
    tags: ["Mobile", "React Native"],
  },
  {
    id: 3,
    name: "Analytics Dashboard",
    owner: "Mike Johnson",
    status: "Completed",
    updated: "2024-01-13",
    revenue: 67000,
    tags: ["Analytics", "Vue"],
  },
  {
    id: 4,
    name: "CRM System",
    owner: "Sarah Wilson",
    status: "Active",
    updated: "2024-01-12",
    revenue: 156000,
    tags: ["Backend", "Node.js"],
  },
  {
    id: 5,
    name: "Marketing Website",
    owner: "Tom Brown",
    status: "Paused",
    updated: "2024-01-11",
    revenue: 34000,
    tags: ["Frontend", "Next.js"],
  },
]

const roasData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "MMM dd"),
  roasD0: Math.floor(Math.random() * 40) + 40, // 40-80%
  roasD30: Math.floor(Math.random() * 30) + 50, // 50-80%
  eRoasD30: Math.floor(Math.random() * 50) + 80, // 80-130%
  cost: Math.floor(Math.random() * 200000000) + 300000000, // 300M-500M
}))

const cpiData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "MMM dd"),
  cpi: Math.floor(Math.random() * 400) + 500, // 500-900
  eLtvD30: Math.floor(Math.random() * 200) + 700, // 700-900
  cost: Math.floor(Math.random() * 150000000) + 300000000, // 300M-450M
}))

// Sparkline Component
const Sparkline = ({ data }: { data: number[] }) => (
  <ResponsiveContainer width="100%" height={40}>
    <LineChart data={data.map((value, index) => ({ index, value }))}>
      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={false} />
    </LineChart>
  </ResponsiveContainer>
)

// Calendar Heatmap Component
const CalendarHeatmap = ({ data }: { data: Array<{ date: string; value: number }> }) => {
  const getIntensity = (value: number) => {
    if (value < 20) return "bg-gray-100"
    if (value < 40) return "bg-blue-200"
    if (value < 60) return "bg-blue-400"
    if (value < 80) return "bg-blue-600"
    return "bg-blue-800"
  }

  return (
    <div className="grid grid-cols-13 gap-1">
      {data.map((day) => (
        <div
          key={day.date}
          className={cn("w-3 h-3 rounded-sm", getIntensity(day.value))}
          title={`${day.date}: ${day.value}`}
        />
      ))}
    </div>
  )
}

// Custom horizontal scrollable legend
function ChannelLegend({ channels, colors }: { channels: string[], colors: string[] }) {
  return (
    <div className="overflow-x-auto mt-2 pb-1">
      <div className="flex gap-4 min-w-max">
        {channels.map((channel, idx) => (
          <div key={channel} className="flex items-center gap-1 whitespace-nowrap">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: colors[idx % colors.length] }} />
            <span className="text-xs" style={{ color: colors[idx % colors.length] }}>{channel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1", "#f472b6", "#22d3ee", "#16a34a", "#eab308", "#f43f5e", "#a21caf", "#0ea5e9", "#facc15", "#f87171"];

export default function ReportsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const startDate = date?.from ? format(date.from, 'yyyyMMdd') : undefined;
    const endDate = date?.to ? format(date.to, 'yyyyMMdd') : undefined;

    const { roasData, cpiData, rawData, loading, error } = useAdjustCohortData(startDate, endDate);
    const filters = useAdjustCohortFilters(rawData || []);

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        app_fullname: [],
        country_code: [],
        channel: [],
        campaign_name: [],
        mmp: [],
    });

    const handleFilterChange = (filterName: string, values: string[]) => {
        setSelectedFilters(prev => ({ ...prev, [filterName]: values }));
    };

    // Tính filteredRows dùng chung cho tất cả chart
    const filteredRows = useMemo(() => {
        if (!rawData) return [];
        const hasActiveFilters = Object.values(selectedFilters).some(v => v.length > 0);
        if (!hasActiveFilters) return rawData;
        return rawData.filter((row: RawDataRow) => {
            return Object.entries(selectedFilters).every(([key, values]) => {
                if (values.length === 0) return true;
                const rowValue = row[key];
                return rowValue !== undefined && values.includes(rowValue);
            });
        });
    }, [rawData, selectedFilters]);

    // Lọc channel có tổng cost > 0 cho cả 2 chart dựa trên filteredRows
    const channelCostMap: Record<string, number> = {};
    filteredRows.forEach((row: RawDataRow) => {
      if (row.channel) channelCostMap[row.channel] = (channelCostMap[row.channel] || 0) + (row.cost || 0);
    });
    const filteredChannels = Object.entries(channelCostMap).filter(([_, cost]) => cost > 0).map(([channel]) => channel);

    // ROAS D0 by Channel chart data
    const roasD0ByChannelChartData = useMemo(() => {
        if (!filteredRows || filteredRows.length === 0) return [];
        const channels = filteredChannels;
        const dateMap: Record<string, Record<string, { rev_d0: number; cost: number }>> = {};
        filteredRows.forEach((row: RawDataRow) => {
            if (!row.date || !row.channel || !channels.includes(row.channel)) return;
            if (!dateMap[row.date]) dateMap[row.date] = {};
            if (!dateMap[row.date][row.channel]) dateMap[row.date][row.channel] = { rev_d0: 0, cost: 0 };
            dateMap[row.date][row.channel].rev_d0 += row.REV_D0 || 0;
            dateMap[row.date][row.channel].cost += row.cost || 0;
        });
        const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        return sortedDates.map(date => {
            const entry: Record<string, any> = { date: format(parseISO(date), 'MMM dd') };
            channels.forEach(channel => {
                const data = dateMap[date][channel];
                entry[channel] = data && data.cost > 0 ? Math.round((data.rev_d0 / data.cost) * 100) : 0;
            });
            return entry;
        });
    }, [filteredRows, filteredChannels]);

    // Traffic Sources chart data
    const trafficSourcesChartData = useMemo(() => {
      if (!filteredRows || filteredRows.length === 0) return [];
      const channels = filteredChannels;
      const dateMap: Record<string, Record<string, number>> = {};
      filteredRows.forEach((row: RawDataRow) => {
        if (!row.date || !row.channel || !channels.includes(row.channel)) return;
        if (!dateMap[row.date]) dateMap[row.date] = {};
        dateMap[row.date][row.channel] = (dateMap[row.date][row.channel] || 0) + (row.cost || 0);
      });
      const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      return sortedDates.map(date => {
        const entry: Record<string, any> = { date: format(parseISO(date), 'MMM dd') };
        channels.forEach(channel => {
          entry[channel] = dateMap[date][channel] || 0;
        });
        return entry;
      });
    }, [filteredRows, filteredChannels]);

    // Legend channel list cho từng chart
    const roasD0Channels = filteredChannels;
    const trafficChannels = filteredChannels;

    // Tính toán lại filteredChartData dựa trên filteredRows
    const filteredChartData = useMemo(() => {
        if (!filteredRows || filteredRows.length === 0) return { roasData: [], cpiData: [], stats: { averageCpi: 0, totalCost: 0, averageRoasD0: 0, averageERoasD30: 0 } };
        const processAggregatedData = (data: RawDataRow[]) => {
            if (data.length === 0) return { roasData: [], cpiData: [], stats: { averageCpi: 0, totalCost: 0, averageRoasD0: 0, averageERoasD30: 0 } };
            const dailyAggregates = data.reduce((acc: Record<string, { cost: number; install: number; rev_d0: number; rev_d3: number; rev_d30: number; ratio_d30_d3: number; }>, row: RawDataRow) => {
                const date = row.date;
                if (!acc[date]) {
                    acc[date] = { cost: 0, install: 0, rev_d0: 0, rev_d3: 0, rev_d30: 0, ratio_d30_d3: row.RATIO_REVD30_REVD3 || 1 };
                }
                acc[date].cost += row.cost || 0;
                acc[date].install += row.install || 0;
                acc[date].rev_d0 += row.REV_D0 || 0;
                acc[date].rev_d3 += row.REV_D3 || 0;
                acc[date].rev_d30 += row.REV_D30 || 0;
                return acc;
            }, {});
            const totalCost = Object.values(dailyAggregates).reduce((sum, day) => sum + day.cost, 0);
            const totalInstall = Object.values(dailyAggregates).reduce((sum, day) => sum + day.install, 0);
            const averageCpi = totalInstall > 0 ? totalCost / totalInstall : 0;
            const totalRevD0 = Object.values(dailyAggregates).reduce((sum, day) => sum + day.rev_d0, 0);
            const totalPredictedRevD30 = Object.values(dailyAggregates).reduce((sum, day) => sum + (day.rev_d3 * day.ratio_d30_d3), 0);
            const averageRoasD0 = totalCost > 0 ? (totalRevD0 / totalCost) * 100 : 0;
            const averageERoasD30 = totalCost > 0 ? (totalPredictedRevD30 / totalCost) * 100 : 0;
            const sortedDates = Object.keys(dailyAggregates).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
            const roasData = sortedDates.map(date => {
                const metrics = dailyAggregates[date];
                const cost = metrics.cost;
                const roasD0 = cost > 0 ? (metrics.rev_d0 / cost) * 100 : 0;
                const roasD30 = cost > 0 ? (metrics.rev_d30 / cost) * 100 : 0;
                const eRoasD30 = cost > 0 ? (metrics.rev_d3 * metrics.ratio_d30_d3) / cost * 100 : 0;
                return { date: format(parseISO(date), 'MMM dd'), roasD0, roasD30, eRoasD30, cost: metrics.cost };
            });
            const cpiData = sortedDates.map(date => {
                const metrics = dailyAggregates[date];
                const install = metrics.install;
                const cpi = install > 0 ? metrics.cost / install : 0;
                const eLtvD30 = install > 0 ? (metrics.rev_d3 * metrics.ratio_d30_d3) / install : 0;
                return { date: format(parseISO(date), 'MMM dd'), cpi, eLtvD30, cost: metrics.cost };
            });
            return { roasData, cpiData, stats: { averageCpi, totalCost, averageRoasD0, averageERoasD30 } };
        };
        return processAggregatedData(filteredRows);
    }, [filteredRows]);

    // Tính lại roasChartMax và cpiChartMax dựa trên filteredChartData
    const roasChartMax = useMemo(() => {
        if (!filteredChartData.roasData || filteredChartData.roasData.length === 0) {
            return 150; // Default
        }
        const maxVal = filteredChartData.roasData.reduce((max, item) => {
            const currentMax = Math.max(item.roasD0, item.roasD30, item.eRoasD30);
            return currentMax > max ? currentMax : max;
        }, 0);
        return Math.max(maxVal * 1.2, 110); 
    }, [filteredChartData.roasData]);

    const cpiChartMax = useMemo(() => {
        if (!filteredChartData.cpiData || filteredChartData.cpiData.length === 0) {
            return 1000; // A default value if no data
        }
        const maxVal = filteredChartData.cpiData.reduce((max, item) => {
            const currentMax = Math.max(item.cpi, item.eLtvD30);
            return currentMax > max ? currentMax : max;
        }, 0);
        if (maxVal === 0) return 1;
        return maxVal * 1.2;
    }, [filteredChartData.cpiData]);

    // Sau khi đã gọi hết các hook, mới return sớm nếu cần
    const isInitialLoad = !rawData || rawData.length === 0;
    if (loading && isInitialLoad) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-lg text-gray-600">Loading report data...</p>
                    <p className="text-sm text-gray-500">Please wait a moment.</p>
                </div>
            </div>
        );
    }
    if (error) {
        return <div className="p-8 text-center text-red-500">Error loading data: {error}</div>;
    }

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );

    const filterConfigs = [
        {name: 'app_fullname', label: 'Apps'},
        {name: 'country_code', label: 'Countries'},
        {name: 'channel', label: 'Channels'},
        {name: 'campaign_name', label: 'Campaigns'},
        {name: 'mmp', label: 'MMPs'},
    ]

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="space-y-6">
                {/* Title Section */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500 mt-1">Comprehensive analytics and insights for your business.</p>
                </div>

                {/* Filters and Actions */}
                <div className="flex items-center justify-between">
                    {/* Left side - Filters */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {filterConfigs.map(f => (
                            <MultiSelectFilter
                                key={f.name}
                                title={f.label}
                                options={filters[f.name as keyof typeof filters].map(v => ({label: v, value: v}))}
                                selectedValues={selectedFilters[f.name]}
                                onSelectionChange={(values) => handleFilterChange(f.name, values)}
                            />
                        ))}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="flex">
                                    <div className="flex flex-col space-y-2 border-r p-4">
                                         <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 6), to: new Date()})}>Last 7 days</Button>
                                         <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 29), to: new Date()})}>Last 30 days</Button>
                                         <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 89), to: new Date()})}>Last 90 days</Button>
                                         <Button variant="ghost" className="justify-start" onClick={() => setDate({from: startOfMonth(new Date()), to: new Date()})}>This month</Button>
                                         <Button variant="ghost" className="justify-start" onClick={() => {
                                             const start = startOfMonth(subMonths(new Date(), 1));
                                             const end = endOfMonth(subMonths(new Date(), 1));
                                             setDate({from: start, to: end});
                                         }}>Last month</Button>
                                    </div>
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Section 2.5: Combined Scorecard and Dual-Axis Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="relative">
                    {loading && !isInitialLoad && <LoadingOverlay />}
                    <CardHeader className="pb-4">
                        <CardTitle>ROAS Performance</CardTitle>
                        <CardDescription>Return on Ad Spend metrics with cost analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Scorecard Section */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center">
                                <div className="text-xs font-medium text-blue-600 mb-1">ROAS D0</div>
                                <div className="text-2xl font-bold text-gray-900">{(filteredChartData.stats?.averageRoasD0 ?? 0).toFixed(2)}%</div>
                                <div className="flex items-center justify-center gap-1 text-xs">
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                    <span className="text-red-500">-15.4%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium text-pink-600 mb-1">eROAS D30</div>
                                <div className="text-2xl font-bold text-gray-900">{(filteredChartData.stats?.averageERoasD30 ?? 0).toFixed(2)}%</div>
                                <div className="flex items-center justify-center gap-1 text-xs">
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                    <span className="text-red-500">-7.3%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium text-cyan-600 mb-1">ROAS D30</div>
                                <div className="text-2xl font-bold text-gray-400">No data</div>
                                <div className="text-xs text-gray-400">No data</div>
                            </div>
                        </div>

                        {/* Dual-Axis Chart */}
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={filteredChartData.roasData}>
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" domain={[0, roasChartMax]} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) => formatLargeNumber(value as number, 0)}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        const numValue = value as number;
                                        if (name === "cost") return [formatLargeNumber(numValue, 2), "Cost"];
                                        return [`${numValue.toFixed(2)}%`, name as string];
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="right" dataKey="cost" fill="#7dd3fc" name="Cost" opacity={0.7} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="roasD0"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="ROAS D0"
                                    dot={false}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="roasD30"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    name="ROAS D30"
                                    dot={false}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="eRoasD30"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="eROAS D30"
                                    dot={false}
                                />
                                <ReferenceLine
                                    yAxisId="left"
                                    y={100}
                                    stroke="#374151"
                                    strokeWidth={2}
                                    strokeDasharray="8 8"
                                    label={{
                                        value: "Break-even",
                                        position: "insideTopLeft",
                                        offset: 10,
                                        style: {
                                            textAnchor: "start",
                                            fontSize: "12px",
                                            fill: "#374151",
                                            fontWeight: "500",
                                            backgroundColor: "white",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            border: "1px solid #e5e7eb",
                                        },
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="relative">
                    {loading && !isInitialLoad && <LoadingOverlay />}
                    <CardHeader className="pb-4">
                        <CardTitle>CPI & Cost Analysis</CardTitle>
                        <CardDescription>Cost per install trends with total spend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Scorecard Section */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="text-center">
                                <div className="text-xs font-medium text-blue-600 mb-1">AVG. CPI</div>
                                <div className="text-2xl font-bold text-gray-900">{(filteredChartData.stats?.averageCpi ?? 0).toFixed(2)} đ</div>
                                <div className="flex items-center justify-center gap-1 text-xs">
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                    <span className="text-red-500">-8.9%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium text-cyan-600 mb-1">TOTAL COST</div>
                                <div className="text-xl font-bold text-gray-900">{formatLargeNumber(filteredChartData.stats?.totalCost ?? 0)} đ</div>
                                <div className="flex items-center justify-center gap-1 text-xs">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+6.7%</span>
                                </div>
                            </div>
                        </div>

                        {/* Dual-Axis Chart */}
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={filteredChartData.cpiData}>
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" domain={[0, cpiChartMax]} tickFormatter={(value) => `${value.toFixed(2)}`} />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) => formatLargeNumber(value as number, 0)}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        const numValue = value as number;
                                        if (name === "cost") return [`${formatLargeNumber(numValue, 2)} đ`, "Cost"]
                                        if (name === "cpi") return [`${numValue.toFixed(2)} đ`, "CPI"]
                                        if (name === "eLtvD30") return [`${numValue.toFixed(2)}`, "eLTV D30"]
                                        return [`${numValue.toFixed(2)}`, name as string]
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="right" dataKey="cost" fill="#7dd3fc" name="Cost" opacity={0.7} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="cpi"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="CPI"
                                    dot={false}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="eLtvD30"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    name="eLTV D30"
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            {/* Section 2: Time Series Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>ROAS D0 by Channel</CardTitle>
                        <CardDescription>ROAS D0 overtime by channel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={380}>
                          <LineChart data={roasD0ByChannelChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={value => `${Math.round(value)}%`} />
                            <Tooltip formatter={value => `${Math.round(Number(value))}%`} />
                            {roasD0Channels.map((channel, idx) => (
                              <Line
                                key={channel}
                                type="monotone"
                                dataKey={channel}
                                stroke={chartColors[idx % chartColors.length]}
                                strokeWidth={2}
                                dot={false}
                                name={channel}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        <ChannelLegend channels={roasD0Channels} colors={chartColors} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Traffic Sources</CardTitle>
                        <CardDescription>Multi-series area chart comparison</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={380}>
                          <AreaChart data={trafficSourcesChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={value => formatLargeNumber(value, 0)} />
                            <Tooltip formatter={value => formatLargeNumber(Number(value), 2)} />
                            {trafficChannels.map((channel, idx) => (
                              <Area
                                key={channel}
                                type="monotone"
                                dataKey={channel}
                                stackId="1"
                                stroke={chartColors[idx % chartColors.length]}
                                fill={chartColors[idx % chartColors.length]}
                              />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                        <ChannelLegend channels={trafficChannels} colors={chartColors} />
                    </CardContent>
                </Card>

                
            </div>
        

        </div>
    )
}
