"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { MapPin, Camera, Check, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function TimekeepingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [locationStatus, setLocationStatus] = useState<"checking" | "approved" | "denied" | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

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

  const checkLocation = async () => {
    setLocationStatus("checking")

    // Simulate location check
    setTimeout(() => {
      // Randomly approve/deny for demo purposes
      const isNearOffice = Math.random() > 0.3 // 70% chance of approval
      setLocationStatus(isNearOffice ? "approved" : "denied")
    }, 2000)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
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

  const handleComplete = () => {
    alert("Check-in completed successfully!")
    // Reset to step 1 for demo purposes
    setCurrentStep(1)
    setLocationStatus(null)
    setCapturedImage(null)
    setIsCameraActive(false)
  }

  const steps = [
    { number: 1, title: "Location Check", icon: MapPin },
    { number: 2, title: "Take Photo", icon: Camera },
    { number: 3, title: "Confirm", icon: Check },
  ]

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
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-blue-600" />
                </div>

                {locationStatus === null && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Check Your Location</h3>
                    <p className="text-gray-600 mb-4">
                      Click the button below to verify you're within 100 meters of the office
                    </p>
                    <Button onClick={checkLocation} className="bg-blue-600 hover:bg-blue-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      Check Location
                    </Button>
                  </div>
                )}

                {locationStatus === "checking" && (
                  <div>
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking your location...</p>
                  </div>
                )}

                {locationStatus === "approved" && (
                  <div>
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
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
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
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
                <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <Camera className="h-12 w-12 text-purple-600" />
                </div>

                {!isCameraActive && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Take Your Photo</h3>
                    <p className="text-gray-600 mb-4">We need to take a photo for attendance verification</p>
                    <Button onClick={startCamera} className="bg-purple-600 hover:bg-purple-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                )}

                {isCameraActive && (
                  <div>
                    <div className="relative mb-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <Button onClick={capturePhoto} className="bg-purple-600 hover:bg-purple-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                  </div>
                )}
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
                      {currentTime.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentTime.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
