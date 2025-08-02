"use client"
import { Users, Activity, Shield, Server, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Sessions",
      value: "1,234",
      change: "+5%",
      changeType: "positive" as const,
      icon: Activity,
      color: "green",
    },
    {
      title: "Data Access Rules",
      value: "156",
      change: "+3",
      changeType: "neutral" as const,
      icon: Shield,
      color: "purple",
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "Excellent",
      changeType: "positive" as const,
      icon: Server,
      color: "emerald",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "Created new user account",
      time: "2 minutes ago",
      type: "user",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Updated data access permissions",
      time: "15 minutes ago",
      type: "permission",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "Generated system report",
      time: "1 hour ago",
      type: "report",
    },
    {
      id: 4,
      user: "Sarah Wilson",
      action: "Modified user role settings",
      time: "2 hours ago",
      type: "role",
    },
  ]

  const systemAlerts = [
    {
      id: 1,
      title: "High Memory Usage",
      description: "Server memory usage is at 85%",
      severity: "warning" as const,
      time: "5 minutes ago",
    },
    {
      id: 2,
      title: "Backup Completed",
      description: "Daily backup completed successfully",
      severity: "success" as const,
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Failed Login Attempts",
      description: "Multiple failed login attempts detected",
      severity: "error" as const,
      time: "3 hours ago",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your system management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p
                      className={`text-xs ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "neutral"
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system activities and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>Important system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {alert.severity === "error" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {alert.severity === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {alert.severity === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <Badge
                        variant={
                          alert.severity === "error"
                            ? "destructive"
                            : alert.severity === "warning"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-400">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700">
              <Users className="h-6 w-6" />
              <span>Add New User</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Shield className="h-6 w-6" />
              <span>Manage Permissions</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
