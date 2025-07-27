"use client"

import { useState } from "react"
import {
  Home,
  CheckSquare,
  FileText,
  Target,
  Bell,
  GitBranch,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart3,
  AppWindow,
  Briefcase,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function WorkspaceDashboard() {
  const [activeIcon, setActiveIcon] = useState<string>("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const primaryIcons = [
    { id: "home", icon: Home, label: "Home" },
    { id: "reports", icon: BarChart3, label: "Reports" },
    { id: "tasks", icon: CheckSquare, label: "Tasks" },
    { id: "applications", icon: AppWindow, label: "Applications" },
    { id: "requests", icon: FileText, label: "Requests" },
    { id: "goals", icon: Target, label: "Goals" },
    { id: "business", icon: Briefcase, label: "Business" },
  ]

  const secondaryMenus = {
    home: [
      { id: "dashboard", label: "Dashboard" },
      { id: "recent", label: "Recent Activity" },
      { id: "favorites", label: "Favorites" },
      { id: "team", label: "Team" },
      { id: "announcements", label: "Announcements" },
    ],
    reports: [
      { id: "overview", label: "Overview" },
      { id: "analytics", label: "Analytics" },
      { id: "insights", label: "Insights" },
      { id: "trends", label: "Trends" },
    ],
    tasks: [
      { id: "all", label: "All Tasks" },
      { id: "assigned", label: "Assigned to Me" },
      { id: "completed", label: "Completed" },
      { id: "kanban", label: "Kanban Board" },
    ],
    applications: [
      { id: "all-apps", label: "All Applications" },
      { id: "favourites", label: "Favourites" },
      { id: "recently-used", label: "Recently Used" },
    ],
    requests: [
      { id: "my-requests", label: "My Requests" },
      { id: "approvals", label: "Approvals" },
      { id: "templates", label: "Templates" },
      { id: "history", label: "History" },
    ],
    goals: [
      { id: "objectives", label: "Objectives" },
      { id: "key-results", label: "Key Results" },
      { id: "progress", label: "Progress" },
      { id: "reports", label: "Reports" },
    ],
    business: [
      { id: "timekeeping", label: "Timekeeping" },
      { id: "meeting-booking", label: "Meeting Booking" },
    ],
  }

  const notifications = [
    {
      id: 1,
      title: "New Company Policy Update",
      message: "Please review the updated remote work policy effective next month.",
      time: "2 hours ago",
      type: "policy",
      priority: "high",
    },
    {
      id: 2,
      title: "Team Meeting Scheduled",
      message: "All-hands meeting scheduled for Friday at 2 PM in Conference Room A.",
      time: "4 hours ago",
      type: "meeting",
      priority: "medium",
    },
    {
      id: 3,
      title: "System Maintenance Notice",
      message: "Scheduled maintenance on Sunday from 2-4 AM. Services may be temporarily unavailable.",
      time: "1 day ago",
      type: "system",
      priority: "low",
    },
    {
      id: 4,
      title: "Holiday Schedule Announcement",
      message: "Company holidays for Q2 have been announced. Check the calendar for details.",
      time: "2 days ago",
      type: "announcement",
      priority: "medium",
    },
  ]

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-orange-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "policy":
        return <FileText className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "system":
        return <AlertCircle className="h-4 w-4" />
      case "announcement":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={toggleMobileSidebar}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">WorkOS</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon">
              <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-200">
                <User className="h-full w-full p-1 text-gray-500" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex bg-white transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-72",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:top-0 top-16", // Add top margin on mobile for header
        )}
      >
        {/* Primary Sidebar Section */}
        <div className="w-16 flex flex-col items-center justify-between py-6 border-r border-gray-100">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <span className="text-lg font-bold text-gray-700">W</span>
            </div>
            <div className="h-px w-8 bg-gray-200" />
            <TooltipProvider>
              <div className="flex flex-col items-center space-y-6">
                {primaryIcons.map((item) => {
                  const Icon = item.icon
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={
                            item.id === "tasks"
                              ? "/tasks"
                              : item.id === "reports"
                                ? "/reports"
                                : item.id === "applications"
                                  ? "/applications"
                                  : "#"
                          }
                          onClick={() => setActiveIcon(item.id)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                            activeIcon === item.id
                              ? "bg-gray-900 text-white"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </div>
          {/* Hide notification and profile on mobile, show on desktop */}
          <div className="hidden md:flex flex-col items-center space-y-6">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
              <User className="h-full w-full p-2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Secondary Sidebar Section */}
        <div
          className={cn(
            "flex-1 flex flex-col border-r border-gray-200 transition-all duration-300",
            sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-medium">{primaryIcons.find((icon) => icon.id === activeIcon)?.label}</h2>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="space-y-1 px-2">
              {secondaryMenus[activeIcon as keyof typeof secondaryMenus]?.map((item) => (
                <Link
                  key={item.id}
                  href={
                    activeIcon === "business" && item.id === "timekeeping"
                      ? "/timekeeping"
                      : activeIcon === "business" && item.id === "meeting-booking"
                        ? "/meeting-booking"
                        : activeIcon === "home" && item.id === "news"
                          ? "/news"
                          : "#"
                  }
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm z-50 text-gray-500 hover:text-gray-900 hidden md:flex"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-auto p-4 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:ml-16" : "md:ml-72",
          "pt-16 md:pt-0", // Add top padding on mobile for header
        )}
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Workspace</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used tools and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/tasks">
                    <Button variant="outline" className="h-20 flex-col justify-center gap-1 w-full bg-transparent">
                      <CheckSquare className="h-5 w-5" />
                      <span>Tasks</span>
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="outline" className="h-20 flex-col justify-center gap-1 w-full bg-transparent">
                      <BarChart3 className="h-5 w-5" />
                      <span>Reports</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-20 flex-col justify-center gap-1 bg-transparent">
                    <Target className="h-5 w-5" />
                    <span>Set Goal</span>
                  </Button>
                  <Link href="/workflow-editor">
                    <Button variant="outline" className="h-20 flex-col justify-center gap-1 w-full bg-transparent">
                      <GitBranch className="h-5 w-5" />
                      <span>Workflow</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Company Notifications
                </CardTitle>
                <CardDescription>Latest announcements and updates from the company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={cn("mt-1", getPriorityColor(notification.priority))}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                          <Badge
                            variant={notification.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-400">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/newss">
                    <Button variant="ghost" className="w-full text-sm text-gray-600 hover:text-gray-900">
                      View all notifications
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Current team status and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm font-medium text-gray-500">Active Tasks</div>
                    <div className="mt-2 text-3xl font-bold">24</div>
                    <div className="mt-1 text-xs text-green-500">+12% from last week</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm font-medium text-gray-500">Pending Requests</div>
                    <div className="mt-2 text-3xl font-bold">7</div>
                    <div className="mt-1 text-xs text-amber-500">+3% from last week</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-sm font-medium text-gray-500">Completed Goals</div>
                    <div className="mt-2 text-3xl font-bold">12</div>
                    <div className="mt-1 text-xs text-green-500">+8% from last week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
