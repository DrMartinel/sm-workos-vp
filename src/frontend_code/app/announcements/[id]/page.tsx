"use client"

import Link from "next/link"
import { ArrowLeft, Bell, Calendar, Clock, FileText, AlertCircle, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: { id: string }
}

export default function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = params

  // Mock data - in a real app, this would come from an API
  const announcements = [
    {
      id: 1,
      title: "Annual Company Retreat 2024",
      message:
        "Join us for our annual company retreat in Napa Valley! This year's theme is 'Innovation and Growth' with team building activities, strategic planning sessions, and networking opportunities. The retreat will feature keynote speakers from industry leaders, interactive workshops on emerging technologies, and plenty of time for team bonding. All meals and accommodations are provided. Please confirm your attendance by March 15th.",
      fullContent: `
        <h2>Event Overview</h2>
        <p>We're excited to announce our Annual Company Retreat 2024, taking place in the beautiful Napa Valley. This year's retreat focuses on "Innovation and Growth" and promises to be our most engaging event yet.</p>
        
        <h3>Schedule</h3>
        <ul>
          <li><strong>Day 1 (April 15):</strong> Arrival, welcome reception, and team building activities</li>
          <li><strong>Day 2 (April 16):</strong> Strategic planning sessions, keynote presentations, and innovation workshops</li>
          <li><strong>Day 3 (April 17):</strong> Networking sessions, closing ceremony, and departure</li>
        </ul>
        
        <h3>What's Included</h3>
        <ul>
          <li>All meals and refreshments</li>
          <li>Accommodation at Napa Valley Resort & Spa</li>
          <li>Transportation to and from the venue</li>
          <li>Workshop materials and welcome package</li>
        </ul>
        
        <h3>Registration</h3>
        <p>Please confirm your attendance by March 15th through the HR portal. Space is limited, so early registration is encouraged.</p>
      `,
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
      fullContent: `
        <h2>Remote Work Policy Updates</h2>
        <p>Effective April 1st, 2024, we are implementing several updates to our remote work policy to better support our team's flexibility and productivity.</p>
        
        <h3>Key Changes</h3>
        <ul>
          <li><strong>Flexible Working Hours:</strong> Core hours are now 10 AM - 3 PM, with flexibility outside these hours</li>
          <li><strong>Equipment Allowance:</strong> Annual $500 allowance for home office equipment</li>
          <li><strong>Communication Guidelines:</strong> Updated expectations for response times and meeting availability</li>
          <li><strong>Performance Metrics:</strong> New outcome-based performance evaluation criteria</li>
        </ul>
        
        <h3>Action Required</h3>
        <p>All employees must acknowledge receipt of this policy update through the HR portal by March 22nd, 2024. Failure to acknowledge may result in temporary access restrictions.</p>
        
        <h3>Questions?</h3>
        <p>If you have any questions about these policy changes, please contact the HR team or attend the Q&A session scheduled for March 20th at 2 PM.</p>
      `,
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
      fullContent: `
        <h2>Tech Innovation Workshop: AI & Machine Learning</h2>
        <p>Join us for an intensive two-day workshop exploring the latest developments in AI and Machine Learning and their applications in our industry.</p>
        
        <h3>Workshop Agenda</h3>
        <h4>Day 1 - March 25, 2024</h4>
        <ul>
          <li>9:00 AM - 10:30 AM: Introduction to AI/ML Fundamentals</li>
          <li>11:00 AM - 12:30 PM: Industry Applications and Case Studies</li>
          <li>1:30 PM - 3:00 PM: Hands-on Workshop: Building Your First Model</li>
          <li>3:30 PM - 5:00 PM: Tools and Platforms Overview</li>
        </ul>
        
        <h4>Day 2 - March 26, 2024</h4>
        <ul>
          <li>9:00 AM - 10:30 AM: Advanced Techniques and Best Practices</li>
          <li>11:00 AM - 12:30 PM: Implementation Strategies</li>
          <li>1:30 PM - 3:00 PM: Group Project and Presentations</li>
          <li>3:30 PM - 4:30 PM: Q&A and Next Steps</li>
        </ul>
        
        <h3>Who Should Attend</h3>
        <p>This workshop is designed for both technical and non-technical staff interested in understanding AI/ML applications. No prior experience required.</p>
        
        <h3>Registration</h3>
        <p>Limited to 30 participants. Register through the learning portal by March 20th.</p>
      `,
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
      fullContent: `
        <h2>All-Hands Team Meeting</h2>
        <p>Join us for our quarterly all-hands meeting to review Q1 performance and discuss upcoming initiatives.</p>
        
        <h3>Agenda</h3>
        <ul>
          <li>Q1 Results Review (30 minutes)</li>
          <li>Upcoming Projects Overview (20 minutes)</li>
          <li>Team Updates and Announcements (15 minutes)</li>
          <li>Q&A Session (15 minutes)</li>
        </ul>
        
        <h3>Preparation</h3>
        <p>Please bring:</p>
        <ul>
          <li>Your project status report</li>
          <li>Any questions or concerns you'd like to discuss</li>
          <li>Ideas for process improvements</li>
        </ul>
        
        <h3>Meeting Details</h3>
        <p><strong>Date:</strong> Friday, March 22nd, 2024<br>
        <strong>Time:</strong> 2:00 PM - 3:00 PM<br>
        <strong>Location:</strong> Conference Room A<br>
        <strong>Remote:</strong> Zoom link will be shared separately</p>
      `,
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
      fullContent: `
        <h2>Scheduled System Maintenance</h2>
        <p>We will be performing scheduled maintenance on our systems to improve performance and security.</p>
        
        <h3>Maintenance Window</h3>
        <p><strong>Date:</strong> Sunday, March 24th, 2024<br>
        <strong>Time:</strong> 2:00 AM - 4:00 AM PST<br>
        <strong>Duration:</strong> Approximately 2 hours</p>
        
        <h3>Affected Services</h3>
        <ul>
          <li>Company intranet and portals</li>
          <li>Email services (brief interruptions possible)</li>
          <li>File sharing and collaboration tools</li>
          <li>Time tracking and HR systems</li>
        </ul>
        
        <h3>What to Expect</h3>
        <ul>
          <li>Services may be intermittently unavailable</li>
          <li>Some features may be temporarily disabled</li>
          <li>Data synchronization may be delayed</li>
        </ul>
        
        <h3>Preparation</h3>
        <p>Please save any important work before the maintenance window and avoid scheduling critical tasks during this time.</p>
        
        <p>We apologize for any inconvenience and appreciate your patience as we work to improve our systems.</p>
      `,
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
      fullContent: `
        <h2>Team Building Escape Room Challenge</h2>
        <p>Get ready for an exciting team building adventure! We're taking the team to Escape Quest Downtown for a thrilling puzzle-solving challenge.</p>
        
        <h3>Event Details</h3>
        <p><strong>Date:</strong> Saturday, March 30th, 2024<br>
        <strong>Time:</strong> 2:00 PM - 5:00 PM<br>
        <strong>Location:</strong> Escape Quest Downtown<br>
        <strong>Address:</strong> 123 Main Street, Downtown</p>
        
        <h3>What to Expect</h3>
        <ul>
          <li>Teams of 4-6 people will work together</li>
          <li>Multiple themed escape rooms available</li>
          <li>60-minute challenges with varying difficulty levels</li>
          <li>Professional photos of your team's adventure</li>
        </ul>
        
        <h3>Schedule</h3>
        <ul>
          <li>2:00 PM - Arrival and team assignments</li>
          <li>2:30 PM - First escape room challenge</li>
          <li>3:45 PM - Second escape room challenge</li>
          <li>4:30 PM - Snacks, drinks, and team photos</li>
          <li>5:00 PM - Wrap up and departure</li>
        </ul>
        
        <h3>What's Included</h3>
        <ul>
          <li>Escape room admission for all participants</li>
          <li>Snacks and refreshments</li>
          <li>Team photos and memories</li>
          <li>Small prizes for successful teams</li>
        </ul>
        
        <h3>Registration</h3>
        <p>Please RSVP by March 25th so we can finalize team arrangements and catering.</p>
      `,
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
      fullContent: `
        <h2>Q2 2024 Holiday Schedule</h2>
        <p>We're pleased to announce the company holiday schedule for the second quarter of 2024.</p>
        
        <h3>Scheduled Holidays</h3>
        <ul>
          <li><strong>Memorial Day:</strong> Monday, May 27th, 2024</li>
          <li><strong>Independence Day:</strong> Thursday, July 4th, 2024</li>
          <li><strong>Independence Day (Observed):</strong> Friday, July 5th, 2024</li>
        </ul>
        
        <h3>Floating Holidays</h3>
        <p>Each employee has 2 floating holiday days that can be used at their discretion during Q2. These must be approved by your manager and scheduled at least one week in advance.</p>
        
        <h3>Vacation Planning</h3>
        <ul>
          <li>Submit vacation requests at least 2 weeks in advance</li>
          <li>Popular dates around holidays fill up quickly</li>
          <li>Consider team coverage when planning time off</li>
          <li>Check with your manager for any project-specific restrictions</li>
        </ul>
        
        <h3>Important Notes</h3>
        <ul>
          <li>Office will be closed on all scheduled holidays</li>
          <li>Emergency support will be available for critical issues</li>
          <li>Holiday pay applies to all full-time employees</li>
          <li>Part-time employees should check with HR for holiday pay eligibility</li>
        </ul>
        
        <p>For questions about the holiday schedule or vacation policies, please contact the HR team.</p>
      `,
      time: "2 days ago",
      type: "announcement",
      priority: "medium",
      author: "HR Team",
    },
  ]

  const announcement = announcements.find((a) => a.id === Number.parseInt(id))

  if (!announcement) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Announcement not found</h3>
            <p className="text-gray-600 mb-4">The announcement you're looking for doesn't exist or has been removed.</p>
            <Link href="/newss">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Announcements
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/news">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Announcements
            </Button>
          </Link>
        </div>

        {/* Announcement Detail */}
        <Card className="border border-gray-200">
          {/* Event Cover Image */}
          {announcement.type === "event" && announcement.coverImage && (
            <div className="relative">
              <img
                src={announcement.coverImage || "/placeholder.svg"}
                alt={announcement.title}
                className="w-full h-64 object-cover rounded-t-lg"
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

          <CardHeader className={announcement.type === "event" && announcement.coverImage ? "pb-4" : ""}>
            {/* Badges for non-event announcements */}
            {!(announcement.type === "event" && announcement.coverImage) && (
              <div className="flex gap-2 mb-4">
                <Badge className={cn("border", getTypeColor(announcement.type))}>
                  {getTypeIcon(announcement.type)}
                  <span className="ml-1 capitalize">{announcement.type}</span>
                </Badge>
                <Badge className={cn("border", getPriorityColor(announcement.priority))}>
                  <span className="capitalize">{announcement.priority}</span>
                </Badge>
              </div>
            )}

            <CardTitle className="text-2xl font-bold text-gray-900 mb-4">{announcement.title}</CardTitle>

            {/* Event-specific information */}
            {announcement.type === "event" && (
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4 p-4 bg-gray-50 rounded-lg">
                {announcement.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">{announcement.eventDate}</span>
                  </div>
                )}
                {announcement.eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{announcement.eventLocation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Meta information */}
            <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{announcement.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>By {announcement.author}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Full Content */}
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.fullContent || announcement.message }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
