"use client"

import type React from "react"
import { Suspense } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  ChevronDown,
  User,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ReportsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Collapsible states for groups
  const [marketingExpanded, setMarketingExpanded] = useState(true)
  const [operationExpanded, setOperationExpanded] = useState(true)
  const [productExpanded, setProductExpanded] = useState(true)

  const primaryIcons = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "reports", icon: BarChart3, label: "Reports", href: "/reports" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { id: "requests", icon: FileText, label: "Requests", href: "#" },
    { id: "goals", icon: Target, label: "Goals", href: "#" },
    { id: "notifications", icon: Bell, label: "Notifications", href: "#" },
    { id: "workflow", icon: GitBranch, label: "Workflow", href: "/workflow-editor" },
    { id: "settings", icon: Settings, label: "Settings", href: "#" },
  ]

  const activeIcon = primaryIcons.find(item => pathname.startsWith(item.href) && item.href !== "/")?.id || (pathname === "/" ? "home" : "reports");

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
                          href={item.href}
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 flex-shrink-0">
            <h2 className="text-lg font-medium">Reports</h2>
          </div>

          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            {/* Overview */}
            <Link
              href="/reports"
              className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md font-medium mb-4 transition-colors", 
                pathname === "/reports" 
                ? "bg-gray-100" 
                : "hover:bg-gray-50 text-gray-700"
              )}
            >
              <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
              <span>Overview</span>
            </Link>

            {/* Marketing Group */}
            <div className="mb-4">
              <button
                onClick={() => setMarketingExpanded(!marketingExpanded)}
                className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {marketingExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium uppercase text-xs">Marketing</span>
                </div>
              </button>

              {marketingExpanded && (
                <div className="mt-1 ml-2 space-y-1">
                  <Link
                    href="/reports/marketing/channel"
                    className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/reports/marketing/channel"
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>Channel</span>
                  </Link>
                  <Link
                    href="/reports/marketing/campaign"
                    className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/reports/marketing/campaign"
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>Campaign</span>
                  </Link>
                  <Link
                    href="/reports/marketing/market"
                    className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/reports/marketing/market"
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>Market</span>
                  </Link>
                  <Link
                    href="/reports/marketing/creative"
                    className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/reports/marketing/creative"
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>Creative</span>
                  </Link>
                  <Link
                    href="/reports/marketing/storekit"
                    className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/reports/marketing/storekit"
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>Storekit</span>
                  </Link>
                  <Link
                    href="/reports/marketing/keywords"
                    className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/reports/marketing/keywords"
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>Keywords</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Operation Group */}
            <div className="mb-4">
              <button
                onClick={() => setOperationExpanded(!operationExpanded)}
                className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {operationExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium uppercase text-xs">Operation</span>
                </div>
              </button>

              {operationExpanded && (
                <div className="mt-1 ml-2 space-y-1">
                  <Link
                    href="/reports/operation/in-app-ads"
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>In-App Ads</span>
                  </Link>
                  <Link
                    href="/reports/operation/in-app-purchases"
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>In-App Purchases</span>
                  </Link>
                  <Link
                    href="/reports/operation/liveops-events"
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>LiveOps Events</span>
                  </Link>
                  <Link
                    href="/reports/operation/customer-support"
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>Customer Support</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Product Group */}
            <div className="mb-4">
              <button
                onClick={() => setProductExpanded(!productExpanded)}
                className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {productExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium uppercase text-xs">Product</span>
                </div>
              </button>

              {productExpanded && (
                <div className="mt-1 ml-2 space-y-1">
                  <Link
                    href="/reports/product/chatbot-ai"
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>Chatbot AI</span>
                  </Link>
                  <Link
                    href="/reports/product/note-ai"
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>Note AI</span>
                  </Link>
                  <Link
                    href="/reports/product/fashion-show"
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>Fashion Show</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
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
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:ml-16" : "md:ml-72",
        )}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  )
}
