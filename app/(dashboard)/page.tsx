"use client"

import {
  CheckSquare,
  Target,
  GitBranch,
  BarChart3,
  Megaphone,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const announcements = [
  {
    title: "New Company-Wide Holiday Policy",
    content: "We're excited to announce an updated holiday schedule with more flexible time-off options.",
    date: "2 hours ago",
  },
  {
    title: "Q3 All-Hands Meeting Next Week",
    content: "Join us for our quarterly all-hands meeting to discuss our progress and future goals.",
    date: "1 day ago",
  },
  {
    title: "Welcome Our New Head of Engineering!",
    content: "Please give a warm welcome to Sarah Johnson, who will be leading our engineering team.",
    date: "2 days ago",
  },
  {
    title: "Server Maintenance This Weekend",
    content: "Please be aware of scheduled server maintenance this Saturday from 2 AM to 4 AM.",
    date: "4 days ago",
  },
]

export default function WorkspaceDashboard() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
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
                <Link href="#">
                  <Button variant="outline" className="h-20 flex-col justify-center gap-1 w-full bg-transparent">
                    <CheckSquare className="h-5 w-5" />
                    <span>Tasks</span>
                  </Button>
                </Link>
                <Link href="/reports/overview">
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
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Latest news and updates from the company.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="#" className="w-full">
                <Button variant="outline" className="w-full">
                  View all
                </Button>
              </Link>
            </CardFooter>
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
    </div>
  )
}
