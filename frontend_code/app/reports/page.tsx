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

export default function ReportsPage() {
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
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="chatbot-ai">Chatbot AI</SelectItem>
                <SelectItem value="note-ai">Note AI</SelectItem>
                <SelectItem value="fashion-show">Fashion Show</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="vn">Vietnam</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="kr">South Korea</SelectItem>
                <SelectItem value="th">Thailand</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
          </div>
        </div>
      </div>

      {/* Section 1: KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={kpi.trend === "up" ? "default" : "destructive"}
                    className={cn(
                      "text-xs",
                      kpi.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                    )}
                  >
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(kpi.change)}%
                  </Badge>
                  <div className="w-20 h-8">
                    <Sparkline data={kpi.sparkline} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Section 2: Time Series Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
            <CardDescription>Zoomable time range with brush control</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                <Brush dataKey="date" height={30} stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Multi-series area chart comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficSourcesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="organic" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="paid" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="social" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="direct" stackId="1" stroke="#ef4444" fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section 2.5: Combined Scorecard and Dual-Axis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>ROAS Performance</CardTitle>
            <CardDescription>Return on Ad Spend metrics with cost analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Scorecard Section */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-600 mb-1">ROAS D0</div>
                <div className="text-2xl font-bold text-gray-900">55.38%</div>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">-15.4%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-pink-600 mb-1">eROAS D30</div>
                <div className="text-2xl font-bold text-gray-900">112.63%</div>
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
              <ComposedChart data={roasData}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" domain={[0, 150]} tickFormatter={(value) => `${value}%`} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "cost") return [`$${((value as number) / 1000000).toFixed(1)}M`, "Cost"]
                    return [`${value}%`, name]
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

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>CPI & Cost Analysis</CardTitle>
            <CardDescription>Cost per install trends with total spend</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Scorecard Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-600 mb-1">CPI</div>
                <div className="text-2xl font-bold text-gray-900">714.96 đ</div>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">-8.9%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-cyan-600 mb-1">COST</div>
                <div className="text-xl font-bold text-gray-900">10,442,240,185 đ</div>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+6.7%</span>
                </div>
              </div>
            </div>

            {/* Dual-Axis Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={cpiData}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" domain={[0, 1000]} tickFormatter={(value) => `${value}`} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "cost") return [`${((value as number) / 1000000).toFixed(1)}M đ`, "Cost"]
                    if (name === "cpi") return [`${value} đ`, "CPI"]
                    return [`${value}`, name]
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
                <ReferenceArea yAxisId="left" y1={600} y2={700} fill="#374151" fillOpacity={0.1} label="Breakeven" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Product</CardTitle>
            <CardDescription>Horizontal bar chart</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByProductData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="product" type="category" width={80} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Stacked bar chart</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conversionFunnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="desktop" stackId="a" fill="#3b82f6" />
                <Bar dataKey="mobile" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Interactive donut chart</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Radar chart comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Heatmaps and Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Heatmap</CardTitle>
            <CardDescription>Daily user activity over the last 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CalendarHeatmap data={calendarData} />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                  <div className="w-3 h-3 bg-blue-200 rounded-sm" />
                  <div className="w-3 h-3 bg-blue-400 rounded-sm" />
                  <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                  <div className="w-3 h-3 bg-blue-800 rounded-sm" />
                </div>
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Retention</CardTitle>
            <CardDescription>Correlation analysis by cohort</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="revenue" name="Revenue" />
                <YAxis dataKey="retention" name="Retention %" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Q1" data={scatterData.filter((d) => d.cohort === "Q1")} fill="#3b82f6" />
                <Scatter name="Q2" data={scatterData.filter((d) => d.cohort === "Q2")} fill="#10b981" />
                <Scatter name="Q3" data={scatterData.filter((d) => d.cohort === "Q3")} fill="#f59e0b" />
                <Scatter name="Q4" data={scatterData.filter((d) => d.cohort === "Q4")} fill="#ef4444" />
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Table and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Projects Overview</CardTitle>
          <CardDescription>Manage and track your project performance</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Tags:</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTags([...selectedTags, tag])
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag))
                        }
                      }}
                    />
                    <Label htmlFor={tag} className="text-sm">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="search">Search:</Label>
              <Input
                id="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.owner}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === "Active"
                            ? "default"
                            : project.status === "Completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.updated}</TableCell>
                    <TableCell>${project.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Tabbed Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>In-depth analytics across different business areas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">User Insights</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="tech">Tech Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Acquisition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financials" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$2.8M</div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>ARPU</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$114.50</div>
                    <p className="text-sm text-gray-500">Average Revenue Per User</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>LTV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$1,247</div>
                    <p className="text-sm text-gray-500">Customer Lifetime Value</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tech" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>App Crashes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0.02%</div>
                    <p className="text-sm text-gray-500">Crash Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Load Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.2s</div>
                    <p className="text-sm text-gray-500">Average Load Time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87%</div>
                    <p className="text-sm text-gray-500">30-day Retention</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
