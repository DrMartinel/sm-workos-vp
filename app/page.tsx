"use client"

import { useState } from "react"
import {
  Home,
  CheckSquare,
  FileText,
  Target,
  Bell,
  GitBranch,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function WorkspaceDashboard() {
  const [activeIcon, setActiveIcon] = useState<string>("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const primaryIcons = [
    { id: "home", icon: Home, label: "Home" },
    { id: "reports", icon: BarChart3, label: "Reports" },
    { id: "tasks", icon: CheckSquare, label: "Tasks" },
    { id: "requests", icon: FileText, label: "Requests" },
    { id: "goals", icon: Target, label: "Goals" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "workflow", icon: GitBranch, label: "Workflow" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  const secondaryMenus = {
    home: [
      { id: "dashboard", label: "Dashboard" },
      { id: "recent", label: "Recent Activity" },
      { id: "favorites", label: "Favorites" },
      { id: "team", label: "Team" },
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
    notifications: [
      { id: "all-notifications", label: "All Notifications" },
      { id: "unread", label: "Unread" },
      { id: "mentions", label: "Mentions" },
      { id: "settings", label: "Settings" },
    ],
    workflow: [
      { id: "processes", label: "Processes" },
      { id: "automations", label: "Automations" },
      { id: "templates", label: "Templates" },
      { id: "history", label: "History" },
    ],
    settings: [
      { id: "profile", label: "Profile" },
      { id: "preferences", label: "Preferences" },
      { id: "team", label: "Team Settings" },
      { id: "integrations", label: "Integrations" },
    ],
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleMobileSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Unified Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex bg-white transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-72",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
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
                                : item.id === "workflow"
                                  ? "/workflow-editor"
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
          <div className="flex flex-col items-center space-y-6">
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
                <button
                  key={item.id}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm z-50 text-gray-500 hover:text-gray-900"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-auto p-4 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:ml-16" : "md:ml-72",
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
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="text-sm font-medium">Task updated by Team Member</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                  ))}
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
