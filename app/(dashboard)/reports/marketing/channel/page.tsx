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
import { format, subDays, eachDayOfInterval, parseISO, startOfToday, startOfMonth, subMonths, endOfMonth, parse, differenceInDays } from "date-fns"
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
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { Slider } from "@/components/ui/slider"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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

function useAdjustCohortData(startDate?: string, endDate?: string) {
    const [rawData, setRawData] = useState<RawDataRow[]>([]);
    const [prevRawData, setPrevRawData] = useState<RawDataRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!startDate || !endDate) {
            setLoading(false);
            setRawData([]);
            setPrevRawData([]);
            return;
        };

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch current period data
                const fetchCurrentPeriod = fetch(`/api/data-source/BigQuery_AdjustCohortData?startDate=${startDate}&endDate=${endDate}`).then(res => {
                    if (!res.ok) throw new Error(`API Error (current): ${res.statusText}`);
                    return res.json();
                });

                // Calculate and fetch previous period data
                const start = parse(startDate!, 'yyyyMMdd', new Date());
                const end = parse(endDate!, 'yyyyMMdd', new Date());
                const duration = differenceInDays(end, start);
                const prevEnd = subDays(start, 1);
                const prevStart = subDays(prevEnd, duration);
                const prevStartDate = format(prevStart, 'yyyyMMdd');
                const prevEndDate = format(prevEnd, 'yyyyMMdd');
                
                const fetchPreviousPeriod = fetch(`/api/data-source/BigQuery_AdjustCohortData?startDate=${prevStartDate}&endDate=${prevEndDate}`).then(res => {
                    if (!res.ok) throw new Error(`API Error (previous): ${res.statusText}`);
                    return res.json();
                });

                const [currentResult, prevResult] = await Promise.all([fetchCurrentPeriod, fetchPreviousPeriod]);

                if (currentResult.error) throw new Error(currentResult.details || currentResult.error);
                if (prevResult.error) throw new Error(prevResult.details || prevResult.error);

                setRawData(currentResult);
                setPrevRawData(prevResult);

            } catch (e) {
                setError(e instanceof Error ? e.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [startDate, endDate]);

    return { rawData, prevRawData, loading, error };
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
    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-4">
      {channels.map((channel, idx) => (
        <div key={channel} className="flex items-center text-sm">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: colors[idx % colors.length] }}
          />
          <span>{channel}</span>
        </div>
      ))}
    </div>
  );
}

const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1", "#f472b6", "#22d3ee", "#16a34a", "#eab308", "#f43f5e", "#a21caf", "#0ea5e9", "#facc15", "#f87171"];

export default function ReportsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: subDays(new Date(), 1),
    });

    const isMobile = useIsMobile();
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const startDate = date?.from ? format(date.from, 'yyyyMMdd') : undefined;
    const endDate = date?.to ? format(date.to, 'yyyyMMdd') : undefined;

    const { rawData, prevRawData, loading, error } = useAdjustCohortData(startDate, endDate);
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

    const prevFilteredRows = useMemo(() => {
        if (!prevRawData) return [];
        const hasActiveFilters = Object.values(selectedFilters).some(v => v.length > 0);
        if (!hasActiveFilters) return prevRawData;
        return prevRawData.filter((row: RawDataRow) => {
            return Object.entries(selectedFilters).every(([key, values]) => {
                if (values.length === 0) return true;
                const rowValue = row[key];
                return rowValue !== undefined && values.includes(rowValue);
            });
        });
    }, [prevRawData, selectedFilters]);

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

    // Tính toán lại chartData dựa trên filteredRows
    const chartData = useMemo(() => {
        const processAggregatedData = (data: RawDataRow[]) => {
            if (!data || data.length === 0) return { 
                roasData: [], 
                cpiData: [], 
                stats: { averageCpi: 0, totalCost: 0, averageRoasD0: 0, averageERoasD30: 0, averageRoasD30: 0 } 
            };

            const dailyAggregates = data.reduce((acc, row) => {
                const date = row.date;
                if (!acc[date]) {
                    acc[date] = { cost: 0, install: 0, rev_d0: 0, rev_d3: 0, rev_d30: 0, weighted_ratio_numerator: 0 };
                }
                acc[date].cost += row.cost || 0;
                acc[date].install += row.install || 0;
                acc[date].rev_d0 += row.REV_D0 || 0;
                acc[date].rev_d3 += row.REV_D3 || 0;
                acc[date].rev_d30 += row.REV_D30 || 0;
                acc[date].weighted_ratio_numerator += (row.REV_D3 || 0) * (row.RATIO_REVD30_REVD3 || 0);
                return acc;
            }, {} as Record<string, { cost: number; install: number; rev_d0: number; rev_d3: number; rev_d30: number; weighted_ratio_numerator: number; }>);

            const totalCost = Object.values(dailyAggregates).reduce((sum, day) => sum + day.cost, 0);
            const totalInstall = Object.values(dailyAggregates).reduce((sum, day) => sum + day.install, 0);
            const totalRevD0 = Object.values(dailyAggregates).reduce((sum, day) => sum + day.rev_d0, 0);
            const totalRevD30 = Object.values(dailyAggregates).reduce((sum, day) => sum + day.rev_d30, 0);
            const totalPredictedRevD30 = Object.values(dailyAggregates).reduce((sum, day) => sum + day.weighted_ratio_numerator, 0);
            
            const stats = {
              totalCost,
              averageCpi: totalInstall > 0 ? totalCost / totalInstall : 0,
              averageRoasD0: totalCost > 0 ? (totalRevD0 / totalCost) * 100 : 0,
              averageRoasD30: totalCost > 0 ? (totalRevD30 / totalCost) * 100 : 0,
              averageERoasD30: totalCost > 0 ? (totalPredictedRevD30 / totalCost) * 100 : 0,
            }

            const sortedDates = Object.keys(dailyAggregates).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
            
            const roasData = sortedDates.map(date => {
                const metrics = dailyAggregates[date];
                const cost = metrics.cost;
                const roasD0 = cost > 0 ? (metrics.rev_d0 / cost) * 100 : 0;
                const roasD30 = cost > 0 ? (metrics.rev_d30 / cost) * 100 : 0;
                const eRoasD30 = cost > 0 ? (metrics.weighted_ratio_numerator / cost) * 100 : 0;
                return { date: format(parseISO(date), 'MMM dd'), roasD0, roasD30, eRoasD30, cost: metrics.cost };
            });

            const cpiData = sortedDates.map(date => {
                const metrics = dailyAggregates[date];
                const install = metrics.install;
                const cpi = install > 0 ? metrics.cost / install : 0;
                const eLtvD30 = install > 0 ? metrics.weighted_ratio_numerator / install : 0;
                return { date: format(parseISO(date), 'MMM dd'), cpi, eLtvD30, cost: metrics.cost };
            });

            return { roasData, cpiData, stats };
        };

        const currentData = processAggregatedData(filteredRows);
        const prevData = processAggregatedData(prevFilteredRows);

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return 0; // Avoid division by zero
            return (current - previous) / previous;
        };

        const changes = {
            roasD0Change: calculateChange(currentData.stats.averageRoasD0, prevData.stats.averageRoasD0),
            roasD30Change: calculateChange(currentData.stats.averageRoasD30, prevData.stats.averageRoasD30),
            eroasD30Change: calculateChange(currentData.stats.averageERoasD30, prevData.stats.averageERoasD30),
            cpiChange: calculateChange(currentData.stats.averageCpi, prevData.stats.averageCpi),
            totalCostChange: calculateChange(currentData.stats.totalCost, prevData.stats.totalCost),
        }
        
        return { ...currentData, stats: {...currentData.stats, ...changes} };

    }, [filteredRows, prevFilteredRows]);

    // Tính lại roasChartMax và cpiChartMax dựa trên chartData
    const roasChartMax = useMemo(() => {
        if (!chartData.roasData || chartData.roasData.length === 0) {
            return 150; // Default
        }
        const maxVal = chartData.roasData.reduce((max, item) => {
            const currentMax = Math.max(item.roasD0, item.roasD30, item.eRoasD30);
            return currentMax > max ? currentMax : max;
        }, 0);
        return Math.max(maxVal * 1.2, 110); 
    }, [chartData.roasData]);

    const cpiChartMax = useMemo(() => {
        if (!chartData.cpiData || chartData.cpiData.length === 0) {
            return 1000; // A default value if no data
        }
        const maxVal = chartData.cpiData.reduce((max, item) => {
            const currentMax = Math.max(item.cpi, item.eLtvD30);
            return currentMax > max ? currentMax : max;
        }, 0);
        if (maxVal === 0) return 1;
        return maxVal * 1.2;
    }, [chartData.cpiData]);

    // State cho expand/collapse các channel
    const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());

    // Calculate post-install metrics for table
    const postInstallMetrics = useMemo(() => {
        if (!filteredRows || filteredRows.length === 0) return [];
        // Group by channel
        const channelGroups = filteredRows.reduce((acc, item) => {
            const channel = item.channel || 'Unknown';
            if (!acc[channel]) {
                acc[channel] = [];
            }
            acc[channel].push(item);
            return acc;
        }, {} as Record<string, RawDataRow[]>);

        return Object.entries(channelGroups).map(([channel, items]) => {
            const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
            const totalInstalls = items.reduce((sum, item) => sum + item.install, 0);
            const totalRevenue = items.reduce((sum, item) => sum + item.REV_D0, 0);
            const totalRevenueD3 = items.reduce((sum, item) => sum + item.REV_D3, 0);
            const totalRevenueD7 = items.reduce((sum, item) => sum + item.REV_D7, 0);
            const totalRevenueD30 = items.reduce((sum, item) => sum + item.REV_D30, 0);
            const totalRevenueD60 = items.reduce((sum, item) => sum + item.REV_D60, 0);
            const totalERevenueD30 = items.reduce((sum, item) => sum + item.RATIO_REVD30_REVD3, 0);
            const totalRetD1 = items.reduce((sum, item) => sum + item.retained_users_D1, 0);
            const totalRetD3 = items.reduce((sum, item) => sum + item.retained_users_D3, 0);
            const totalRetD7 = items.reduce((sum, item) => sum + item.retained_users_D7, 0);

            // Calculate metrics
            const cpi = totalInstalls > 0 ? totalCost / totalInstalls : null;
            const roas_d0 = totalCost > 0 ? totalRevenue / totalCost : null;
            const roas_d3 = totalCost > 0 ? totalRevenueD3 / totalCost : null;
            const roas_d7 = totalCost > 0 ? totalRevenueD7 / totalCost : null;
            const roas_d30 = totalCost > 0 ? totalRevenueD30 / totalCost : null;
            const roas_d60 = totalCost > 0 ? totalRevenueD60 / totalCost : null;
            const eroas_d30 = totalCost > 0 ? totalERevenueD30 / totalCost : null;
            const ret_d1 = totalInstalls > 0 ? totalRetD1 / totalInstalls : null;
            const ret_d3 = totalInstalls > 0 ? totalRetD3 / totalInstalls : null;
            const ret_d7 = totalInstalls > 0 ? totalRetD7 / totalInstalls : null;

            // Get top 10 countries by cost for this channel
            const countryGroups = items.reduce((acc, item) => {
                const countryCode = item.country_code || 'Unknown';
                if (!acc[countryCode]) {
                    acc[countryCode] = [];
                }
                acc[countryCode].push(item);
                return acc;
            }, {} as Record<string, RawDataRow[]>);

            const countries = Object.entries(countryGroups)
                .map(([country, countryItems]) => {
                    const countryCost = countryItems.reduce((sum, item) => sum + item.cost, 0);
                    const countryInstalls = countryItems.reduce((sum, item) => sum + item.install, 0);
                    const countryRevenue = countryItems.reduce((sum, item) => sum + item.REV_D0, 0);
                    const countryRevenueD3 = countryItems.reduce((sum, item) => sum + item.REV_D3, 0);
                    const countryRevenueD7 = countryItems.reduce((sum, item) => sum + item.REV_D7, 0);
                    const countryRevenueD30 = countryItems.reduce((sum, item) => sum + item.REV_D30, 0);
                    const countryRevenueD60 = countryItems.reduce((sum, item) => sum + item.REV_D60, 0);
                    const countryERevenueD30 = countryItems.reduce((sum, item) => sum + item.RATIO_REVD30_REVD3, 0);
                    const countryRetD1 = countryItems.reduce((sum, item) => sum + item.retained_users_D1, 0);
                    const countryRetD3 = countryItems.reduce((sum, item) => sum + item.retained_users_D3, 0);
                    const countryRetD7 = countryItems.reduce((sum, item) => sum + item.retained_users_D7, 0);

                    return {
                        country,
                        cost: countryCost,
                        cpi: countryInstalls > 0 ? countryCost / countryInstalls : null,
                        roas_d0: countryCost > 0 ? countryRevenue / countryCost : null,
                        roas_d3: countryCost > 0 ? countryRevenueD3 / countryCost : null,
                        roas_d7: countryCost > 0 ? countryRevenueD7 / countryCost : null,
                        roas_d30: countryCost > 0 ? countryRevenueD30 / countryCost : null,
                        roas_d60: countryCost > 0 ? countryRevenueD60 / countryCost : null,
                        eroas_d30: countryCost > 0 ? countryERevenueD30 / countryCost : null,
                        ret_d1: countryInstalls > 0 ? countryRetD1 / countryInstalls : null,
                        ret_d3: countryInstalls > 0 ? countryRetD3 / countryInstalls : null,
                        ret_d7: countryInstalls > 0 ? countryRetD7 / countryInstalls : null,
                    };
                })
                .sort((a, b) => b.cost - a.cost)
                .slice(0, 10);

            return {
                channel,
                cost: totalCost,
                cpi,
                roas_d0,
                roas_d3,
                roas_d7,
                roas_d30,
                roas_d60,
                eroas_d30,
                ret_d1,
                ret_d3,
                ret_d7,
                countries
            };
        }).sort((a, b) => b.cost - a.cost);
    }, [filteredRows]);

    const [dailyMetricsCampaignFilter, setDailyMetricsCampaignFilter] = useState('All Campaigns');

    const dailyMetricsCampaignOptions = useMemo(() => {
        if (!filteredRows) return ['All Campaigns'];

        const campaignCosts = filteredRows.reduce((acc, row) => {
            if (row.campaign_name) {
                acc[row.campaign_name] = (acc[row.campaign_name] || 0) + row.cost;
            }
            return acc;
        }, {} as Record<string, number>);

        const sortedCampaigns = Object.entries(campaignCosts)
            .filter(([, cost]) => cost > 0) 
            .sort(([, costA], [, costB]) => costB - costA)
            .map(([campaignName]) => campaignName);

        return ['All Campaigns', ...sortedCampaigns];
    }, [filteredRows]);
    
    const dailyMetricsFilteredRows = useMemo(() => {
        if (dailyMetricsCampaignFilter === 'All Campaigns') {
            return filteredRows;
        }
        return filteredRows.filter(row => row.campaign_name === dailyMetricsCampaignFilter);
    }, [filteredRows, dailyMetricsCampaignFilter]);

    // Calculate daily metrics for table
    const dailyMetrics = useMemo(() => {
        if (!dailyMetricsFilteredRows || dailyMetricsFilteredRows.length === 0) return [];
        // Group by date
        const dateGroups = dailyMetricsFilteredRows.reduce((acc, item) => {
            const date = item.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {} as Record<string, RawDataRow[]>);

        return Object.entries(dateGroups)
            .map(([date, items]) => {
                const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
                const totalInstalls = items.reduce((sum, item) => sum + item.install, 0);
                const totalRevenue = items.reduce((sum, item) => sum + item.REV_D0, 0);
                const totalRevenueD3 = items.reduce((sum, item) => sum + item.REV_D3, 0);
                const totalRevenueD7 = items.reduce((sum, item) => sum + item.REV_D7, 0);
                const totalRevenueD30 = items.reduce((sum, item) => sum + item.REV_D30, 0);
                const totalRevenueD60 = items.reduce((sum, item) => sum + item.REV_D60, 0);
                const totalERevenueD30 = items.reduce((sum, item) => sum + item.RATIO_REVD30_REVD3, 0);
                const totalRetD1 = items.reduce((sum, item) => sum + item.retained_users_D1, 0);
                const totalRetD3 = items.reduce((sum, item) => sum + item.retained_users_D3, 0);
                const totalRetD7 = items.reduce((sum, item) => sum + item.retained_users_D7, 0);

                return {
                    date,
                    cost: totalCost,
                    cpi: totalInstalls > 0 ? totalCost / totalInstalls : null,
                    roas_d0: totalCost > 0 ? totalRevenue / totalCost : null,
                    roas_d3: totalCost > 0 ? totalRevenueD3 / totalCost : null,
                    roas_d7: totalCost > 0 ? totalRevenueD7 / totalCost : null,
                    roas_d30: totalCost > 0 ? totalRevenueD30 / totalCost : null,
                    roas_d60: totalCost > 0 ? totalRevenueD60 / totalCost : null,
                    eroas_d30: totalCost > 0 ? totalERevenueD30 / totalCost : null,
                    ret_d1: totalInstalls > 0 ? totalRetD1 / totalInstalls : null,
                    ret_d3: totalInstalls > 0 ? totalRetD3 / totalInstalls : null,
                    ret_d7: totalInstalls > 0 ? totalRetD7 / totalInstalls : null,
                };
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [dailyMetricsFilteredRows]);

    // Calculate ranges for heatmap for DAILY metrics table
    const dailyMetricsRanges = useMemo(() => {
        if (!dailyMetrics.length) {
            return {
                cpi: { min: 0, max: 1 },
                roas: { min: 0, max: 1 },
                eroas: { min: 0, max: 1 },
            };
        }

        const cpiValues = dailyMetrics.map(d => d.cpi).filter(v => v !== null) as number[];
        const roasValues = dailyMetrics.map(d => d.roas_d0).filter(v => v !== null) as number[];
        const eroasValues = dailyMetrics.map(d => d.eroas_d30).filter(v => v !== null) as number[];

        const cpiMin = cpiValues.length ? Math.min(...cpiValues) : 0;
        const cpiMax = cpiValues.length ? Math.max(...cpiValues) : 1;
        const roasMin = roasValues.length ? Math.min(...roasValues) : 0;
        const roasMax = roasValues.length ? Math.max(...roasValues) : 1;
        const eroasMin = eroasValues.length ? Math.min(...eroasValues) : 0;
        const eroasMax = eroasValues.length ? Math.max(...eroasValues) : 1;

        return {
            cpi: { min: cpiMin, max: cpiMax },
            roas: { min: roasMin, max: roasMax },
            eroas: { min: eroasMin, max: eroasMax },
        };
    }, [dailyMetrics]);
    
    // Calculate ranges for heatmap for POST-INSTALL metrics table
    const postInstallMetricsRanges = useMemo(() => {
        if (!postInstallMetrics.length) {
            return {
                cpi: { min: 0, max: 1 },
                roas: { min: 0, max: 1 },
                eroas: { min: 0, max: 1 },
            };
        }

        const allRows = postInstallMetrics.flatMap(channel => [channel, ...channel.countries]);
        const cpiValues = allRows.map(d => d.cpi).filter(v => v !== null) as number[];
        const roasValues = allRows.map(d => d.roas_d0).filter(v => v !== null) as number[];
        const eroasValues = allRows.map(d => d.eroas_d30).filter(v => v !== null) as number[];

        const cpiMin = cpiValues.length ? Math.min(...cpiValues) : 0;
        const cpiMax = cpiValues.length ? Math.max(...cpiValues) : 1;
        const roasMin = roasValues.length ? Math.min(...roasValues) : 0;
        const roasMax = roasValues.length ? Math.max(...roasValues) : 1;
        const eroasMin = eroasValues.length ? Math.min(...eroasValues) : 0;
        const eroasMax = eroasValues.length ? Math.max(...eroasValues) : 1;

        return {
            cpi: { min: cpiMin, max: cpiMax },
            roas: { min: roasMin, max: roasMax },
            eroas: { min: eroasMin, max: eroasMax },
        };
    }, [postInstallMetrics]);

    // Generic Heatmap style function
    const getHeatmapStyle = (value: number | null, type: 'cpi' | 'roas' | 'eroas', ranges: typeof dailyMetricsRanges): React.CSSProperties => {
        if (value === null || value === undefined) return { textAlign: 'center' };

        const range = type === 'cpi' ? ranges.cpi : (type === 'roas' ? ranges.roas : ranges.eroas);
        
        if (range.min === range.max) {
            let color = 'rgba(128, 128, 128, 0.4)'; // a neutral grey
            if (type === 'cpi') color = 'rgba(239, 68, 68, 0.4)'; // red-500
            if (type === 'roas') color = 'rgba(34, 197, 94, 0.4)'; // green-500
            if (type === 'eroas') color = 'rgba(168, 85, 247, 0.4)'; // purple-500
            return { backgroundColor: color, color: 'white' };
        }

        const normalized = (value - range.min) / (range.max - range.min);
        const opacity = 0.15 + Math.max(0, Math.min(normalized, 1)) * 0.75;

        let colorRgb = '239, 68, 68'; // CPI default red
        if (type === 'roas') colorRgb = '34, 197, 94'; // green
        if (type === 'eroas') colorRgb = '168, 85, 247'; // purple

        return {
            backgroundColor: `rgba(${colorRgb}, ${opacity})`,
            color: opacity > 0.55 ? 'white' : 'black',
        };
    };

    const allCampaignMetrics = useMemo(() => {
        if (!filteredRows || filteredRows.length === 0) return [];
        return Object.values(
            filteredRows.reduce((acc, row) => {
                if (!row.campaign_name) return acc;
                if (!acc[row.campaign_name]) {
                    acc[row.campaign_name] = { campaign_name: row.campaign_name, cost: 0, revenue_d0: 0, quadrant: '' };
                }
                acc[row.campaign_name].cost += row.cost;
                acc[row.campaign_name].revenue_d0 += row.REV_D0;
                return acc;
            }, {} as Record<string, { campaign_name: string, cost: number, revenue_d0: number, quadrant: string }>)
        ).map(c => ({
            ...c,
            roas_d0: c.cost > 0 ? c.revenue_d0 / c.cost : 0,
        })).filter(c => c.cost > 0);
    }, [filteredRows]);

    const maxCost = useMemo(() => {
        if (!allCampaignMetrics.length) return 0;
        return Math.ceil(Math.max(...allCampaignMetrics.map(c => c.cost)) / 100) * 100;
    }, [allCampaignMetrics]);
    
    const [committedCostRange, setCommittedCostRange] = useState<[number, number]>([0, 0]);
    const [localCostRange, setLocalCostRange] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        if (maxCost > 0) {
            const newRange: [number, number] = [0, maxCost];
            setCommittedCostRange(newRange);
            setLocalCostRange(newRange);
        }
    }, [maxCost]);

    const campaignAnalysisData = useMemo(() => {
        if (!allCampaignMetrics.length) return { data: [], avgCost: 0, avgRoasD0: 0 };

        const filteredByCost = allCampaignMetrics.filter(
            d => d.cost >= committedCostRange[0] && d.cost <= committedCostRange[1]
        );
        
        if (filteredByCost.length === 0) return { data: [], avgCost: 0, avgRoasD0: 0 };

        const totalCost = filteredByCost.reduce((sum, c) => sum + c.cost, 0);
        const totalRoasD0 = filteredByCost.reduce((sum, c) => sum + c.roas_d0, 0);
        const avgCost = totalCost / filteredByCost.length;
        const avgRoasD0 = totalRoasD0 / filteredByCost.length;

        const quadrantData = filteredByCost.map(campaign => {
            let quadrant: string;
            if (campaign.cost > avgCost && campaign.roas_d0 < avgRoasD0) {
                quadrant = 'Bad'; // Top-left -> Orange
            } else if (campaign.cost > avgCost && campaign.roas_d0 >= avgRoasD0) {
                quadrant = 'Best'; // Top-right -> Purple
            } else if (campaign.cost <= avgCost && campaign.roas_d0 >= avgRoasD0) {
                quadrant = 'Good'; // Bottom-right -> Green
            } else { 
                quadrant = 'Worst'; // Bottom-left -> Red
            }
            return { ...campaign, quadrant };
        });

        return { data: quadrantData, avgCost, avgRoasD0 };
    }, [allCampaignMetrics, committedCostRange]);

    const CustomScatterTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-2 text-sm bg-white rounded-md shadow-lg border">
                    <p className="font-bold">{data.campaign_name}</p>
                    <p>Cost: <span className="font-mono">{fmtDecimal(data.cost)}</span></p>
                    <p>ROAS D0: <span className="font-mono">{fmtPercent(data.roas_d0)}</span></p>
                </div>
            );
        }
        return null;
    };

    // Hàm format số
    function fmtCurrency(val: number) { return val.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' $'; }
    function fmtPercent(val: number) { return (val * 100).toFixed(2) + '%'; }
    function fmtPercent0(val: number) { return (val * 100).toFixed(0) + '%'; }
    function fmtNumber(val: number) { return val.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
    function fmtDecimal(val: number) { return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

    // Toggle expand/collapse
    function toggleChannel(channel: string) {
        setExpandedChannels(prev => {
            const next = new Set(prev);
            if (next.has(channel)) next.delete(channel); else next.add(channel);
            return next;
        });
    }

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

    const CustomLegend = () => (
      <div className="flex justify-center items-center space-x-4 pt-4 pb-2">
          <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#a855f7' }} />
              <span className="text-xs text-muted-foreground">Best</span>
          </div>
          <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
              <span className="text-xs text-muted-foreground">Bad</span>
          </div>
          <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-xs text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-xs text-muted-foreground">Worst</span>
          </div>
      </div>
    );

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
        {isMobile ? (
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
                  <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                  />
                  <div className="flex flex-col space-y-2 border-t p-4">
                      <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 7), to: subDays(new Date(), 1)})}>Last 7 days</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 30), to: subDays(new Date(), 1)})}>Last 30 days</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 90), to: subDays(new Date(), 1)})}>Last 90 days</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => setDate({from: startOfMonth(new Date()), to: subDays(new Date(), 1)})}>This month</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => {
                          const start = startOfMonth(subMonths(new Date(), 1));
                          const end = endOfMonth(subMonths(new Date(), 1));
                          setDate({from: start, to: end});
                      }}>Last month</Button>
                  </div>
              </PopoverContent>
            </Popover>

            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>{isFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {filterConfigs.map(f => (
                  <MultiSelectFilter
                      key={f.name}
                      title={f.label}
                      options={filters[f.name as keyof typeof filters].map(v => ({label: v, value: v}))}
                      selectedValues={selectedFilters[f.name]}
                      onSelectionChange={(values) => handleFilterChange(f.name, values)}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
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
                        <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 7), to: subDays(new Date(), 1)})}>Last 7 days</Button>
                        <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 30), to: subDays(new Date(), 1)})}>Last 30 days</Button>
                        <Button variant="ghost" className="justify-start" onClick={() => setDate({from: subDays(new Date(), 90), to: subDays(new Date(), 1)})}>Last 90 days</Button>
                        <Button variant="ghost" className="justify-start" onClick={() => setDate({from: startOfMonth(new Date()), to: subDays(new Date(), 1)})}>This month</Button>
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
        )}
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
                                <div className="text-2xl font-bold text-gray-900">{(chartData.stats?.averageRoasD0 ?? 0).toFixed(2)}%</div>
                <ScorecardChange value={chartData.stats?.roasD0Change} />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-pink-600 mb-1">eROAS D30</div>
                                <div className="text-2xl font-bold text-gray-900">{(chartData.stats?.averageERoasD30 ?? 0).toFixed(2)}%</div>
                <ScorecardChange value={chartData.stats?.eroasD30Change} />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-cyan-600 mb-1">ROAS D30</div>
                <div className="text-2xl font-bold text-gray-900">{(chartData.stats?.averageRoasD30 ?? 0).toFixed(2)}%</div>
                <ScorecardChange value={chartData.stats?.roasD30Change} />
              </div>
            </div>

            {/* Dual-Axis Chart */}
            <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData.roasData}>
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
                                        if (name === "cost") return [`$${formatLargeNumber(numValue, 2)}`, "Cost"]
                                        if (name === "roasD0") return [`${numValue.toFixed(2)}%`, "ROAS D0"]
                                        if (name === "roasD30") return [`${numValue.toFixed(2)}%`, "ROAS D30"]
                                        if (name === "eRoasD30") return [`${numValue.toFixed(2)}%`, "eROAS D30"]
                                        return [`${numValue.toFixed(2)}%`, name as string]
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
                                <div className="text-2xl font-bold text-gray-900">${(chartData.stats?.averageCpi ?? 0).toFixed(2)}</div>
                <ScorecardChange value={chartData.stats?.cpiChange} />
              </div>
              <div className="text-center">
                                <div className="text-xs font-medium text-cyan-600 mb-1">TOTAL COST</div>
                                <div className="text-xl font-bold text-gray-900">${formatLargeNumber(chartData.stats?.totalCost ?? 0)}</div>
                <ScorecardChange value={chartData.stats?.totalCostChange} />
              </div>
            </div>

            {/* Dual-Axis Chart */}
            <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData.cpiData}>
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
                                        if (name === "cost") return [`$${formatLargeNumber(numValue, 2)}`, "Cost"]
                                        if (name === "cpi") return [`$${numValue.toFixed(2)}`, "CPI"]
                                        if (name === "eLtvD30") return [`$${numValue.toFixed(2)}`, "eLTV D30"]
                                        return [`${numValue.toFixed(2)}%`, name as string]
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
            {/* Post-install Metrics Table */}
            <Card className="mt-10">
              <CardHeader>
                <CardTitle>Post-install Metrics by Channel</CardTitle>
                <CardDescription>Tree-table: Channel & Top 10 Country by cost, with post-install metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative max-h-[750px] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="w-32">CPI</TableHead>
                        <TableHead className="w-32">ROAS D0</TableHead>
                        <TableHead>ROAS D3</TableHead>
                        <TableHead>ROAS D7</TableHead>
                        <TableHead className="w-32">eROAS D30</TableHead>
                        <TableHead>ROAS D30</TableHead>
                        <TableHead>ROAS D60</TableHead>
                        <TableHead>Ret D1</TableHead>
                        <TableHead>Ret D3</TableHead>
                        <TableHead>Ret D7</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postInstallMetrics.map(row => (
                        <React.Fragment key={row.channel}>
                          <TableRow className="bg-white hover:bg-gray-50 group">
                            <TableCell className="w-12">
                              <button onClick={() => toggleChannel(row.channel)} className="focus:outline-none">
                                {expandedChannels.has(row.channel) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                            </TableCell>
                            <TableCell className="font-semibold text-base group-hover:text-blue-600 transition-colors duration-100">{row.channel}</TableCell>
                            <TableCell>{fmtDecimal(row.cost)}</TableCell>
                            <TableCell style={getHeatmapStyle(row.cpi, 'cpi', postInstallMetricsRanges)}>
                              {row.cpi ? fmtDecimal(row.cpi) : '-'}
                            </TableCell>
                            <TableCell style={getHeatmapStyle(row.roas_d0, 'roas', postInstallMetricsRanges)}>
                              {row.roas_d0 ? fmtPercent(row.roas_d0) : '-'}
                            </TableCell>
                            <TableCell>{row.roas_d3 ? fmtPercent(row.roas_d3) : '-'}</TableCell>
                            <TableCell>{row.roas_d7 ? fmtPercent(row.roas_d7) : '-'}</TableCell>
                            <TableCell style={getHeatmapStyle(row.eroas_d30, 'eroas', postInstallMetricsRanges)}>
                              {row.eroas_d30 ? fmtPercent(row.eroas_d30) : '-'}
                            </TableCell>
                            <TableCell>{row.roas_d30 ? fmtPercent(row.roas_d30) : '-'}</TableCell>
                            <TableCell>{row.roas_d60 ? fmtPercent(row.roas_d60) : '-'}</TableCell>
                            <TableCell>{row.ret_d1 ? fmtPercent(row.ret_d1) : '-'}</TableCell>
                            <TableCell>{row.ret_d3 ? fmtPercent(row.ret_d3) : '-'}</TableCell>
                            <TableCell>{row.ret_d7 ? fmtPercent(row.ret_d7) : '-'}</TableCell>
                          </TableRow>
                          {expandedChannels.has(row.channel) && row.countries.map(country => (
                            <TableRow key={country.country} className="bg-gray-50 hover:bg-gray-100">
                              <TableCell></TableCell>
                              <TableCell className="pl-8 text-sm text-gray-700">{country.country}</TableCell>
                              <TableCell>{fmtDecimal(country.cost)}</TableCell>
                              <TableCell style={getHeatmapStyle(country.cpi, 'cpi', postInstallMetricsRanges)}>
                                {country.cpi ? fmtDecimal(country.cpi) : '-'}
                              </TableCell>
                              <TableCell style={getHeatmapStyle(country.roas_d0, 'roas', postInstallMetricsRanges)}>
                                {country.roas_d0 ? fmtPercent(country.roas_d0) : '-'}
                              </TableCell>
                              <TableCell>{country.roas_d3 ? fmtPercent(country.roas_d3) : '-'}</TableCell>
                              <TableCell>{country.roas_d7 ? fmtPercent(country.roas_d7) : '-'}</TableCell>
                              <TableCell style={getHeatmapStyle(country.eroas_d30, 'eroas', postInstallMetricsRanges)}>
                                {country.eroas_d30 ? fmtPercent(country.eroas_d30) : '-'}
                              </TableCell>
                              <TableCell>{country.roas_d30 ? fmtPercent(country.roas_d30) : '-'}</TableCell>
                              <TableCell>{country.roas_d60 ? fmtPercent(country.roas_d60) : '-'}</TableCell>
                              <TableCell>{country.ret_d1 ? fmtPercent(country.ret_d1) : '-'}</TableCell>
                              <TableCell>{country.ret_d3 ? fmtPercent(country.ret_d3) : '-'}</TableCell>
                              <TableCell>{country.ret_d7 ? fmtPercent(country.ret_d7) : '-'}</TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Analysis Scatter Chart */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex-grow">
                  <CardTitle>Campaign Analysis</CardTitle>
                  <CardDescription>ROAS D0 vs. Cost per campaign, divided into four performance quadrants.</CardDescription>
                </div>
                <div className="w-1/3 min-w-[300px] pl-4">
                  <label className="text-sm font-medium">Cost Range</label>
                  <Slider
                    min={0}
                    max={maxCost}
                    step={maxCost / 100}
                    value={localCostRange}
                    onValueChange={(value) => setLocalCostRange(value as [number, number])}
                    onValueCommit={(value) => setCommittedCostRange(value as [number, number])}
                    className="my-2"
                    disabled={maxCost === 0}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{fmtDecimal(localCostRange[0])}</span>
                    <span>{fmtDecimal(localCostRange[1])}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 450 }}>
                  <ResponsiveContainer>
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 30,
                        bottom: 20,
                        left: 30,
                      }}
                    >
                      {/* <CartesianGrid strokeDasharray="3 3" /> */}
                      <XAxis
                        type="number"
                        dataKey="roas_d0"
                        name="ROAS D0"
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        label={{ value: "ROAS D0", position: 'insideBottom', offset: -10 }}
                        domain={[0, 'auto']}
                      />
                      <YAxis
                        type="number"
                        dataKey="cost"
                        name="Cost"
                        tickFormatter={(value) => formatLargeNumber(value, 0)}
                        label={{ value: "Cost", angle: -90, position: 'insideLeft', offset: -20 }}
                        domain={[0, 'auto']}
                      />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                      
                      <ReferenceLine y={campaignAnalysisData.avgCost} stroke="#6b7280" strokeDasharray="4 4" />
                      <ReferenceLine x={campaignAnalysisData.avgRoasD0} stroke="#6b7280" strokeDasharray="4 4" />

                      <Scatter data={campaignAnalysisData.data} isAnimationActive={false}>
                          {campaignAnalysisData.data.map((entry, index) => {
                              let fill;
                              switch (entry.quadrant) {
                                  case 'Best': fill = '#a855f7'; break; // purple
                                  case 'Bad': fill = '#f97316'; break; // orange
                                  case 'Good': fill = '#22c55e'; break; // green
                                  case 'Worst': fill = '#ef4444'; break; // red
                                  default: fill = '#ccc';
                              }
                              return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  
                </div>
                <div className="mt-4"><CustomLegend /></div>
              </CardContent>
            </Card>

            {/* Daily Metrics Table */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Daily Metrics</CardTitle>
                  <CardDescription>Performance metrics by date with heatmap visualization</CardDescription>
                </div>
                <div className="w-64">
                  <Select value={dailyMetricsCampaignFilter} onValueChange={setDailyMetricsCampaignFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by campaign..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dailyMetricsCampaignOptions.map(campaign => (
                        <SelectItem key={campaign} value={campaign!}>
                          {campaign}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative max-h-[750px] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="w-32">CPI</TableHead>
                        <TableHead className="w-32">ROAS D0</TableHead>
                        <TableHead>ROAS D3</TableHead>
                        <TableHead>ROAS D7</TableHead>
                        <TableHead className="w-32">eROAS D30</TableHead>
                        <TableHead>ROAS D30</TableHead>
                        <TableHead>ROAS D60</TableHead>
                        <TableHead>Ret D1</TableHead>
                        <TableHead>Ret D3</TableHead>
                        <TableHead>Ret D7</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyMetrics.map(row => (
                        <TableRow key={row.date} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{row.date}</TableCell>
                          <TableCell>{fmtDecimal(row.cost)}</TableCell>
                          <TableCell style={getHeatmapStyle(row.cpi, 'cpi', dailyMetricsRanges)}>
                            {row.cpi ? fmtDecimal(row.cpi) : '-'}
                          </TableCell>
                          <TableCell style={getHeatmapStyle(row.roas_d0, 'roas', dailyMetricsRanges)}>
                            {row.roas_d0 ? fmtPercent(row.roas_d0) : '-'}
                          </TableCell>
                          <TableCell>{row.roas_d3 ? fmtPercent(row.roas_d3) : '-'}</TableCell>
                          <TableCell>{row.roas_d7 ? fmtPercent(row.roas_d7) : '-'}</TableCell>
                          <TableCell style={getHeatmapStyle(row.eroas_d30, 'eroas', dailyMetricsRanges)}>
                            {row.eroas_d30 ? fmtPercent(row.eroas_d30) : '-'}
                          </TableCell>
                          <TableCell>{row.roas_d30 ? fmtPercent(row.roas_d30) : '-'}</TableCell>
                          <TableCell>{row.roas_d60 ? fmtPercent(row.roas_d60) : '-'}</TableCell>
                          <TableCell>{row.ret_d1 ? fmtPercent(row.ret_d1) : '-'}</TableCell>
                          <TableCell>{row.ret_d3 ? fmtPercent(row.ret_d3) : '-'}</TableCell>
                          <TableCell>{row.ret_d7 ? fmtPercent(row.ret_d7) : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
        

    </div>
  )
}

const ScorecardChange = ({ value }: { value?: number }) => {
  if (value === undefined || !isFinite(value)) {
    return <div className="text-xs text-gray-400">No prior data</div>;
  }
  const isPositive = value >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500";
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`flex items-center justify-center gap-1 text-xs ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
  );
};
