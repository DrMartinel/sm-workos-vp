"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { MapPin, Camera, Check, ArrowRight, AlertCircle, CheckCircle, Clock, LogOut, X, Calendar, FileText, Plus, ChevronLeft, ChevronRight, Briefcase, Home, Plane, Edit3, Search, Filter, Coins } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import TimekeepingLoading from "./loading"

const generateCalendarData = () => {
  const data: Record<string, any> = {}

  const buildLabel = (base: string, goOut?: boolean) =>
    goOut ? `${base} + Go Out` : base

  const startDate = new Date(2025, 6, 1) // 1/7/2025
  const endDate = new Date(2025, 7, 8)   // 8/8/2025

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const day = date.getDate()
    const dayOfWeek = date.getDay()
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      data[dateStr] = { type: "weekend", label: "Weekend" }
    } else if (day % 10 === 0) {
      data[dateStr] = { type: "paid-leave", label: "Leave Paid" }
    } else if (day % 15 === 0) {
      data[dateStr] = { type: "unpaid-leave", label: "Leave Unpaid" }
    } else if (day % 9 === 0) {
      data[dateStr] = { type: "no-checkin", label: "No Check-in" }
    } else {
      const seed = day % 10
      // Random goOut for on-time or late with ~30% chance
      const goOut = [2, 4, 7].includes(seed)

      if (seed >= 5) {
        data[dateStr] = {
          type: "on-time",
          checkIn: "08:01",
          checkOut: "17:05",
          label: buildLabel("On Time", goOut),
          mainStatus: "on-time",
          ...(goOut && { goOut: true })
        }
      } else if (seed === 3) {
        data[dateStr] = {
          type: "work-online",
          label: "Work Online",
          checkIn: "08:00",
          checkOut: "17:00"
        }
      } else if (seed === 2) {
        data[dateStr] = {
          type: "late-1-10",
          checkIn: "08:08",
          checkOut: "17:15",
          label: buildLabel("Late 1-10min", goOut),
          mainStatus: "late",
          ...(goOut && { goOut: true })
        }
      } else if (seed === 1) {
        data[dateStr] = {
          type: "late-10-30",
          checkIn: "08:25",
          checkOut: "17:30",
          label: buildLabel("Late 10-30min", goOut),
          mainStatus: "late",
          ...(goOut && { goOut: true })
        }
      } else {
        data[dateStr] = {
          type: "late-over-30",
          checkIn: "09:15",
          checkOut: "18:00",
          label: buildLabel("Late > 30min", goOut),
          mainStatus: "late",
          ...(goOut && { goOut: true })
        }
      }
    }
  }

  // add fallback for every day of the current month
  const now = new Date()
  const fallbackMonth = now.getMonth()
  const fallbackYear = now.getFullYear()
  const daysInFallbackMonth = new Date(fallbackYear, fallbackMonth + 1, 0).getDate()

  for (let day = 1; day <= daysInFallbackMonth; day++) {
    const date = new Date(fallbackYear, fallbackMonth, day)
    const dateStr = `${fallbackYear}-${String(fallbackMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    if (!data[dateStr]) {
      data[dateStr] = {
        type: "not-generated",
        label: "Chưa có dữ liệu",
        allowRequest: true
      }
    }
  }

  return data
}

const requestTypes = [
  { value: "leave-paid", label: "Leave Paid", icon: Plane },
  { value: "leave-unpaid", label: "Leave Unpaid", icon: Plane },
  { value: "ot", label: "OT", icon: Clock },
  { value: "go-out", label: "Go Out", icon: Briefcase },
  { value: "work-from-home", label: "Work From Home", icon: Home },
  { value: "time-edit", label: "Time Edit", icon: Edit3 },
]

export default function TimekeepingPage() {
  // Timekeeping states
  const [currentStep, setCurrentStep] = useState(0)
  const [locationStatus, setLocationStatus] = useState<"checking" | "approved" | "denied" | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isCheckedOut, setIsCheckedOut] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCheckInFlow, setShowCheckInFlow] = useState(false)
  const [currentPage, setCurrentPage] = useState<"main" | "checkin" | "checkout">("main")

  // Request module states
  const [activeTab, setActiveTab] = useState<"calendar" | "history">("calendar") // New state for tabs
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAttendanceDetailOpen, setIsAttendanceDetailOpen] = useState(false)
  const [isRequestDetailOpen, setIsRequestDetailOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [editingRequest, setEditingRequest] = useState<any>(null)
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [searchKeyword, setSearchKeyword] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [calendarFilter, setCalendarFilter] = useState("all")
  const [calendarData, setCalendarData] = useState(() => generateCalendarData())
  const [viewMode, setViewMode] = useState("all")
  const [focusedDay, setFocusedDay] = useState<{day: number, data: any} | null>(null)

  const [mockRequests, setMockRequests] = useState([
    {
      id: 1,
      type: "Leave Paid",
      icon: Plane,
      description: "Annual vacation",
      startDate: "2024-02-15",
      endDate: "2024-02-20",
      submittedDate: "2024-01-20",
      status: "approved",
      checkIn: "",
      checkOut: "",
    },
    {
      id: 2,
      type: "OT",
      icon: Clock,
      description: "Project deadline work",
      startDate: "2024-01-25",
      endDate: "2024-01-25",
      submittedDate: "2024-01-24",
      status: "approved",
      otHours: 3,
      checkIn: "",
      checkOut: "",
    },
    {
      id: 3,
      type: "Work From Home",
      icon: Home,
      description: "Remote work day",
      startDate: "2024-01-30",
      endDate: "2024-01-30",
      submittedDate: "2024-01-28",
      status: "rejected",
      checkIn: "",
      checkOut: "",
    },
    {
      id: 4,
      type: "Go Out",
      icon: Briefcase,
      description: "Client meeting",
      startDate: "2024-02-05",
      endDate: "2024-02-05",
      submittedDate: "2024-02-03",
      status: "approved",
      checkIn: "",
      checkOut: "",
    },
    {
      id: 5,
      type: "Time Edit",
      icon: Edit3,
      description: "Forgot to check out",
      startDate: "2024-01-22",
      endDate: "2024-01-22",
      submittedDate: "2024-01-23",
      status: "pending",
      checkIn: "08:00",
      checkOut: "17:00",
    },
  ])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const userLatitude = useRef<number | null>(null)
  const userLongitude = useRef<number | null>(null)

  const currentTimeString = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const currentDateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  // Calculate statistics
  const getStatistics = () => {
    const stats = {
      "late-1-10": { count: 0, amount: 0 },
      "late-10-30": { count: 0, amount: 0 },
      "late-over-30": { count: 0, amount: 0 },
      "unpaid-leave": { count: 0, amount: 0 },
      weekend: { count: 0, amount: 0 },
      "go-out-over-30": { count: 0, amount: 0 },
      "paid-leave": { count: 0, amount: 0 },
      "work-online": { count: 0, amount: 0 },
      "on-time": { count: 0, amount: 0 },
      "no-checkin": { count: 0, amount: 0 },
    }

    Object.values(calendarData).forEach((dayData: any) => {
      if (stats[dayData.type as keyof typeof stats]) {
        stats[dayData.type as keyof typeof stats].count++
        // Mock penalty amounts
        if (dayData.type === "late-1-10") stats[dayData.type as keyof typeof stats].amount += 50000
        if (dayData.type === "late-10-30") stats[dayData.type as keyof typeof stats].amount += 100000
        if (dayData.type === "late-over-30") stats[dayData.type as keyof typeof stats].amount += 200000
      }
    })

    return stats
  }

  // Calculate monthly summary statistics
  const getMonthlySummary = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const stats = getStatistics()
    
    // Calculate weekdays in month
    let weekdays = 0
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayOfWeek = date.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        weekdays++
      }
    }

    // Total attendance hours (8 hours per weekday)
    const totalAttendanceHours = weekdays * 8

    // Calculate actual working hours from calendar data
    let actualWorkingHours = 0
    let onlineWorkHours = 0
    let goOutOver30Hours = 0

    Object.values(calendarData).forEach((dayData: any) => {
      if (dayData.checkIn && dayData.checkOut) {
        const [inHour, inMinute] = dayData.checkIn.split(":").map(Number)
        const [outHour, outMinute] = dayData.checkOut.split(":").map(Number)
        const inTime = inHour * 60 + inMinute
        const outTime = outHour * 60 + outMinute
        const totalMinutes = outTime - inTime
        const hours = totalMinutes / 60
        actualWorkingHours += hours
      } else if (dayData.type === "work-online") {
        onlineWorkHours += 8 // Assume 8 hours for online work
        actualWorkingHours += 8
      } else if (dayData.type === "go-out-over-30") {
        goOutOver30Hours += 0.5 // 30 minutes
        actualWorkingHours += 7.5 // 8 - 0.5
      } else if (dayData.type === "paid-leave") {
        actualWorkingHours += 8 // Paid leave counts as working hours
      }
    })

    // Calculate OT hours from approved requests
    const otHours = mockRequests
      .filter(req => req.type === "OT" && req.status === "approved")
      .reduce((total, req) => total + (req.otHours || 0), 0)

    // Happy hours (mock calculation - could be based on events, team activities, etc.)
    const happyHours = 12 // Mock value

    // Total hours including OT and happy hours
    const totalHours = actualWorkingHours + otHours + happyHours

    // Efficiency
    const efficiency = totalAttendanceHours > 0 ? (totalHours / totalAttendanceHours) * 100 : 0

    // Total penalty amount
    const totalPenalty = stats["late-1-10"].amount + stats["late-10-30"].amount + stats["late-over-30"].amount

    return {
      totalAttendanceHours: Math.round(totalAttendanceHours),
      otHours: Math.round(otHours),
      happyHours: Math.round(happyHours),
      onlineWorkHours: Math.round(onlineWorkHours),
      goOutOver30Hours: Math.round(goOutOver30Hours * 10) / 10, // Round to 1 decimal
      totalHours: Math.round(totalHours),
      efficiency: Math.round(efficiency * 10) / 10, // Round to 1 decimal
      totalPenalty
    }
  }

  const checkLocation = async (): Promise<"approved" | "denied"> => {
    setLocationStatus("checking")

    if (!navigator.geolocation) {
      setTimeout(() => {
        setLocationStatus("denied")
      }, 1000)
      return "denied"
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          userLatitude.current = userLat
          const userLng = position.coords.longitude
          userLongitude.current = userLng
          const officeLat = 21.018405
          const officeLng = 105.809683

          // Haversine formula to calculate distance in meters
          function toRad(x: number) {
            return (x * Math.PI) / 180
          }
          const R = 6371000 // meters
          const dLat = toRad(officeLat - userLat)
          const dLon = toRad(officeLng - userLng)
          const lat1 = toRad(userLat)
          const lat2 = toRad(officeLat)

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distance = R * c

          if (distance <= 1000000) {
            setLocationStatus("approved")
            resolve("approved")
          } else {
            setLocationStatus("denied")
            resolve("denied")
          }
        },
        (error) => {
          setLocationStatus("denied")
          resolve("denied")
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      setCameraStream(stream)
      setIsCameraActive(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Cannot access camera. Please check permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/png")
        setCapturedImage(imageData)

        // Stop camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop())
          setCameraStream(null)
          setIsCameraActive(false)
        }

        setCurrentStep(3)
      }
    }
  }

  const updateCalendarWithCheckIn = (checkInTime: Date, checkOutTime?: Date) => {
    const dateStr = `${checkInTime.getFullYear()}-${String(checkInTime.getMonth() + 1).padStart(2, "0")}-${String(checkInTime.getDate()).padStart(2, "0")}`
    
    setCalendarData(prev => ({
      ...prev,
      [dateStr]: {
        type: "on-time", // You can add logic to determine if late
        checkIn: checkInTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        checkOut: checkOutTime ? checkOutTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : undefined,
        label: "On Time" // You can add logic to determine actual status
      }
    }))
  }

  const handleComplete = async () => {
    const now = new Date()
    alert("Check-in successful!")
    setIsCheckedIn(true)
    setCheckInTime(now)
    setIsCheckedOut(false)
    setCurrentPage("main")
    
    // Update calendar with actual check-in data
    updateCalendarWithCheckIn(now)
  }

  const handleCheckOut = async () => {
    setIsCheckingOut(true)

    // Mock implementation - không cần check location nữa
    setTimeout(() => {
      const now = new Date()
      setIsCheckedOut(true)
      setIsCheckingOut(false)
      setCurrentPage("main")
      alert("Check-out successful!")
      
      // Update calendar with check-out time
      if (checkInTime) {
        updateCalendarWithCheckIn(checkInTime, now)
      }
    }, 1000)
  }

  // Request module functions
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.type) errors.type = "Request type is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const commonRequestData = {
        type: requestTypes.find(t => t.value === formData.type)?.label || formData.type,
        icon: requestTypes.find(t => t.value === formData.type)?.icon || FileText,
        description: formData.description,
        startDate: selectedDay.date,
        endDate: selectedDay.date,
        submittedDate: new Date().toISOString().split('T')[0],
        status: "pending",
        checkIn: formData.startTime,
        checkOut: formData.endTime,
        otHours: 0,
      }
      if (editingRequest) {
        // Update existing request
        setMockRequests(prev => prev.map(req => 
          req.id === editingRequest.id ? { ...req, ...commonRequestData } : req
        ))
        setEditingRequest(null)
        setIsEditModalOpen(false)
      } else {
        // Create new request
        const newRequest = {
          id: mockRequests.length + 1,
          ...commonRequestData
        }
        setMockRequests(prev => [newRequest, ...prev])
        setIsCreateModalOpen(false)
      }
      
      console.log("Form submitted:", formData)
      setFormData({
        type: "",
        description: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
      })
      setFormErrors({})
      setSelectedDay(null)
      
      // Switch to request history after creating/editing request
      setActiveTab("history") // Switch to history tab after submission
    }
  }

  const handleDayClick = (dayData: any, dateStr: string) => {
    if (dayData) {
      setSelectedDay({...dayData, date: dateStr});
      setIsAttendanceDetailOpen(true);
    }
  }

  const handleRequestClick = (request: any) => {
    setSelectedRequest(request)
    setIsRequestDetailOpen(true)
  }

   const handleEditRequest = (request: any) => {
    setEditingRequest(request)
    setFormData({
      type: request.type.toLowerCase().replace(" ", "-"), // Convert "Leave Paid" to "leave-paid"
      description: request.description,
      startDate: "",
      endDate: "",
      startTime: request.checkIn || "", // Pre-populate start time
      endTime: request.checkOut || "", // Pre-populate end time
    })
    setIsEditModalOpen(true)
  }

  const handleOpenCreateRequest = () => {
    setIsAttendanceDetailOpen(false);
    setIsCreateModalOpen(true);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "approved":
        return <Check className="h-4 w-4 text-green-600" />
      case "rejected":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayData = calendarData[dateStr]
      const isWeekend = dayData?.type === "weekend"

      // View mode filtering
      const shouldShowByViewMode = viewMode === "all" || 
        (viewMode === "working" && !isWeekend) ||
        (viewMode === "weekends" && isWeekend)

      // Category filtering
      const shouldShowByCategory = calendarFilter === "all" || 
        (calendarFilter === "late" && (dayData?.type?.includes("late") || dayData?.mainStatus === "late")) ||
        (calendarFilter === "on-time" && (dayData?.type === "on-time" || dayData?.mainStatus === "on-time")) ||
        (calendarFilter === "leave" && (dayData?.type === "paid-leave" || dayData?.type === "unpaid-leave")) ||
        (calendarFilter === "work-online" && dayData?.type === "work-online") ||
        (calendarFilter === "go-out" && dayData?.goOut) ||
        (calendarFilter === "no-checkin" && dayData?.type === "no-checkin")

      const shouldShow = shouldShowByViewMode && shouldShowByCategory

      let cardBgColor = "bg-white border-gray-300"
      let textColor = "text-gray-800"

      const isGreyStatus = ["weekend", "paid-leave", "unpaid-leave", "no-checkin", "work-online"].includes(dayData?.type)
      const hasMainStatus = dayData?.mainStatus
      
      if (hasMainStatus === "late") {
        cardBgColor = "bg-red-50 border-red-300"
        textColor = "text-red-700"
      } else if (hasMainStatus === "on-time") {
        cardBgColor = "bg-green-50 border-green-300"
        textColor = "text-green-700"
      } else if (isGreyStatus) {
        cardBgColor = "bg-gray-100 border-gray-300"
        textColor = "text-gray-400"
      }

      days.push(
        <div
          key={day}
          className={cn(
            "aspect-square h-28 p-2 text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer",
            shouldShow ? cardBgColor : "bg-gray-50 border border-gray-100 text-gray-300",
            "flex flex-col items-start justify-between",
            shouldShow ? "opacity-100" : "opacity-30"
          )}
          onClick={() => shouldShow && handleDayClick(dayData, dateStr)}
        >
          <div className={cn("font-semibold text-sm", textColor)}>{day}</div>
          
          {hasMainStatus && (
            <div className="flex flex-col items-center w-full">
              <div className={cn("font-semibold text-xs w-full text-center", textColor)}>
                {hasMainStatus === "on-time" && "On Time"}
                {hasMainStatus === "late" && "Late"}
              </div>
              {dayData.goOut && (
                <div className="flex items-center px-1 py-0.5 mt-1 rounded-full bg-purple-200 text-[10px] text-purple-800 font-medium w-full justify-center">
                  <Clock className="h-2 w-2 mr-1" />
                  Go Out 
                </div>
              )}
              {dayData.checkIn && (
                <div className="text-gray-600 text-[10px] mt-1 w-full text-center">In: {dayData.checkIn}</div>
              )}
              {dayData.checkOut && (
                <div className="text-gray-600 text-[10px] w-full text-center">Out: {dayData.checkOut}</div>
              )}
            </div>
          )}
          {/* Để đảm bảo chiều cao đồng nhất cho cả những thẻ không có dữ liệu mainStatus */}
          {!hasMainStatus && (
              <div className="flex flex-col items-center w-full h-full"></div>
          )}
        </div>,
      )
    }

    return days
  }

  const filteredRequests = mockRequests.filter((request) => {
    const matchesKeyword =
      searchKeyword === "" ||
      request.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      request.type.toLowerCase().includes(searchKeyword.toLowerCase())

    const matchesType = filterType === "all" || request.type.toLowerCase().includes(filterType.toLowerCase())
    const matchesStatus = filterStatus === "all" || request.status === filterStatus

    return matchesKeyword && matchesType && matchesStatus
  })

  const statistics = getStatistics()
  const monthlySummary = getMonthlySummary()

  const steps = [
    { number: 1, title: "Check Location", icon: MapPin },
    { number: 2, title: "Take Photo", icon: Camera },
    { number: 3, title: "Confirm", icon: Check },
  ]

  if (loading) {
    return <TimekeepingLoading />
  }

  useEffect(() => {
    if (currentPage === "checkin" && !isCheckedIn) {
      setCurrentStep(1);
    }
  }, [currentPage, isCheckedIn]);

  // Check-in Page
  if (currentPage === "checkin") {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage("main")}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Check-in</h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center w-full">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex items-center flex-1">
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        currentStep === step.number && "border-blue-500 bg-blue-500 text-white",
                        currentStep > step.number && "border-green-500 bg-green-500 text-white",
                        currentStep < step.number && "border-gray-300 bg-white text-gray-400",
                      )}
                    >
                      {currentStep > step.number ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : React.createElement(step.icon, { className: "h-4 w-4 sm:h-5 sm:w-5" })}
                    </div>
                    <span
                      className={cn(
                        "text-xs sm:text-sm mt-2 font-medium text-center",
                        currentStep === step.number && "text-blue-600",
                        currentStep > step.number && "text-green-600",
                        currentStep < step.number && "text-gray-400",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2 sm:mx-4 transition-colors",
                        currentStep > step.number ? "bg-green-500" : "bg-gray-300",
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                {steps[currentStep - 1] && (
                  <>
                    {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
                    Step {currentStep}: {steps[currentStep - 1].title}
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "We need to verify you are within 100m from the office"}
                {currentStep === 2 && "Take a photo to verify your attendance"}
                {currentStep === 3 && "Review and confirm your check-in"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Location Check */}
              {currentStep === 1 && (
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 relative">
                    {locationStatus === "checking" && (
                      <>
                        <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 animate-pulse" />
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </>
                    )}
                    {locationStatus === "approved" && <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />}
                    {locationStatus === "denied" && <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />}
                    {locationStatus === null && <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />}
                  </div>

                  {locationStatus === null && (
                    <Button onClick={checkLocation} className="bg-blue-600 hover:bg-blue-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      Check Location
                    </Button>
                  )}

                  {locationStatus === "checking" && <p className="text-gray-600">Checking your location...</p>}

                  {locationStatus === "approved" && (
                    <div>
                      <h3 className="text-lg font-medium text-green-600 mb-2">Location Approved</h3>
                      <p className="text-gray-600 mb-4">You are within the required range from the office</p>
                      <Button onClick={() => setCurrentStep(2)} className="bg-green-600 hover:bg-green-700">
                        Next Step
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {locationStatus === "denied" && (
                    <div>
                      <h3 className="text-lg font-medium text-red-600 mb-2">Location Too Far</h3>
                      <p className="text-gray-600 mb-4">You need to be within 100 meters from the office to check in</p>
                      <Button
                        onClick={() => setLocationStatus(null)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Take Photo */}
              {currentStep === 2 && (
                <div className="text-center space-y-6">
                  <div>
                    {/* Camera Preview Frame */}
                    <div className="relative mb-4">
                      <div className="w-full max-w-md mx-auto aspect-[4/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {!isCameraActive ? (
                          <div className="text-center">
                            <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Camera preview will appear here</p>
                          </div>
                        ) : (
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        )}
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {!isCameraActive ? (
                      <Button onClick={startCamera} className="bg-purple-600 hover:bg-purple-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <Button onClick={capturePhoto} className="bg-purple-600 hover:bg-purple-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {currentStep === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Confirm Check-in</h3>

                    {capturedImage && (
                      <div className="mb-4">
                        <img
                          src={capturedImage || "/placeholder.svg"}
                          alt="Captured photo"
                          className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-lg border-2 border-gray-300 mx-auto mb-4"
                        />
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-sm text-gray-600 mb-1">Check-in Time</div>
                      <div className="text-lg sm:text-xl font-bold text-gray-900">
                        {currentTimeString}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentDateString}
                      </div>
                    </div>
                    <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 mr-2" />
                      Complete Check-in
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Check-out Page
  if (currentPage === "checkout") {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage("main")}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Check-out</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Ready to Check-out?</CardTitle>
              <CardDescription>You are currently working at the office</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              {/* Check-in Time and Current Time Combined */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Check-in Time</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {checkInTime?.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-600 mb-2">Current Time</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-900">
                      {currentTime.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="text-sm text-gray-600">
                    {checkInTime?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              {checkInTime && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Working Hours Today</div>
                  <div className="text-lg font-bold text-purple-900">
                    {Math.floor((currentTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60))}h{" "}
                    {Math.floor(((currentTime.getTime() - checkInTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                  </div>
                </div>
              )}

              {/* Location Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Location Status</div>
                <div className="flex items-center justify-center gap-2">
                  {locationStatus === "checking" && (
                    <>
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                      <span className="text-blue-600">Checking location...</span>
                    </>
                  )}
                  {locationStatus === "approved" && (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Location Valid</span>
                    </>
                  )}
                  {locationStatus === "denied" && (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Location Invalid</span>
                    </>
                  )}
                  {!locationStatus && (
                    <>
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Location Not Checked</span>
                    </>
                  )}
                </div>
                <Button
                  onClick={async () => {
                    const locationResult = await checkLocation();
                    if (locationResult === "approved") {
                      // Tự động checkout sau khi location approved
                      setTimeout(() => {
                        handleCheckOut();
                      }, 1000);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={locationStatus === "checking"}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Check Location & Check-out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Page
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Timekeeping</h1>
        </div>

        {/* Attendance Status Banner - Smaller and at top */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <div>
                <h3 className="font-semibold text-lg">Attendance Status</h3>
                {!isCheckedIn ? (
                  <p className="text-blue-100 text-sm">You haven't checked in today</p>
                ) : isCheckedIn && !isCheckedOut ? (
                  <p className="text-blue-100 text-sm">
                    Checked in at {checkInTime?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                ) : (
                  <p className="text-blue-100 text-sm">Work day completed</p>
                )}
              </div>
            </div>
            <div>
              {!isCheckedIn ? (
                <Button
                  onClick={() => setCurrentPage("checkin")}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                >
                  Check-in
                </Button>
              ) : isCheckedIn && !isCheckedOut ? (
                <Button
                  onClick={() => setCurrentPage("checkout")}
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
                >
                  Check-out
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Tabs for Calendar and Request History - More visually distinct */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "history")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="calendar" 
              className="font-bold text-base data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
            >
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="font-bold text-base data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
            >
              Request History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
            {/* Monthly Summary Card - Centered with shadow */}
            <Card className="mb-6 shadow-lg border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-800">Monthly Summary</CardTitle>
                <CardDescription className="text-gray-600">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">{monthlySummary.totalAttendanceHours}h</div>
                    <div className="text-sm text-blue-600 font-medium">Total Hours</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="text-2xl font-bold text-green-700">{monthlySummary.otHours}h</div>
                    <div className="text-sm text-green-600 font-medium">OT Hours</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-700">{monthlySummary.efficiency}%</div>
                    <div className="text-sm text-purple-600 font-medium">Efficiency</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="text-2xl font-bold text-red-700">${(monthlySummary.totalPenalty / 25000).toFixed(2)}</div>
                    <div className="text-sm text-red-600 font-medium">Penalty</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="h-5 w-5" />
                      {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={viewMode} onValueChange={setViewMode}>
                      <SelectTrigger className="w-[140px] border-gray-300">
                        <SelectValue placeholder="View" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Days</SelectItem>
                        <SelectItem value="working">Working Days</SelectItem>
                        <SelectItem value="weekends">Weekends Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={calendarFilter} onValueChange={setCalendarFilter}>
                      <SelectTrigger className="w-[140px] border-gray-300">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="late">Late Days</SelectItem>
                        <SelectItem value="on-time">On Time</SelectItem>
                        <SelectItem value="leave">Leave Days</SelectItem>
                        <SelectItem value="work-online">Work Online</SelectItem>
                        <SelectItem value="go-out">Go Out</SelectItem>
                        <SelectItem value="no-checkin">No Check-in</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="border-gray-300">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="border-gray-300">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* Calendar Grid */}
                <div className="mb-4">
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
                </div>

                {/* Categories Legend - Closer to calendar, two columns */}
                <div className="border-t pt-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-50 border border-red-300 rounded-sm"></div>
                      <span>Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-50 border border-green-300 rounded-sm"></div>
                      <span>On Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div>
                      <span>Leave/Weekend/No Check-in</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5" />
                  Request History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {/* Filter Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1 min-w-[120px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="pl-10 border-gray-300"
                      />
                    </div>

                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[100px] sm:w-[180px] border-gray-300">
                        <span className="sm:hidden">Type</span>
                        <span className="hidden sm:inline">
                          <SelectValue placeholder="Request Type" />
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="leave-paid">Leave Paid</SelectItem>
                        <SelectItem value="leave-unpaid">Leave Unpaid</SelectItem>
                        <SelectItem value="ot">OT</SelectItem>
                        <SelectItem value="work from home">Work From Home</SelectItem>
                        <SelectItem value="go out">Go Out</SelectItem>
                        <SelectItem value="time edit">Time Edit</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[100px] sm:w-[140px] border-gray-300">
                        <span className="sm:hidden">Status</span>
                        <span className="hidden sm:inline">
                          <SelectValue placeholder="Status" />
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Request List */}
                <div className="space-y-3">
                  {filteredRequests.map((request) => {
                    const Icon = request.icon
                    return (
                      <div
                        key={request.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md",
                          request.status === "pending" 
                            ? "hover:bg-gray-50 cursor-pointer border-gray-200" 
                            : "cursor-default border-gray-200"
                        )}
                        onClick={() => handleRequestClick(request)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg border border-gray-200">
                            <Icon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.type}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(request.startDate).toLocaleDateString("en-US")} - {new Date(request.endDate).toLocaleDateString("en-US")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                        </div>
                      </div>
                    )
                  })}

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p>No requests found matching your filters.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Detail Dialog */}
        <Dialog open={isRequestDetailOpen} onOpenChange={setIsRequestDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedRequest?.type}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Period:</Label>
                <p className="text-sm">
                  {selectedRequest?.startDate && new Date(selectedRequest.startDate).toLocaleDateString("en-US")} -{" "}
                  {selectedRequest?.endDate && new Date(selectedRequest.endDate).toLocaleDateString("en-US")}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Submitted:</Label>
                <p className="text-sm">
                  {selectedRequest?.submittedDate && new Date(selectedRequest.submittedDate).toLocaleDateString("en-US")}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Status:</Label>
                <div className="mt-1">{selectedRequest && getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Description:</Label>
                <p className="text-sm">{selectedRequest?.description}</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRequestDetailOpen(false)
                  setSelectedRequest(null)
                }}
              >
                Close
              </Button>
              {selectedRequest?.status === "pending" && (
                <Button 
                  onClick={() => {
                    setIsRequestDetailOpen(false)
                    handleEditRequest(selectedRequest)
                  }}
                >
                  Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Attendance Detail Dialog */}
        <Dialog open={isAttendanceDetailOpen} onOpenChange={setIsAttendanceDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Attendance Details</DialogTitle>
              <DialogDescription>
                Details for this day
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Date:</Label>
                <p className="text-sm">
                  {selectedDay?.date && new Date(selectedDay.date).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                </p>
              </div>
              {(selectedDay?.mainStatus === "late" || selectedDay?.mainStatus === "on-time") && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type:</Label>
                  <p className={cn(
                    "text-sm font-bold mt-1",
                    selectedDay.mainStatus === "late" ? "text-red-700" : "text-green-700"
                  )}>
                    {selectedDay.mainStatus === "late" ? "Late" : "On Time"}
                    {selectedDay.goOut && " + Go Out >30min"}
                  </p>
                </div>
              )}
              {selectedDay?.checkIn && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Check-in:</Label>
                  <p className="text-sm">{selectedDay.checkIn}</p>
                </div>
              )}
              {selectedDay?.checkOut && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Check-out:</Label>
                  <p className="text-sm">{selectedDay.checkOut}</p>
                </div>
              )}
              {selectedDay?.type === "work-online" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type:</Label>
                  <p className="text-sm font-bold mt-1">Work Online</p>
                </div>
              )}
              {selectedDay?.type === "paid-leave" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type:</Label>
                  <p className="text-sm font-bold mt-1">Paid Leave</p>
                </div>
              )}
              {selectedDay?.type === "unpaid-leave" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type:</Label>
                  <p className="text-sm font-bold mt-1">Unpaid Leave</p>
                </div>
              )}
              {selectedDay?.type === "no-checkin" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type:</Label>
                  <p className="text-sm font-bold mt-1">No Check-in</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAttendanceDetailOpen(false)
                  setSelectedDay(null)
                }}
              >
                Close
              </Button>
              <Button onClick={handleOpenCreateRequest}>
                Create Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Create Request Dialog */}
<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Create request</DialogTitle>
      <DialogDescription>
        Day: <span className="font-semibold">{selectedDay?.date}</span>
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="type" className="text-right">
            Request Type
          </Label>
          <Select onValueChange={value => setFormData(prev => ({ ...prev, type: value }))} value={formData.type}>
            <SelectTrigger id="type" className="col-span-3">
              <SelectValue placeholder="Select request type" />
            </SelectTrigger>
            <SelectContent>
              {requestTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.type && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.type}</p>}
        </div>
        
        {/* Bỏ trường startDate và endDate ở đây */}
        
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="col-span-3"
          />
          {formErrors.description && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid items-center grid-cols-4 col-span-1 gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid items-center grid-cols-4 col-span-1 gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="col-span-3"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Send</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

{/* Edit Request Dialog */}
<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Request</DialogTitle>
    </DialogHeader>
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="type" className="text-right">
            Request Type
          </Label>
          <Select onValueChange={value => setFormData(prev => ({ ...prev, type: value }))} value={formData.type}>
            <SelectTrigger id="type" className="col-span-3">
              <SelectValue placeholder="Select request type" />
            </SelectTrigger>
            <SelectContent>
              {requestTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.type && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.type}</p>}
        </div>

        {/* Bỏ trường startDate và endDate ở đây */}

        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="col-span-3"
          />
          {formErrors.description && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid items-center grid-cols-4 col-span-1 gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid items-center grid-cols-4 col-span-1 gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="col-span-3"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Update</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

        {/* Edit Request Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Request</DialogTitle>
              <DialogDescription>Update your request details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-type">Request Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={formErrors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {formErrors.type && <p className="text-sm text-red-500 mt-1">{formErrors.type}</p>}
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter request description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingRequest(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Update Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}