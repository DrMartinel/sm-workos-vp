"use client"

import type React from "react"
import { Suspense, useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  CheckSquare,
  FileText,
  Target,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  BarChart3,
  TrendingUp,
  X,
  Briefcase, // Thay cho Clock
  LayoutGrid, // Thêm icon Applications
  Star,
  Clock,
  Calendar, // Thêm icon Calendar
  LayoutDashboard, // For Dashboard
  Megaphone,       // For Announcements
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserProfileDropdown } from "@/components/auth/user-profile-dropdown"
import { LucideProps } from "lucide-react"

type L2Item = {
  id: string;
  label: string;
  href: string;
  icon?: React.ElementType<LucideProps>;
  isCollapsible?: boolean;
  subItems?: { id: string; label: string; href: string }[];
};

const secondaryMenus: Record<string, { title: string; items: L2Item[] }> = {
  reports: {
    title: "Reports",
    items: [
      { id: "overview", label: "Overview", href: "/reports/overview", icon: TrendingUp },
      { 
        id: "marketing", 
        label: "Marketing", 
        isCollapsible: true,
        subItems: [
          { id: "channel", label: "Channel", href: "/reports/marketing/channel" },
          { id: "campaign", label: "Campaign", href: "/reports/marketing/campaign" },
          { id: "market", label: "Market", href: "/reports/marketing/market" },
          { id: "creative", label: "Creative", href: "/reports/marketing/creative" },
          { id: "storekit", label: "Storekit", href: "/reports/marketing/storekit" },
          { id: "keywords", label: "Keywords", href: "/reports/marketing/keywords" },
        ]
      },
      { 
        id: "operation", 
        label: "Operation", 
        isCollapsible: true,
        subItems: [
           { id: "in-app-ads", label: "In-App Ads", href: "/reports/operation/in-app-ads" },
           { id: "in-app-purchases", label: "In-App Purchases", href: "/reports/operation/in-app-purchases" },
           { id: "liveops-events", label: "LiveOps Events", href: "/reports/operation/liveops-events" },
           { id: "customer-support", label: "Customer Support", href: "/reports/operation/customer-support" },
        ]
      },
      { 
        id: "product", 
        label: "Product", 
        isCollapsible: true,
        subItems: [
            { id: "chatbot-ai", label: "Chatbot AI", href: "/reports/product/chatbot-ai" },
            { id: "note-ai", label: "Note AI", href: "/reports/product/note-ai" },
            { id: "fashion-show", label: "Fashion Show", href: "/reports/product/fashion-show" },
        ]
      },
    ]
  },
  applications: {
    title: "Applications",
    items: [
      { id: "all", label: "All Applications", href: "/applications", icon: LayoutGrid },
      { id: "favourites", label: "Favourites", href: "/applications/favourites", icon: Star },
      { id: "recent", label: "Recently Used", href: "/applications/recent", icon: Clock },
    ]
  },
  hrm: {
    title: "HRM",
    items: [
      { id: "timekeeping", label: "Timekeeping", href: "/timekeeping", icon: Clock },
      { id: "meeting-booking", label: "Meeting Booking", href: "/meeting-booking", icon: Calendar },
    ]
  },
  home: {
    title: "Home",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
      { id: "announcements", label: "Announcements", href: "#", icon: Megaphone },
      { id: "events", label: "Events", href: "#", icon: Calendar },
    ]
  },
};


export default function ReportsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [openSecondaryMenuId, setOpenSecondaryMenuId] = useState<string | null>(null);
  const [expandedL2Groups, setExpandedL2Groups] = useState<Record<string, boolean>>({
    marketing: true,
    operation: true,
    product: true,
  });

  useEffect(() => {
    let activeL1Key: string | null = null;
    let bestMatchLength = 0;

    if (pathname === '/') {
      activeL1Key = 'home';
    } else {
      for (const l1Key in secondaryMenus) {
        if (l1Key === 'home') continue;
        
        const menu = secondaryMenus[l1Key as keyof typeof secondaryMenus];
        
        const checkItems = (items: L2Item[]): void => {
          for (const item of items) {
            if (item.href && item.href !== '/' && pathname.startsWith(item.href) && item.href.length > bestMatchLength) {
              bestMatchLength = item.href.length;
              activeL1Key = l1Key;
            }
            if (item.subItems) {
               checkItems(item.subItems);
            }
          }
        };
        checkItems(menu.items);
      }
    }
    
    const activeL1 = primaryIcons.find(icon => icon.secondaryMenuKey === activeL1Key);
    setOpenSecondaryMenuId(activeL1?.id || null);

  }, [pathname]);


  // Collapsible states for groups - Sẽ được thay thế bằng expandedL2Groups
  // ...

  const primaryIcons = [
    { id: "home", icon: Home, label: "Home", href: "#", secondaryMenuKey: "home" },
    { id: "reports", icon: BarChart3, label: "Reports", href: "#", secondaryMenuKey: "reports" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", href: "#" },
    { id: "requests", icon: FileText, label: "Requests", href: "#" },
    { id: "goals", icon: Target, label: "Goals", href: "#" },
    { id: "hrm", icon: Briefcase, label: "HRM", href: "#", secondaryMenuKey: "hrm" },
    { id: "applications", icon: LayoutGrid, label: "Applications", href: "#", secondaryMenuKey: "applications" },
    { id: "notifications", icon: Bell, label: "Notifications", href: "#", mobileOnly: false },
    { id: "profile", icon: User, label: "Profile", href: "#", mobileOnly: false },
  ]

  const activeIcon = openSecondaryMenuId || (pathname === '/' ? 'home' : null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  const handleL1Click = (item: (typeof primaryIcons)[0]) => {
    if (item.secondaryMenuKey) {
      setOpenSecondaryMenuId(current => (current === item.id ? null : item.id));
      if (sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
    } else if (item.id === 'home') {
      setOpenSecondaryMenuId(null);
      // Điều hướng sẽ được xử lý bởi <Link>
    } else {
       setOpenSecondaryMenuId(null);
       // Hiện tại chưa điều hướng cho các mục khác
    }
  }
  
  const currentSecondaryMenu = openSecondaryMenuId ? secondaryMenus[openSecondaryMenuId as keyof typeof secondaryMenus] : null;


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 md:hidden flex items-center justify-between px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="mr-2">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">WorkOS</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <UserProfileDropdown />
        </div>
      </header>

      {/* Unified Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex bg-white transition-transform duration-300 ease-in-out",
          "w-full md:w-auto", // Full width trên mobile, auto trên desktop
          sidebarCollapsed ? "md:w-16" : "md:w-72", // Width cho desktop
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full", // Logic trượt ra/vào
          "md:translate-x-0" // Luôn hiển thị trên desktop
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
                  if (item.id === 'profile') return null;

                  const Icon = item.icon
                  const isHiddenOnMobile = item.id === 'notifications';

                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href || '#'}
                          onClick={() => handleL1Click(item)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                            activeIcon === item.id
                              ? "bg-gray-900 text-white"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                            isHiddenOnMobile && "hidden md:flex"
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
          <div className="flex flex-col items-center space-y-4">
            <div className="hidden md:block">
              <UserProfileDropdown />
            </div>
          </div>
        </div>

        {/* Secondary Sidebar Section - Conditional Rendering */}
        {currentSecondaryMenu && (
          <div
            className={cn(
              "flex-1 flex flex-col border-r border-gray-200 transition-all duration-300",
              sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
            )}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 flex-shrink-0">
              <h2 className="text-lg font-medium">{currentSecondaryMenu.title}</h2>
              <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="md:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-2">
              {currentSecondaryMenu.items.map((item) => {
                if (item.isCollapsible) {
                  return (
                    <div key={item.id} className="mb-4">
                      <button
                        onClick={() => setExpandedL2Groups(s => ({...s, [item.id]: !s[item.id]}))}
                        className="flex items-center justify-between w-full px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedL2Groups[item.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <span className="font-medium uppercase text-xs">{item.label}</span>
                        </div>
                      </button>
                      {expandedL2Groups[item.id] && (
                        <div className="mt-1 ml-2 space-y-1">
                          {item.subItems?.map(subItem => (
                            <Link
                              key={subItem.id}
                              href={subItem.href}
                              onClick={() => setMobileSidebarOpen(false)}
                              className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                                pathname === subItem.href
                                ? "bg-gray-100 text-gray-900 font-semibold"
                                : "text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              <span>{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                const Icon = item.icon || TrendingUp; // Fallback icon
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn("flex items-center w-full px-3 py-2 text-sm rounded-md font-medium mb-4 transition-colors", 
                      pathname === item.href 
                      ? "bg-gray-100" 
                      : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <Icon className="h-4 w-4 text-blue-500 mr-2" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Collapse Toggle Button */}
        {openSecondaryMenuId && (
          <button
            onClick={toggleSidebar}
            className="absolute top-1/2 -right-3 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm h-6 w-6 hover:text-gray-900 md:flex"
          >
            {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 bg-gray-50 md:mt-0 mt-16 overflow-y-auto transition-all duration-300 ease-in-out",
          openSecondaryMenuId && !sidebarCollapsed ? "md:ml-72" : "md:ml-16"
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}
