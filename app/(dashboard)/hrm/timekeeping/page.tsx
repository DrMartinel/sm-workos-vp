"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Plane, Clock, Edit3, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/store/hooks/useAuth"
import { useToast } from "@/app/shared-ui/components/ui/use-toast"
import { createClient } from "@/lib/utils/supabase/client"
import dataURLtoBlob from "./utils/dataURLtoBlob"
import TimekeepingLoading from "./loading"
import { HrmRequestsApi, type HrmRequest } from "../../../shared-ui/lib/utils/supabase/hrm-requests"
import { TimekeepingApi, type TimekeepingRecord } from "../../../shared-ui/lib/utils/supabase/timekeeping"

// Import components
import AttendanceStatusBanner from "./components/AttendanceStatusBanner"
import MonthlySummary from "./components/MonthlySummary"
import Calendar from "./components/Calendar"
import RequestHistory from "./components/RequestHistory"
import CheckInFlow from "./components/CheckInFlow"
import CheckOutFlow from "./components/CheckOutFlow"
import { 
  RequestDetailDialog, 
  AttendanceDetailDialog, 
  CreateRequestDialog, 
  EditRequestDialog 
} from "./components/Dialogs"

// Import utilities
import { 
  getMonthlySummary, 
  checkLocation as checkLocationUtil,
  classifyTimekeeping,
  formatTimeFromTimestamp
} from "./utils/timekeepingUtils"

const requestTypes = [
  { value: "leave-paid", label: "Leave Paid", icon: Plane },
  { value: "leave-unpaid", label: "Leave Unpaid", icon: Plane },
  { value: "ot", label: "OT", icon: Clock },
  { value: "go-out", label: "Go Out", icon: FileText },
  { value: "work-from-home", label: "Work From Home", icon: FileText },
  { value: "time-edit", label: "Time Edit", icon: Edit3 },
]

export default function TimekeepingPage() {
  // Timekeeping states
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [locationStatus, setLocationStatus] = useState<"checking" | "approved" | "denied" | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isCheckedOut, setIsCheckedOut] = useState(false)
  const [loading, setLoading] = useState(true)
  const [todayTimekeeping, setTodayTimekeeping] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<"main" | "checkin" | "checkout">("main")

  // Request module states
  const [activeTab, setActiveTab] = useState<"calendar" | "history">("calendar")
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
  const [calendarData, setCalendarData] = useState<Record<string, any>>({})
  const [viewMode, setViewMode] = useState("all")
  const [isCalendarLoading, setIsCalendarLoading] = useState(false)
  const [calendarWithRequests, setCalendarWithRequests] = useState<Record<string, any>>({})

  const [requests, setRequests] = useState<any[]>([])
  const [requestRefreshTrigger, setRequestRefreshTrigger] = useState(0)

  // Map DB record to UI shape expected by RequestHistory and dialogs
  const getTypeIcon = (t: string) => {
    const key = t.toLowerCase()
    if (key.includes("leave") && key.includes("unpaid")) return Plane
    if (key.includes("leave")) return Plane
    if (key === "ot" || key.includes("ot")) return Clock
    if (key.includes("time") && key.includes("edit")) return Edit3
    return FileText
  }
  const mapRequest = (r: HrmRequest) => ({
    id: r.id,
    type: r.type, // keep label like "OT", "Leave Paid"
    icon: getTypeIcon(r.type),
    description: r.description,
    startDate: r.start_date,
    endDate: r.end_date,
    submittedDate: r.created_at?.slice(0,10),
    status: r.status,
    checkIn: r.start_time ?? "",
    checkOut: r.end_time ?? "",
    otHours: r.ot_hours ?? 0,
  })

  useEffect(() => {
    const loadRequests = async () => {
      try {
        // Clear requests first to prevent any stale data
        setRequests([])
        const list = await HrmRequestsApi.list()
        console.log('Loaded requests:', list.length, list.map(r => ({ id: r.id, type: r.type, date: r.start_date })))
        
        // Check for duplicate IDs
        const ids = list.map(r => r.id)
        const uniqueIds = new Set(ids)
        if (ids.length !== uniqueIds.size) {
          console.warn('Duplicate request IDs found:', ids.filter((id, index) => ids.indexOf(id) !== index))
        }
        
        setRequests(list.map(mapRequest))
      } catch (e) {
        console.error('Error loading requests:', e)
      }
    }
    loadRequests()
  }, [requestRefreshTrigger])
 
  // Build monthly calendar from real data
  useEffect(() => {
    const loadMonth = async () => {
      setIsCalendarLoading(true)
      try {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        const startStr = start.toISOString().slice(0,10)
        const endStr = end.toISOString().slice(0,10)
        const rows = await TimekeepingApi.inRange(startStr, endStr)
        const byDate = new Map<string, TimekeepingRecord>()
        rows.forEach((r: TimekeepingRecord) => byDate.set(r.date, r))
        const map: any = {}
        const cursor = new Date(start)
        while (cursor <= end) {
          const y = cursor.getFullYear()
          const m = String(cursor.getMonth()+1).padStart(2,"0")
          const d = String(cursor.getDate()).padStart(2,"0")
          const key = `${y}-${m}-${d}`
          const weekday = cursor.getDay()
          const rec = byDate.get(key)
          if (rec) {
            const inTime = formatTimeFromTimestamp(rec.check_in_time)
            const outTime = formatTimeFromTimestamp(rec.check_out_time)
            let isLate: boolean | undefined = undefined
            if (inTime) { 
              const cls = classifyTimekeeping(inTime);
              isLate = cls.isLate;
            }
            map[key] = { isLate, checkIn: inTime, checkOut: outTime }
          } else {
            if (weekday === 0 || weekday === 6) map[key] = { type: "weekend", label: "Weekend" }
            else map[key] = { type: "no-checkin", label: "No Check-in", allowRequest: true }
          }
          cursor.setDate(cursor.getDate()+1)
        }
        setCalendarData(map)
      } catch (e) {
        // keep existing calendar data on failure; avoid Next error overlay
        console.warn("loadMonth failed", e)
      } finally {
        setIsCalendarLoading(false)
      }
    }
    loadMonth()
  }, [currentDate, isCheckedIn, isCheckedOut])

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
  
  useEffect(() => {
    if (isCameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  useEffect(() => {
    const fetchTimekeeping = async () => {
      setLoading(true);
      try {
        const rec = await TimekeepingApi.today()
        if (rec) {
          setTodayTimekeeping(rec);
          setIsCheckedIn(true);
          setIsCheckedOut(!!rec.check_out_time);
          setCheckInTime(rec.check_in_time ? new Date(rec.check_in_time) : null);
        } else {
        setTodayTimekeeping(null);
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTime(null);
        }
      } catch (error) {
        console.error(error);
        setTodayTimekeeping(null);
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTime(null);
      }
      setLoading(false);
    };
    fetchTimekeeping();
  }, [isCheckedIn, isCheckedOut]);
  
  useEffect(() => {
    if (currentPage === "checkin" && !isCheckedIn) {
      setCurrentStep(1);
    }
  }, [currentPage, isCheckedIn]);

  // Check-in/Check-out handlers
  const handleCheckIn = () => {
    setCurrentPage("checkin")
  }

  const handleCheckOut = async () => {
    if (!todayTimekeeping || !todayTimekeeping.id) {
      toast({
        title: "Lỗi dữ liệu",
        description: "Không tìm thấy bản ghi chấm công ngày hôm nay.",
        variant: "destructive",
      })
      return;
    }

    const locationResult = await checkLocationUtil();
    
    if (locationResult !== "approved") {
      toast({
        title: "Vị trí không hợp lệ",
        description: "Vị trí của bạn không hợp lệ để chấm công ra ca. Vui lòng đảm bảo bạn đang ở văn phòng.",
        variant: "destructive",
      })
      return;
    }

    setIsCheckingOut(true)

    const now = new Date()
    try {
      await TimekeepingApi.checkOut(todayTimekeeping.id)
      setIsCheckedOut(true)
    } catch (error: any) {
      toast({
        title: "Lỗi chấm công",
        description: "Chấm công ra ca thất bại: " + (error as any).message || JSON.stringify(error),
        variant: "destructive",
      })
      return;
    }

    toast({
      title: "Chấm công thành công",
      description: "Chấm công ra ca thành công!",
    })
    setIsCheckingOut(false)
    setCurrentPage("main")
      
    // Update calendar with check-out time
    if (checkInTime) {
      updateCalendarWithCheckIn(checkInTime, now)
    }
  }

  // Check-in flow handlers
  const handleCheckLocation = async (): Promise<"approved" | "denied"> => {
    setLocationStatus("checking")
    const result = await checkLocationUtil()
    setLocationStatus(result)
    return result
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
      toast({
        title: "Lỗi truy cập camera",
        description: "Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.",
        variant: "destructive",
      })
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
    
    setCalendarData((prev: Record<string, any>) => ({
      ...prev,
      [dateStr]: {
        type: "on-time",
        checkIn: checkInTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        checkOut: checkOutTime ? checkOutTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : undefined,
        label: "On Time"
      }
    }))
  }

  const handleComplete = async () => {
        const supabase = createClient();

    if (!user) {
      toast({
        title: "Lỗi xác thực",
        description: "Người dùng chưa xác thực",
        variant: "destructive",
      })
      return;
    }

    let photoPath = null;
    if (capturedImage) {
      const fileName = `${user.id}_${Date.now()}.png`;
      const filePath = `timekeeping/images/${fileName}`;
      const fileBlob = dataURLtoBlob(capturedImage);

      const { error: uploadError } = await supabase.storage
        .from("hrm")
        .upload(filePath, fileBlob, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        toast({
          title: "Lỗi tải lên",
          description: "Tải lên hình ảnh thất bại: " + uploadError.message,
          variant: "destructive",
        })
        return;
      }

      photoPath = filePath;
    }

    try {
      await TimekeepingApi.checkIn({
      latitude: userLatitude.current,
      longitude: userLongitude.current,
        photo_url: photoPath,
      })
    } catch (error: any) {
      toast({
        title: "Lỗi lưu dữ liệu",
        description: "Lưu dữ liệu chấm công thất bại: " + (error as any).message || JSON.stringify(error),
        variant: "destructive",
      })
      return;
    }

    toast({
      title: "Chấm công thành công",
      description: "Chấm công vào ca thành công!",
    })
    setIsCheckedIn(true);
    setIsCheckedOut(false);
    setCapturedImage(null);

    const now = new Date()
    setCheckInTime(now)
    setCurrentPage("main")
    
    updateCalendarWithCheckIn(now)
  }

  // Request module handlers
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.type) errors.type = "Request type is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    const typeLabel = requestTypes.find(t => t.value === formData.type)?.label || formData.type
    try {
      if (editingRequest?.id) {
        await HrmRequestsApi.update(editingRequest.id, {
          type: typeLabel,
        description: formData.description,
          start_date: selectedDay?.date,
          end_date: selectedDay?.date,
          start_time: formData.startTime || null,
          end_time: formData.endTime || null,
          ot_hours: typeLabel === "OT" ? (editingRequest.otHours ?? 0) : 0,
        })
        setIsEditModalOpen(false)
        setEditingRequest(null)
        setRequestRefreshTrigger(prev => prev + 1)
      } else {
        await HrmRequestsApi.create({
          type: typeLabel,
          description: formData.description,
          start_date: selectedDay?.date,
          end_date: selectedDay?.date,
          start_time: formData.startTime || null,
          end_time: formData.endTime || null,
          ot_hours: typeLabel === "OT" ? 0 : 0,
        })
        setIsCreateModalOpen(false)
      }
      // Trigger request refresh
      setRequestRefreshTrigger(prev => prev + 1)
      setFormData({ type: "", description: "", startDate: "", endDate: "", startTime: "", endTime: "" })
      setFormErrors({})
      setSelectedDay(null)
      setActiveTab("history")
    } catch (e: any) {
      toast({ title: "Request error", description: e?.message || "Failed to save request", variant: "destructive" })
    }
  }

  const handleDayClick = (dayData: any, dateStr: string) => {
    if (dayData) {
      let modifiedDayData = { ...dayData, date: dateStr };
      
      // Thêm logic để tính toán loại Late cụ thể cho dialog
      if (dayData.mainStatus === "late" && dayData.checkIn) {
        const [hour, minute] = dayData.checkIn.split(':').map(Number);
        const checkInMinutes = hour * 60 + minute;
        const lateThreshold10m = 9 * 60 + 10;
        const lateThreshold30m = 9 * 60 + 30;

        if (checkInMinutes > lateThreshold30m) {
          modifiedDayData.lateType = "Late >30m";
        } else if (checkInMinutes > lateThreshold10m) {
          modifiedDayData.lateType = "Late 30m";
        } else {
          modifiedDayData.lateType = "Late 10m";
        }
      }

      setSelectedDay(modifiedDayData);
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
      type: request.type.toLowerCase().replace(" ", "-"),
      description: request.description,
      startDate: "",
      endDate: "",
      startTime: request.checkIn || "",
      endTime: request.checkOut || "",
    })
    setIsEditModalOpen(true)
  }

  const handleOpenCreateRequest = () => {
    setIsAttendanceDetailOpen(false);
    setIsCreateModalOpen(true);
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

  const [monthlySummary, setMonthlySummary] = useState({
    totalHours: 0,
    otHours: 0,
    efficiency: 0,
    totalPenalty: 0
  })

  // Map requests to calendar days - only show on start date
  const mapRequestsToCalendar = (calendarData: Record<string, any>, requests: any[]) => {
    const calendarWithRequests = { ...calendarData }
    
    // Clear all existing requests first
    Object.keys(calendarWithRequests).forEach(dateKey => {
      if (calendarWithRequests[dateKey]) {
        calendarWithRequests[dateKey].requests = []
      }
    })
    
    requests.forEach(request => {
      const startDate = new Date(request.startDate)
      const dateKey = startDate.toISOString().slice(0, 10)
      
      // Only show request on its start date
      if (calendarWithRequests[dateKey]) {
        calendarWithRequests[dateKey].requests = calendarWithRequests[dateKey].requests || []
        calendarWithRequests[dateKey].requests.push({
          id: request.id,
          type: request.type,
          status: request.status,
          description: request.description
        })
      }
    })
    
    return calendarWithRequests
  }

  // Merge calendar data with requests
  useEffect(() => {
    const merged = mapRequestsToCalendar(calendarData, requests)
    setCalendarWithRequests(merged)
  }, [calendarData, requests])

  // Calculate monthly summary when calendar data or requests change
  useEffect(() => {
    const summary = getMonthlySummary(currentDate, calendarData, requests)
    setMonthlySummary(summary)
  }, [currentDate, calendarData, requests])

  if (loading) {
    return <TimekeepingLoading />
  }

  // Check-in Page
  if (currentPage === "checkin") {
    return (
      <CheckInFlow
        currentStep={currentStep}
        locationStatus={locationStatus}
        capturedImage={capturedImage}
        currentTime={currentTimeString}
        currentDate={currentDateString}
        isCameraActive={isCameraActive}
        onCheckLocation={handleCheckLocation}
        onStartCamera={startCamera}
        onCapturePhoto={capturePhoto}
        onComplete={handleComplete}
        onBack={() => setCurrentPage("main")}
        onLocationRetry={() => setLocationStatus(null)}
        onNextStep={() => setCurrentStep(2)}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
    )
  }

  // Check-out Page
  if (currentPage === "checkout") {
    return (
      <CheckOutFlow
        checkInTime={checkInTime}
        currentTime={currentTime}
        locationStatus={locationStatus}
        onBack={() => setCurrentPage("main")}
        onCheckLocationAndCheckout={async () => {
          const locationResult = await handleCheckLocation();
                    if (locationResult === "approved") {
                      setTimeout(() => {
                        handleCheckOut();
                      }, 1000);
                    }
                  }}
      />
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

        {/* Attendance Status Banner */}
        <AttendanceStatusBanner
          isCheckedIn={isCheckedIn}
          isCheckedOut={isCheckedOut}
          checkInTime={checkInTime}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />

          {/* Tabs for Calendar and Request History */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "history")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="calendar" 
                className="font-bold text-base data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
            >
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
                className="font-bold text-base data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
            >
              Request History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
              {/* Monthly Summary Card */}
              <MonthlySummary
                currentDate={currentDate}
                monthlySummary={monthlySummary}
              />

            {/* Calendar Card */}
              <Calendar
                currentDate={currentDate}
                calendarData={calendarWithRequests}
                viewMode={viewMode}
                calendarFilter={calendarFilter}
                isLoading={isCalendarLoading}
                onNavigateMonth={navigateMonth}
                onViewModeChange={setViewMode}
                onCalendarFilterChange={setCalendarFilter}
                onDayClick={handleDayClick}
              />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
              <RequestHistory
                requests={requests}
                searchKeyword={searchKeyword}
                filterType={filterType}
                filterStatus={filterStatus}
                onSearchChange={setSearchKeyword}
                onFilterTypeChange={setFilterType}
                onFilterStatusChange={setFilterStatus}
                onRequestClick={handleRequestClick}
              />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <RequestDetailDialog
          isOpen={isRequestDetailOpen}
          onOpenChange={setIsRequestDetailOpen}
          request={selectedRequest}
          onEdit={handleEditRequest}
        />
        
        <AttendanceDetailDialog
          isOpen={isAttendanceDetailOpen}
          onOpenChange={setIsAttendanceDetailOpen}
          selectedDay={selectedDay}
          onCreateRequest={handleOpenCreateRequest}
        />

        <CreateRequestDialog
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          selectedDay={selectedDay}
          formData={formData}
          formErrors={formErrors}
          onFormDataChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleSubmit}
        />

        <EditRequestDialog
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          formData={formData}
          formErrors={formErrors}
          onFormDataChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
