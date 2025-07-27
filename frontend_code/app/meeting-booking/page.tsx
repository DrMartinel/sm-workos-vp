"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { number: 1, title: "Select Room", description: "Choose meeting room" },
  { number: 2, title: "View Schedule", description: "Check availability" },
  { number: 3, title: "Create Meeting", description: "Book your meeting" },
]

const meetingRooms = [
  {
    id: 1,
    name: "Conference Room A",
    capacity: 12,
    location: "Floor 2",
    amenities: ["Projector", "Whiteboard", "Video Call"],
    available: true,
  },
  {
    id: 2,
    name: "Meeting Room B",
    capacity: 6,
    location: "Floor 1",
    amenities: ["TV Screen", "Whiteboard"],
    available: true,
  },
  {
    id: 3,
    name: "Executive Room",
    capacity: 8,
    location: "Floor 3",
    amenities: ["Premium Setup", "Coffee Machine", "Video Call"],
    available: false,
  },
]

const timeSlots = [
  { time: "09:00 - 10:00", available: true },
  { time: "10:00 - 11:00", available: false },
  { time: "11:00 - 12:00", available: true },
  { time: "13:00 - 14:00", available: true },
  { time: "14:00 - 15:00", available: false },
  { time: "15:00 - 16:00", available: true },
]

export default function MeetingBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingDescription, setMeetingDescription] = useState("")

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBookMeeting = () => {
    // Handle meeting booking logic here
    alert("Meeting booked successfully!")
    // Reset form
    setCurrentStep(1)
    setSelectedRoom(null)
    setSelectedTime(null)
    setMeetingTitle("")
    setMeetingDescription("")
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedRoom !== null
      case 2:
        return selectedTime !== null
      case 3:
        return meetingTitle.trim() !== ""
      default:
        return false
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meeting Booking</h1>
        <p className="text-gray-600">Book a meeting room in 3 simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStep
            const isCurrent = step.number === currentStep

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors relative z-10",
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-gray-300 text-gray-500",
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={cn("text-sm font-medium", isCurrent ? "text-blue-600" : "text-gray-500")}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 relative top-[-20px]">
                    <div
                      className={cn(
                        "h-full transition-colors",
                        step.number < currentStep ? "bg-green-500" : "bg-gray-300",
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Select Meeting Room"}
            {currentStep === 2 && "Choose Time Slot"}
            {currentStep === 3 && "Meeting Details"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Choose from available meeting rooms"}
            {currentStep === 2 && "Select your preferred time slot"}
            {currentStep === 3 && "Enter meeting information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Room Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {meetingRooms.map((room) => (
                <div
                  key={room.id}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-colors",
                    selectedRoom === room.id
                      ? "border-blue-500 bg-blue-50"
                      : room.available
                        ? "border-gray-200 hover:border-gray-300"
                        : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60",
                  )}
                  onClick={() => room.available && setSelectedRoom(room.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <Badge variant={room.available ? "default" : "secondary"}>
                      {room.available ? "Available" : "Occupied"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity} people</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{room.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Time Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Today - {new Date().toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      "p-3 rounded-lg border text-sm font-medium transition-colors",
                      selectedTime === slot.time
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : slot.available
                          ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      {slot.time}
                    </div>
                    {!slot.available && <div className="text-xs mt-1">Booked</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Meeting Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Room</div>
                  <div className="font-medium">{meetingRooms.find((room) => room.id === selectedRoom)?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Time</div>
                  <div className="font-medium">{selectedTime}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meeting description (optional)"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          Back
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleBookMeeting} disabled={!canProceed()} className="bg-green-600 hover:bg-green-700">
            Book Meeting
          </Button>
        )}
      </div>
    </div>
  )
}
