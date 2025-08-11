"use client"

import type React from "react"
import { Suspense } from "react"
import { useState } from "react"
import Link from "next/link"
import {
  Home,
  CheckSquare,
  FileText,
  Target,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart3,
  AppWindow,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function TimekeepingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [activeIcon, setActiveIcon] = useState<string>("business")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const primaryIcons = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "reports", icon: BarChart3, label: "Reports", href: "/reports" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { id: "applications", icon: AppWindow, label: "Applications", href: "/applications" },
    { id: "requests", icon: FileText, label: "Requests", href: "#" },
    { id: "goals", icon: Target, label: "Goals", href: "#" },
    { id: "business", icon: Briefcase, label: "Business", href: "#" },
  ]

  const secondaryMenus = {
    business: [
      { id: "timekeeping", label: "Timekeeping", href: "/timekeeping" },
      { id: "meeting-booking", label: "Meeting Booking", href: "/meeting-booking" },
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
                          href={item.href}
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
            <h2 className="text-lg font-medium">Business</h2>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="space-y-1 px-2">
              {secondaryMenus.business?.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    item.href === "/timekeeping" && "bg-gray-100 font-medium",
                  )}
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
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:ml-16" : "md:ml-72",
          "pt-16 md:pt-0", // Add top padding on mobile for header
        )}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  )
}
