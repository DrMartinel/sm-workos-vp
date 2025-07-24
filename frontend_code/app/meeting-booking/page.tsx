"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Clock, Users, MapPin, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MeetingRoom {
  id: string
  name: string
  capacity: number
  location: string
  equipment: string[]
}

interface Meeting {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  organizer: string
  roomId: string
  status: string
}

const meetingRooms: MeetingRoom[] = [
  {
    id: "room-1",
    name: "Conference Room A",
    capacity: 12,
    location: "Floor 2",
    equipment: ["Projector", "Whiteboard", "Video Conference"],
  },
  {
    id: "room-2",
    name: "Meeting Room B",
    capacity: 6,
    location: "Floor 2",
    equipment: ["TV Screen", "Whiteboard"],
  },
  {
    id: "room-3",
    name: "Executive Room",
    capacity: 8,
    location: "Floor 3",
    equipment: ["Projector", "Video Conference", "Sound System"],
  },
  {
    id: "room-4",
    name: "Small Meeting Room",
    capacity: 4,
    location: "Floor 1",
    equipment: ["TV Screen"],
  },
]

const mockMeetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "Weekly Team Standup",
    startTime: "09:00",
    endTime: "10:00",
    date: "2025-01-10",
    organizer: "John Doe",
    roomId: "room-1",
    status: "Scheduled",
  },
  {
    id: "meeting-2",
    title: "Product Review",
    startTime: "14:00",
    endTime: "15:30",
    date: "2025-01-10",
    organizer: "Jane Smith",
    roomId: "room-1",
    status: "Scheduled",
  },
  {
    id: "meeting-3",
    title: "Client Presentation",
    startTime: "10:00",
    endTime: "11:30",
    date: "2025-01-10",
    organizer: "Mike Johnson",
    roomId: "room-2",
    status: "Scheduled",
  },
]

export default function MeetingBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    organizer: "Current User",
    status: "Scheduled",
  })

  const handleRoomSelect = (room: MeetingRoom) => {
    setSelectedRoom(room)
    setCurrentStep(2)
  }

  const handleCreateMeeting = () => {
    if (!selectedRoom || !newMeeting.title || !newMeeting.date || !newMeeting.startTime || !newMeeting.endTime) {
      alert("Please fill in all required fields")
      return
    }

    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: newMeeting.title,
      startTime: newMeeting.startTime,
      endTime: newMeeting.endTime,
      date: newMeeting.date,
      organizer: newMeeting.organizer,
      roomId: selectedRoom.id,
      status: newMeeting.status,
    }

    setMeetings([...meetings, meeting])
    setNewMeeting({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      organizer: "Current User",
      status: "Scheduled",
    })
    setCurrentStep(2) // Go back to room meetings list
  }

  const getRoomMeetings = (roomId: string) => {
    return meetings.filter((meeting) => meeting.roomId === roomId)
  }

  const steps = [
    { number: 1, title: "Select Room", icon: MapPin },
    { number: 2, title: "View Schedule", icon: Calendar },
    { number: 3, title: "Create Meeting", icon: Plus },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meeting Room Booking</h1>
          <p className="text-gray-500 mt-1">Reserve meeting rooms for your team</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center w-full max-w-2xl">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        isActive && "border-blue-500 bg-blue-500 text-white",
                        isCompleted && "border-green-500 bg-green-500 text-white",
                        !isActive && !isCompleted && "border-gray-300 bg-white text-gray-400",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-sm mt-2 font-medium text-center",
                        isActive && "text-blue-600",
                        isCompleted && "text-green-600",
                        !isActive && !isCompleted && "text-gray-400",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-4 transition-colors",
                        currentStep > step.number ? "bg-green-500" : "bg-gray-300",
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: Select Room */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select a Meeting Room</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meetingRooms.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleRoomSelect(room)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{room.name}</span>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {room.capacity}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {room.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Equipment:</h4>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: View Room Schedule */}
        {currentStep === 2 && selectedRoom && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedRoom.name} - Schedule</h2>
                <p className="text-gray-500">
                  {selectedRoom.location} • Capacity: {selectedRoom.capacity} people
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Meetings</CardTitle>
                <CardDescription>Current bookings for {selectedRoom.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRoomMeetings(selectedRoom.id).length > 0 ? (
                    getRoomMeetings(selectedRoom.id).map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{meeting.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {meeting.startTime} - {meeting.endTime}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {meeting.organizer}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No meetings scheduled for this room today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Create Meeting */}
        {currentStep === 3 && selectedRoom && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Create New Meeting</h2>
                <p className="text-gray-500">Book {selectedRoom.name} for your meeting</p>
              </div>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>Fill in the information for your meeting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Meeting Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter meeting title"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="organizer">Organizer</Label>
                    <Input
                      id="organizer"
                      value={newMeeting.organizer}
                      onChange={(e) => setNewMeeting({ ...newMeeting, organizer: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newMeeting.endTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Room Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Room:</strong> {selectedRoom.name}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedRoom.location}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {selectedRoom.capacity} people
                    </p>
                    <p>
                      <strong>Equipment:</strong> {selectedRoom.equipment.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMeeting} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
