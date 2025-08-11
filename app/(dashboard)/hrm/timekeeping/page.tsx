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
  generateCalendarData, 
  getMonthlySummary, 
  checkLocation as checkLocationUtil 
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
  const [loading, setLoading] = useState(false)
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
  const [calendarData, setCalendarData] = useState(() => generateCalendarData())
  const [viewMode, setViewMode] = useState("all")

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
      icon: FileText,
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
      icon: FileText,
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
  
  useEffect(() => {
    if (isCameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  useEffect(() => {
    const fetchTimekeeping = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_today_timekeeping_for_user');
      if (error) {
        console.error(error);
        setTodayTimekeeping(null);
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTime(null);
      } else if (data && data.length > 0) {
        setTodayTimekeeping(data[0]);
        setIsCheckedIn(true);
        setIsCheckedOut(!!data[0].check_out_time);
        setCheckInTime(data[0].check_in_time ? new Date(data[0].check_in_time) : null);
      } else {
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
    const supabase = createClient();
    const { error } = await supabase.rpc('checkout_timekeeping_record', {
      record_id: todayTimekeeping.id,
    });

    setIsCheckedOut(true)

    if (error) {
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
    
    setCalendarData(prev => ({
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

    const { data, error } = await supabase.rpc('add_timekeeping_record', {
      latitude: userLatitude.current,
      longitude: userLongitude.current,
      photo_url: photoPath
    });

    if (error) {
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
        setMockRequests(prev => prev.map(req => 
          req.id === editingRequest.id ? { ...req, ...commonRequestData } : req
        ))
        setEditingRequest(null)
        setIsEditModalOpen(false)
      } else {
        const newRequest = {
          id: mockRequests.length + 1,
          ...commonRequestData
        }
        setMockRequests(prev => [newRequest, ...prev])
        setIsCreateModalOpen(false)
      }
      
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
      
      setActiveTab("history")
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

  const monthlySummary = getMonthlySummary(currentDate, calendarData, mockRequests)

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
            {/* Monthly Summary Card */}
            <MonthlySummary
              currentDate={currentDate}
              monthlySummary={monthlySummary}
            />

            {/* Calendar Card */}
            <Calendar
              currentDate={currentDate}
              calendarData={calendarData}
              viewMode={viewMode}
              calendarFilter={calendarFilter}
              onNavigateMonth={navigateMonth}
              onViewModeChange={setViewMode}
              onCalendarFilterChange={setCalendarFilter}
              onDayClick={handleDayClick}
            />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <RequestHistory
              requests={mockRequests}
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
