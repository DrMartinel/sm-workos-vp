"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Calendar, Clock, FileText, AlertCircle, Search, Filter, ChevronDown, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")

  const announcements = [
    {
      id: 1,
      title: "Annual Company Retreat 2024",
      message:
        "Join us for our annual company retreat in Napa Valley! This year's theme is 'Innovation and Growth' with team building activities, strategic planning sessions, and networking opportunities. The retreat will feature keynote speakers from industry leaders, interactive workshops on emerging technologies, and plenty of time for team bonding. All meals and accommodations are provided. Please confirm your attendance by March 15th.",
      time: "2 hours ago",
      type: "event",
      priority: "high",
      author: "HR Team",
      eventDate: "April 15-17, 2024",
      eventLocation: "Napa Valley Resort & Spa",
      coverImage: "/placeholder.svg?height=200&width=800",
    },
    {
      id: 2,
      title: "New Company Policy Update",
      message:
        "Please review the updated remote work policy effective next month. Key changes include flexible working hours, new equipment allowances, and updated communication guidelines. All employees are required to acknowledge receipt of this policy update through the HR portal by the end of this week.",
      time: "4 hours ago",
      type: "policy",
      priority: "high",
      author: "Policy Team",
    },
    {
      id: 3,
      title: "Tech Innovation Workshop",
      message:
        "Two-day intensive workshop on AI and Machine Learning applications in our industry. Learn about the latest trends, tools, and techniques from expert instructors. This workshop is designed for both technical and non-technical staff. Lunch and materials will be provided. Limited seats available - register now!",
      time: "6 hours ago",
      type: "event",
      priority: "medium",
      author: "Tech Team",
      eventDate: "March 25-26, 2024",
      eventLocation: "Conference Center, Building A",
      coverImage: "/placeholder.svg?height=200&width=800",
    },
    {
      id: 4,
      title: "Team Meeting Scheduled",
      message:
        "All-hands meeting scheduled for Friday at 2 PM in Conference Room A. We'll be discussing Q1 results, upcoming projects, and team updates. Please come prepared with your project status reports and any questions you'd like to address.",
      time: "1 day ago",
      type: "meeting",
      priority: "medium",
      author: "Management",
    },
    {
      id: 5,
      title: "System Maintenance Notice",
      message:
        "Scheduled maintenance on Sunday from 2-4 AM. Services may be temporarily unavailable during this time. We apologize for any inconvenience and appreciate your patience as we work to improve system performance.",
      time: "1 day ago",
      type: "system",
      priority: "low",
      author: "IT Team",
    },
    {
      id: 6,
      title: "Team Building Escape Room Challenge",
      message:
        "Join us for a fun team building event at the local escape room! Work together to solve puzzles, crack codes, and escape within the time limit. This is a great opportunity to strengthen team bonds and have some fun outside the office. Snacks and drinks will be provided afterwards.",
      time: "2 days ago",
      type: "event",
      priority: "medium",
      author: "HR Team",
      eventDate: "March 30, 2024",
      eventLocation: "Escape Quest Downtown",
      coverImage: "/placeholder.svg?height=200&width=800",
    },
    {
      id: 7,
      title: "Holiday Schedule Announcement",
      message:
        "Company holidays for Q2 have been announced. Check the calendar for details and plan your time off accordingly. Remember to submit your vacation requests at least two weeks in advance.",
      time: "2 days ago",
      type: "announcement",
      priority: "medium",
      author: "HR Team",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "policy":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "meeting":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "system":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "announcement":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "event":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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
      case "event":
        return <Calendar className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || announcement.type === selectedType
    const matchesPriority = selectedPriority === "all" || announcement.priority === selectedPriority

    return matchesSearch && matchesType && matchesPriority
  })

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Announcements</h1>
          <p className="text-gray-600">Stay updated with the latest news and announcements from the company</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Type: {selectedType === "all" ? "All" : selectedType}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedType("all")}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("policy")}>Policy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("meeting")}>Meeting</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("system")}>System</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("announcement")}>Announcement</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("event")}>Event</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Priority: {selectedPriority === "all" ? "All" : selectedPriority}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedPriority("all")}>All Priorities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPriority("high")}>High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>Medium</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPriority("low")}>Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-8">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="mb-6">
              <Link href={`/news/${announcement.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                  {/* Event Cover Image */}
                  {announcement.type === "event" && announcement.coverImage && (
                    <div className="relative">
                      <img
                        src={announcement.coverImage || "/placeholder.svg"}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cn("border", getTypeColor(announcement.type))}>
                          {getTypeIcon(announcement.type)}
                          <span className="ml-1 capitalize">{announcement.type}</span>
                        </Badge>
                        <Badge className={cn("border", getPriorityColor(announcement.priority))}>
                          <span className="capitalize">{announcement.priority}</span>
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className={announcement.type === "event" && announcement.coverImage ? "pb-3" : ""}>
                    {/* Badges for non-event announcements */}
                    {!(announcement.type === "event" && announcement.coverImage) && (
                      <div className="flex gap-2 mb-3">
                        <Badge className={cn("border", getTypeColor(announcement.type))}>
                          {getTypeIcon(announcement.type)}
                          <span className="ml-1 capitalize">{announcement.type}</span>
                        </Badge>
                        <Badge className={cn("border", getPriorityColor(announcement.priority))}>
                          <span className="capitalize">{announcement.priority}</span>
                        </Badge>
                      </div>
                    )}

                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</CardTitle>

                    {/* Event-specific information */}
                    {announcement.type === "event" && (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {announcement.eventDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{announcement.eventDate}</span>
                          </div>
                        )}
                        {announcement.eventLocation && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{announcement.eventLocation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <CardDescription className="text-gray-600 line-clamp-3">{announcement.message}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{announcement.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>By {announcement.author}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
