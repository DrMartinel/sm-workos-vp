"use client"

import { Label } from "@/components/ui/label"

import { useState, useMemo } from "react"
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
import { format, subDays, eachDayOfInterval } from "date-fns"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  UserMinus,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { DateRange } from 'react-day-picker'
import { MultiSelectFilter } from '@/components/filters/multi-select-filter'
import { DateRangePicker } from '@/components/filters/date-range-picker'
import { useOverviewData } from '@/hooks/use-overview-data'
import { OverviewKpiCard } from '@/components/overview-kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer } from '@/components/ui/chart'
import { useOverviewSummary } from '@/hooks/use-overview-summary';
import { ChartsSection } from '@/components/overview/charts-section';
import { AppsDataTable } from '@/components/overview/apps-data-table';

// Mock Data
const kpiData = [
  {
    title: "Downloads",
    value: "247,392",
    change: 12.5,
    trend: "up",
    icon: DollarSign,
    sparkline: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
  },
  {
    title: "Revenue",
    value: "2,847,392",
    change: 8.2,
    trend: "up",
    icon: Users,
    sparkline: [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86],
  },
  {
    title: "Cost",
    value: "847,392",
    change: -2.1,
    trend: "down",
    icon: UserMinus,
    sparkline: [35, 25, 15, 30, 20, 25, 15, 35, 25, 15, 30, 20],
  },
  {
    title: "Margin",
    value: "947,192",
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

// Sparkline component to match the original design
const Sparkline = ({ data }: { data: { value: number }[] }) => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
            <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={false}
            />
        </LineChart>
    </ResponsiveContainer>
);

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

export default function OverviewPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const calendarData = useMemo(() => generateCalendarData(), [])

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status.toLowerCase() === statusFilter
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => project.tags.includes(tag))
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesTags && matchesSearch
    })
  }, [statusFilter, selectedTags, searchTerm])

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProjects, currentPage])

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)

  const allTags = Array.from(new Set(projectsData.flatMap((project) => project.tags)))

  const [date, setDate] = useState<DateRange | undefined>({ from: subDays(new Date(), 29), to: new Date() });
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const { data, isLoading } = useOverviewData(date, selectedApps, selectedPlatforms);
  const { data: summaryData, isLoading: isSummaryLoading } = useOverviewSummary(date, selectedApps, selectedPlatforms);

  const kpiCardsData = !data ? [] : [
    { title: 'Total Revenue', icon: DollarSign, data: data.kpi.revenue, format: formatCurrency },
    { title: 'Downloads', icon: Download, data: data.kpi.downloads, format: formatNumber },
    { title: 'Total Cost', icon: Wallet, data: data.kpi.cost, format: formatCurrency },
    { title: 'Margin', icon: TrendingUp, data: data.kpi.margin, format: formatCurrency },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="space-y-6">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1">Key performance indicators for your business.</p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <MultiSelectFilter
              title="App"
              options={data?.filters.appOptions || []}
              selectedValues={selectedApps}
              setSelectedValues={setSelectedApps}
              className="w-full md:w-[240px]"
            />
            <MultiSelectFilter
              title="Platform"
              options={[{ value: 'Android', label: 'Android' }, { value: 'iOS', label: 'iOS' }]}
              selectedValues={selectedPlatforms}
              setSelectedValues={setSelectedPlatforms}
              className="w-full md:w-[180px]"
            />
          </div>
          <div className="flex items-center w-full md:w-auto">
            <DateRangePicker date={date} setDate={setDate} className="w-full md:w-auto" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[120px] rounded-lg" />)
        ) : (
          kpiCardsData.map((kpi) => {
            const isPositive = kpi.data.change >= 0;
            const isFiniteChange = isFinite(kpi.data.change);
            const Icon = kpi.icon;

            return (
              <Card key={kpi.title} className="transition-all duration-200 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{kpi.format(kpi.data.value)}</div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={isPositive ? 'default' : 'destructive'}
                      className={cn("text-xs", isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}
                    >
                      {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {isFiniteChange ? `${kpi.data.change.toFixed(1)}%` : 'N/A'}
                    </Badge>
                    <div className="w-20 h-8">
                      <Sparkline data={kpi.data.sparkline} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Section */}
      <ChartsSection 
        dateRange={date}
        selectedApps={selectedApps}
        selectedPlatforms={selectedPlatforms}
        summaryData={summaryData}
        isSummaryLoading={isSummaryLoading}
      />

      {/* App Performance Table */}
      <AppsDataTable 
        dateRange={date}
        selectedApps={selectedApps}
        selectedPlatforms={selectedPlatforms}
      />
    </div>
  )
}
