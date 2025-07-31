"use client"

import { useState } from "react"
import {
  Shield,
  Edit,
  Settings,
  Users,
  BarChart3,
  Smartphone,
  ShoppingCart,
  Bot,
  Gamepad2,
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data
const reports = [
  {
    id: 1,
    name: "Overview Dashboard",
    description: "General system overview and metrics",
    icon: BarChart3,
    url: "/reports/overview",
    users: 45,
    apps: ["chatbot", "fashion-game"], // Apps this report has access to
  },
  {
    id: 2,
    name: "Marketing Channel",
    description: "Marketing performance and channel analytics",
    icon: Users,
    url: "/reports/marketing",
    users: 23,
    apps: ["chatbot", "ai-note"],
  },
  {
    id: 3,
    name: "Campaign Analytics",
    description: "Campaign performance and ROI tracking",
    icon: BarChart3,
    url: "/reports/campaigns",
    users: 18,
    apps: ["fashion-game"],
  },
  {
    id: 4,
    name: "In-App Ads",
    description: "Advertisement performance within applications",
    icon: Smartphone,
    url: "/reports/in-app-ads",
    users: 12,
    apps: ["chatbot", "fashion-game", "ai-note"],
  },
  {
    id: 5,
    name: "In-App Purchases",
    description: "Purchase analytics and revenue tracking",
    icon: ShoppingCart,
    url: "/reports/purchases",
    users: 8,
    apps: ["fashion-game", "ai-note"],
  },
]

const applications = [
  {
    id: "chatbot",
    name: "Chatbot AI",
    description: "AI-powered customer service chatbot",
    icon: Bot,
    color: "blue",
  },
  {
    id: "fashion-game",
    name: "Fashion Game",
    description: "Interactive fashion styling game",
    icon: Gamepad2,
    color: "purple",
  },
  {
    id: "ai-note",
    name: "AI Note Taker",
    description: "Smart note-taking and organization tool",
    icon: FileText,
    color: "green",
  },
]

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Admin",
    department: "IT",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Manager",
    department: "Marketing",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "User",
    department: "Sales",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    role: "Manager",
    department: "HR",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const users = mockUsers

const reportUrls = [
  { id: 1, path: "/reports/overview", name: "Overview Dashboard" },
  { id: 2, path: "/reports/marketing", name: "Marketing Channel" },
  { id: 3, path: "/reports/campaigns", name: "Campaign Analytics" },
  { id: 4, path: "/reports/in-app-ads", name: "In-App Ads" },
  { id: 5, path: "/reports/purchases", name: "In-App Purchases" },
]

const apps = [
  { id: "chatbot", name: "Chatbot AI", icon: Bot, color: "blue" },
  { id: "fashion-game", name: "Fashion Game", icon: Gamepad2, color: "purple" },
  { id: "ai-note", name: "AI Note Taker", icon: FileText, color: "green" },
]

const mockUserPermissions = [
  {
    userId: 1,
    reportAccess: [1, 2, 3, 4, 5],
    appAccess: {
      1: ["chatbot", "fashion-game"],
      2: ["chatbot"],
      3: ["fashion-game"],
      4: ["chatbot", "fashion-game", "ai-note"],
      5: ["fashion-game", "ai-note"],
    },
  },
  { userId: 2, reportAccess: [2, 5], appAccess: { 2: ["chatbot"], 5: ["ai-note"] } },
  { userId: 3, reportAccess: [1, 3], appAccess: { 1: ["chatbot", "fashion-game"], 3: ["fashion-game"] } },
  { userId: 4, reportAccess: [4], appAccess: { 4: ["chatbot", "ai-note"] } },
]

export default function DataAccessPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isAppAccessModalOpen, setIsAppAccessModalOpen] = useState(false)
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [userPermissions, setUserPermissions] = useState(mockUserPermissions)
  const [tempAppAccess, setTempAppAccess] = useState<{ [reportId: number]: string[] }>({})
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set())
  const [newAppId, setNewAppId] = useState("")
  const [showAppInput, setShowAppInput] = useState<number | null>(null)

  const handleEditAppAccess = (report: any) => {
    setSelectedReport(report)
    setSelectedApps(report.apps)
    setIsAppAccessModalOpen(true)
  }

  const handleAppToggle = (appId: string) => {
    setSelectedApps((prev) => (prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]))
  }

  const getAppIcon = (appId: string) => {
    const app = applications.find((a) => a.id === appId)
    if (!app) return null

    const Icon = app.icon
    return (
      <div
        key={appId}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-${app.color}-100 mr-1`}
        title={app.name}
      >
        <Icon className={`h-3 w-3 text-${app.color}-600`} />
      </div>
    )
  }

  const stats = [
    { title: "Total Reports", value: "5", icon: BarChart3, color: "blue" },
    { title: "Active Users", value: "106", icon: Users, color: "green" },
    { title: "Applications", value: "3", icon: Settings, color: "purple" },
    { title: "Access Rules", value: "15", icon: Shield, color: "orange" },
  ]

  const openPermissionModal = (user: any) => {
    setSelectedUser(user)
    setIsPermissionModalOpen(true)

    // Initialize temporary app access state
    const initialAppAccess: { [reportId: number]: string[] } = {}
    const userPermission = userPermissions.find((p) => p.userId === user.id)

    if (userPermission) {
      reportUrls.forEach((report) => {
        initialAppAccess[report.id] = userPermission.appAccess[report.id] || []
      })
    } else {
      reportUrls.forEach((report) => {
        initialAppAccess[report.id] = []
      })
    }

    setTempAppAccess(initialAppAccess)
  }

  const handleReportAccessChange = (userId: number, reportId: number, hasAccess: boolean) => {
    setUserPermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions]
      const userPermissionIndex = updatedPermissions.findIndex((p) => p.userId === userId)

      if (userPermissionIndex === -1) {
        // User doesn't have any permissions yet, create a new entry
        updatedPermissions.push({
          userId,
          reportAccess: hasAccess ? [reportId] : [],
          appAccess: {},
        })
      } else {
        // User already has permissions, update the report access
        const existingPermission = updatedPermissions[userPermissionIndex]
        const reportAccess = [...existingPermission.reportAccess]

        if (hasAccess) {
          if (!reportAccess.includes(reportId)) {
            reportAccess.push(reportId)
          }
        } else {
          const index = reportAccess.indexOf(reportId)
          if (index > -1) {
            reportAccess.splice(index, 1)
          }
        }

        updatedPermissions[userPermissionIndex] = {
          ...existingPermission,
          reportAccess: reportAccess,
        }
      }

      return updatedPermissions
    })
  }

  const handleAppAccessChange = (reportId: number, appId: string, hasAccess: boolean) => {
    setTempAppAccess((prevTempAppAccess) => {
      const updatedAppAccess = { ...prevTempAppAccess }

      if (!updatedAppAccess[reportId]) {
        updatedAppAccess[reportId] = []
      }

      const appAccessForReport = [...updatedAppAccess[reportId]]

      if (hasAccess) {
        if (!appAccessForReport.includes(appId)) {
          appAccessForReport.push(appId)
        }
      } else {
        const index = appAccessForReport.indexOf(appId)
        if (index > -1) {
          appAccessForReport.splice(index, 1)
        }
      }

      updatedAppAccess[reportId] = appAccessForReport
      return updatedAppAccess
    })
  }

  const savePermissions = () => {
    setUserPermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions]
      const userPermissionIndex = updatedPermissions.findIndex((p) => p.userId === selectedUser.id)

      if (userPermissionIndex !== -1) {
        // User already has permissions, update the app access
        updatedPermissions[userPermissionIndex] = {
          ...updatedPermissions[userPermissionIndex],
          appAccess: tempAppAccess,
        }
      } else {
        // User doesn't have any permissions yet, create a new entry
        updatedPermissions.push({
          userId: selectedUser.id,
          reportAccess: [], // Assuming report access is handled separately
          appAccess: tempAppAccess,
        })
      }

      return updatedPermissions
    })

    setIsPermissionModalOpen(false)
  }

  const toggleUserExpansion = (userId: number) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const renderAppIcons = (appIds: string[], maxVisible = 10) => {
    const visibleApps = appIds.slice(0, maxVisible)
    const hiddenApps = appIds.slice(maxVisible)

    return (
      <div className="flex items-center space-x-1">
        {visibleApps.map((appId) => {
          const app = apps.find((a) => a.id === appId)
          if (!app) return null
          const Icon = app.icon
          return (
            <div
              key={appId}
              className={`w-6 h-6 rounded-full bg-${app.color}-100 flex items-center justify-center`}
              title={app.name}
            >
              <Icon className={`h-3 w-3 text-${app.color}-600`} />
            </div>
          )
        })}
        {hiddenApps.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                  <span className="text-xs font-medium text-gray-600">+{hiddenApps.length}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {hiddenApps.map((appId) => {
                    const app = apps.find((a) => a.id === appId)
                    return app ? (
                      <div key={appId} className="text-sm">
                        {app.name}
                      </div>
                    ) : null
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  const handleAddApp = () => {
    if (newAppId.trim() && selectedUser && selectedReport) {
      const reportId = selectedReport.id
      handleAppAccessChange(reportId, newAppId.trim(), true)
      setNewAppId("")
      setShowAppInput(null)
    }
  }

  const handleRemoveApp = (appId: string) => {
    if (selectedReport) {
      const reportId = selectedReport.id
      handleAppAccessChange(reportId, appId, false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Access</h1>
        <p className="text-gray-500 mt-1">Manage report access and application permissions</p>
      </div>

      {/* Report Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Report Access Control
          </CardTitle>
          <CardDescription>
            Manage which reports users can access and configure app data permissions for each report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Pages Shared</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const userPermissions = mockUserPermissions.find((p) => p.userId === user.id) || {
                    reportAccess: [],
                    appAccess: {},
                  }
                  const isExpanded = expandedUsers.has(user.id)

                  return (
                    <>
                      <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserExpansion(user.id)}
                            className="p-1 h-6 w-6"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell onClick={() => toggleUserExpansion(user.id)}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => toggleUserExpansion(user.id)}>
                          <Badge variant="outline">{user.department}</Badge>
                        </TableCell>
                        <TableCell onClick={() => toggleUserExpansion(user.id)}>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-sm">
                              {userPermissions.reportAccess.length} pages
                            </Badge>
                            {userPermissions.reportAccess.length > 0 && (
                              <div className="text-sm text-gray-500">
                                ({Object.values(userPermissions.appAccess).flat().length} apps)
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openPermissionModal(user)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Access
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50 p-4">
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900">Detailed Access Permissions</h4>
                              {userPermissions.reportAccess.length > 0 ? (
                                <div className="space-y-2">
                                  {userPermissions.reportAccess.map((reportId) => {
                                    const report = reportUrls.find((r) => r.id === reportId)
                                    const appAccess = userPermissions.appAccess[reportId] || []

                                    return (
                                      <div
                                        key={reportId}
                                        className="flex items-center justify-between p-3 bg-white rounded-md border"
                                      >
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900">{report?.path}</div>
                                          <div className="text-sm text-gray-500">{report?.name}</div>
                                          <Badge variant="outline" className="text-xs mt-1">
                                            {/* {report?.category} */}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm text-gray-500 mr-2">{appAccess.length} apps:</span>
                                          {renderAppIcons(appAccess)}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400 italic p-3 bg-white rounded-md border">
                                  No report access configured
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* App Access Modal */}
      <Dialog open={isPermissionModalOpen} onOpenChange={() => setIsPermissionModalOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permissions for {selectedUser?.name}</DialogTitle>
            <DialogDescription>Configure report and app access for the selected user.</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3">
              {/* Quick Search Field */}
              <div className="sticky top-0 bg-white z-10 pb-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {reportUrls
                  .filter(
                    (report) =>
                      report.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      report.name.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((report) => {
                    const userPermissionsForReport = userPermissions.find((p) => p.userId === selectedUser.id)
                    const hasReportAccess = userPermissionsForReport?.reportAccess.includes(report.id) || false
                    const appAccessForReport = tempAppAccess[report.id] || []

                    return (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <Checkbox
                            id={`report-${report.id}`}
                            checked={hasReportAccess}
                            onCheckedChange={(checked) =>
                              handleReportAccessChange(selectedUser.id, report.id, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <Label htmlFor={`report-${report.id}`} className="font-medium cursor-pointer">
                              {report.path}
                            </Label>
                            <p className="text-sm text-gray-500">{report.name}</p>
                          </div>
                        </div>

                        {hasReportAccess && (
                          <div className="ml-6 pt-3 border-t space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium text-gray-700">App Access:</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAppInput(showAppInput === report.id ? null : report.id)}
                                className="text-xs"
                              >
                                + App Access
                              </Button>
                            </div>

                            {showAppInput === report.id && (
                              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                                <input
                                  type="text"
                                  placeholder="Enter App ID (e.g., chatbot, ai-note)"
                                  value={newAppId}
                                  onChange={(e) => setNewAppId(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onKeyPress={(e) => e.key === "Enter" && handleAddApp()}
                                />
                                <Button size="sm" onClick={handleAddApp} disabled={!newAppId.trim()}>
                                  Add
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowAppInput(null)}>
                                  Cancel
                                </Button>
                              </div>
                            )}

                            {appAccessForReport.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {appAccessForReport.map((appId) => {
                                  const app = apps.find((a) => a.id === appId)
                                  const Icon = app?.icon || Bot
                                  const color = app?.color || "gray"

                                  return (
                                    <div
                                      key={appId}
                                      className={`flex items-center space-x-2 px-3 py-1 bg-${color}-50 border border-${color}-200 rounded-full text-sm`}
                                    >
                                      <Icon className={`h-4 w-4 text-${color}-600`} />
                                      <span>{app?.name || appId}</span>
                                      <button
                                        onClick={() => handleRemoveApp(appId)}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {appAccessForReport.length === 0 && !showAppInput && (
                              <div className="text-sm text-gray-400 italic">No app access configured</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={savePermissions}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
