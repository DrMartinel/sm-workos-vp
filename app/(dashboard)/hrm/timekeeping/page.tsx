"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { MapPin, Camera, Check, ArrowRight, AlertCircle, CheckCircle, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/utils/supabase/client"
import dataURLtoBlob from "./utils/dataURLtoBlob"
import TimekeepingLoading from "./loading"

export default function TimekeepingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [locationStatus, setLocationStatus] = useState<"checking" | "approved" | "denied" | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isCheckedOut, setIsCheckedOut] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const userLatitude = useRef<number | null>(null);
  const userLongitude = useRef<number | null>(null);
  const currentTimeString = currentTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const currentDateString = currentTime.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const [todayTimekeeping, setTodayTimekeeping] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);


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

  const checkLocation = async () => {
    setLocationStatus("checking")

    if (!navigator.geolocation) {
      setTimeout(() => {
        setLocationStatus("denied")
      }, 1000)
      return
    }

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

        if (distance <= 100) {
          setLocationStatus("approved")
        } else {
          setLocationStatus("denied")
        }
      },
      (error) => {
        setLocationStatus("denied")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
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
      alert("Unable to access camera. Please check permissions.")
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

  const handleComplete = async () => {
    const supabase = createClient();

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("User not authenticated");
      return;
    }

    let photoPath = null;
    if (capturedImage) {
      // Generate a unique filename
      const fileName = `${user.id}_${Date.now()}.png`;
      const filePath = `timekeeping/images/${fileName}`;
      const fileBlob = dataURLtoBlob(capturedImage);

      // Upload
      const { error: uploadError } = await supabase.storage
        .from("hrm")
        .upload(filePath, fileBlob, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        alert("Failed to upload image: " + uploadError.message);
        return;
      }

      photoPath = filePath;
    }

    // Insert into Supabase
    const { data, error } = await supabase.rpc('add_timekeeping_record', {
      latitude: userLatitude.current,
      longitude: userLongitude.current,
      photo_url: photoPath
    });

    console.log("Insert response:", { data, error });

    if (error) {
      alert("Failed to save timekeeping data: " + (error as any).message || JSON.stringify(error));
      return;
    }

    alert("Check-in completed successfully!");
    setIsCheckedIn(true);
    setIsCheckedOut(false);
    // 
  };

  const handleCheckOut = async () => {
    if (!todayTimekeeping || !todayTimekeeping.id) {
      alert("No timekeeping record found for today.");
      return;
    }
    setIsCheckingOut(true);

    const supabase = createClient();
    const { error } = await supabase.rpc('checkout_timekeeping_record', {
      record_id: todayTimekeeping.id,
    });

    setIsCheckingOut(false);

    if (error) {
      alert("Failed to check out: " + (error as any).message || JSON.stringify(error));
      return;
    }

    setIsCheckedOut(true);
    // Optionally, refetch today's timekeeping to update UI with new check_out_time
  };

  const steps = [
    { number: 1, title: "Location Check", icon: MapPin },
    { number: 2, title: "Take Photo", icon: Camera },
    { number: 3, title: "Confirm", icon: Check },
  ]

  if (loading) {
    return <TimekeepingLoading />;
  }

  if (!isCheckedIn) {
    // Show check-in flow
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Timekeeping</h1>
            <p className="text-gray-500 mt-1">Check in to record your attendance</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number

                return (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                          isActive && "border-blue-500 bg-blue-500 text-white",
                          isCompleted && "border-green-500 bg-green-500 text-white",
                          !isActive && !isCompleted && "border-gray-300 bg-white text-gray-400",
                        )}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span
                        className={cn(
                          "text-sm mt-2 font-medium",
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

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {steps[currentStep - 1] && (
                  <>
                    {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
                    Step {currentStep}: {steps[currentStep - 1].title}
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "We need to verify you're within 100m of the office"}
                {currentStep === 2 && "Take a photo for attendance verification"}
                {currentStep === 3 && "Review and confirm your check-in"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Location Check */}
              {currentStep === 1 && (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 relative">
                    {locationStatus === "checking" && (
                      <>
                        <MapPin className="h-12 w-12 text-blue-600 animate-pulse" />
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </>
                    )}
                    {locationStatus === "approved" && <CheckCircle className="h-12 w-12 text-green-600" />}
                    {locationStatus === "denied" && <AlertCircle className="h-12 w-12 text-red-600" />}
                    {locationStatus === null && <MapPin className="h-12 w-12 text-blue-600" />}
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
                      <p className="text-gray-600 mb-4">You're within the required distance from the office</p>
                      <Button onClick={() => setCurrentStep(2)} className="bg-green-600 hover:bg-green-700">
                        Next Step
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {locationStatus === "denied" && (
                    <div>
                      <h3 className="text-lg font-medium text-red-600 mb-2">Location Too Far</h3>
                      <p className="text-gray-600 mb-4">You need to be within 100 meters of the office to check in</p>
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
                            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
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
                        Capture
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {currentStep === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Confirm Check-in</h3>

                    {capturedImage && (
                      <div className="mb-4">
                        <img
                          src={capturedImage || "/placeholder.svg"}
                          alt="Captured photo"
                          className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300 mx-auto mb-4"
                        />
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-sm text-gray-600 mb-1">Check-in Time</div>
                      <div className="text-xl font-bold text-gray-900">
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
  } else if (isCheckedIn && !isCheckedOut) {
    // Show check-out flow
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Timekeeping</h1>
            <p className="text-gray-500 mt-1">You're currently checked in</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardDescription>You're currently at work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              {/* Check-in Time and Current Time Combined */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Check-in Time</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {checkInTime?.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-600 mb-2">Current Time</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {currentTime.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="text-sm text-gray-600">
                    {checkInTime?.toLocaleDateString("vi-VN", {
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

              {/* Check Out Button */}
              <Button
                onClick={handleCheckOut}
                disabled={isCheckingOut && locationStatus === "approved"}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              >
                {isCheckingOut ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5 mr-2" />
                    Check Out
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } else if (isCheckedIn && isCheckedOut) {
    // Show summary
    const workingHours = checkInTime
      ? Math.floor((currentTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60))
      : 0
    const workingMinutes = checkInTime
      ? Math.floor(((currentTime.getTime() - checkInTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
      : 0

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="space-y-6 text-center pt-8">
              {/* Work Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Summary</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Work Hours</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600">Check-in</span>
                        <span className="text-sm font-bold text-green-900">
                          {checkInTime?.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-red-600">Check-out</span>
                        <span className="text-sm font-bold text-red-900">
                          {currentTime.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Total Hours</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {workingHours}h {workingMinutes}m
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

              {/* Success Message */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Great Work! 💪</h4>
                <p className="text-gray-600">
                  Thank you for your dedication and effort today. Have a great rest and get ready for another productive
                  day!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}
