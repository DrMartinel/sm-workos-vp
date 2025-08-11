"use client"

import type React from "react"
import { Suspense } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
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
  Plus,
  Calendar,
  Clock,
  ChevronDown,
  BarChart3,
  Bot,
  Gamepad2,
  StickyNoteIcon as NoteIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function TasksLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [activeIcon, setActiveIcon] = useState<string>("tasks")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Thêm hiệu ứng fade cho secondary sidebar khi chuyển đổi giữa các trang
  const [sidebarFade, setSidebarFade] = useState(true)

  // Xử lý hiệu ứng khi chuyển đổi giữa các icon
  const handleIconChange = (id: string, href: string) => {
    if (id !== activeIcon) {
      setSidebarFade(false)
      setTimeout(() => {
        setActiveIcon(id)
        setSidebarFade(true)
      }, 150)
    }
  }

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view") || "today"
  const idParam = searchParams.get("id")

  const primaryIcons = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "reports", icon: BarChart3, label: "Reports", href: "/reports" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { id: "requests", icon: FileText, label: "Requests", href: "#" },
    { id: "goals", icon: Target, label: "Goals", href: "#" },
    { id: "workflow", icon: GitBranch, label: "Workflow", href: "/workflow-editor" },
    { id: "settings", icon: Settings, label: "Settings", href: "#" },
  ]

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  const isActive = (view: string, id?: string) => {
    if (view !== viewParam) return false
    if ((view === "project" || view === "label" || view === "tasktype") && id) {
      return idParam === id
    }
    return true
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
                          onClick={() => handleIconChange(item.id, item.href)}
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
            "flex-1 flex flex-col border-r border-gray-200 transition-all duration-500 ease-in-out",
            sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
            sidebarFade ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="p-4">
            <Button
              onClick={() => {
                // Trigger the hidden Add Task button in the page component
                const addTaskButton = document.querySelector('[data-add-task="true"]')
                if (addTaskButton) {
                  ;(addTaskButton as HTMLButtonElement).click()
                }
              }}
              className="w-full justify-start gap-2 bg-red-500 hover:bg-red-600 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <nav className="px-2 py-2 transition-opacity duration-300 ease-in-out">
            <Link
              href="/tasks?view=today"
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                isActive("today") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-500" />
                <span>Today</span>
              </div>
              <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">5</Badge>
            </Link>

            <Link
              href="/tasks?view=upcoming"
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md mt-1",
                isActive("upcoming") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Upcoming</span>
              </div>
              <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">8</Badge>
            </Link>

            <div className="mt-6">
              <button className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <span className="font-medium uppercase text-xs">Projects</span>
                </div>
              </button>

              <div className="mt-1 ml-2">
                <Link
                  href="/tasks?view=project&id=chatbot-ai"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("project", "chatbot-ai") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <span>Chatbot AI</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">5</Badge>
                </Link>
                <Link
                  href="/tasks?view=project&id=fashion-game"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("project", "fashion-game") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-purple-500" />
                    <span>Fashion Game</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">8</Badge>
                </Link>
                <Link
                  href="/tasks?view=project&id=ai-note-taker"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("project", "ai-note-taker") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <NoteIcon className="h-4 w-4 text-green-500" />
                    <span>AI Note Taker</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">3</Badge>
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <button className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <span className="font-medium uppercase text-xs">Task Types</span>
                </div>
              </button>

              <div className="mt-1 ml-2">
                <Link
                  href="/tasks?view=tasktype&id=design"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("tasktype", "design") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>Design UI/UX</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">3</Badge>
                </Link>
                <Link
                  href="/tasks?view=tasktype&id=development"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("tasktype", "development") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>Development</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">5</Badge>
                </Link>
                <Link
                  href="/tasks?view=tasktype&id=documentation"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("tasktype", "documentation")
                      ? "bg-gray-100 font-medium"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>Documentation</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">2</Badge>
                </Link>
                <Link
                  href="/tasks?view=tasktype&id=bugfix"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("tasktype", "bugfix") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>Bug Fix</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">4</Badge>
                </Link>
                <Link
                  href="/tasks?view=tasktype&id=testing"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("tasktype", "testing") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>Testing</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">1</Badge>
                </Link>
                <Link
                  href="/tasks?view=tasktype&id=review"
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                    isActive("tasktype", "review") ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>Review</span>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">2</Badge>
                </Link>
              </div>
            </div>
          </nav>
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
