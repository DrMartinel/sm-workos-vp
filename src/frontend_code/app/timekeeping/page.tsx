"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, Camera, CheckCircle, Loader2, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TimekeepingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [locationStatus, setLocationStatus] = useState<"checking" | "valid" | "invalid" | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const steps = [
    { id: 1, title: "Location", icon: MapPin },
    { id: 2, title: "Photo", icon: Camera },
    { id: 3, title: "Confirm", icon: CheckCircle },
  ]

  const checkLocation = () => {
    setLocationStatus("checking")

    // Simulate location check
    setTimeout(() => {
      const isValid = Math.random() > 0.3 // 70% chance of valid location
      setLocationStatus(isValid ? "valid" : "invalid")

      if (isValid) {
        setTimeout(() => {
          setCurrentStep(2)
        }, 1500)
      }
    }, 2000)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
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
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)

        // Stop camera
        const stream = video.srcObject as MediaStream
        stream?.getTracks().forEach((track) => track.stop())
        setCameraActive(false)

        setTimeout(() => {
          setCurrentStep(3)
        }, 500)
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmCheckIn = () => {
    // Simulate check-in process
    alert("Check-in successful!")
    // Reset for demo
    setCurrentStep(1)
    setLocationStatus(null)
    setCapturedImage(null)
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check In</h1>
          <p className="text-gray-600">Complete the check-in process to record your attendance</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const isConnected = index < steps.length - 1

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-gray-100 border-gray-300 text-gray-400",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-sm font-medium",
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {isConnected && (
                    <div
                      className={cn(
                        "w-16 h-0.5 mx-4 transition-colors",
                        currentStep > step.id ? "bg-green-500" : "bg-gray-300",
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
          <CardContent className="p-8">
            {/* Step 1: Location Check */}
            {currentStep === 1 && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  {locationStatus === "checking" ? (
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  ) : locationStatus === "valid" ? (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  ) : locationStatus === "invalid" ? (
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  ) : (
                    <MapPin className="h-12 w-12 text-blue-600" />
                  )}
                </div>

                {locationStatus === null && (
                  <div className="text-center">
                    <Button onClick={checkLocation} size="lg">
                      Check Location
                    </Button>
                  </div>
                )}

                {locationStatus === "checking" && (
                  <div className="text-center">
                    <p className="text-gray-600">Verifying your location...</p>
                  </div>
                )}

                {locationStatus === "valid" && (
                  <div className="text-center">
                    <p className="text-green-600 font-medium">Location verified successfully!</p>
                    <p className="text-gray-600 text-sm">You are within the required area</p>
                  </div>
                )}

                {locationStatus === "invalid" && (
                  <div className="text-center">
                    <p className="text-red-600 font-medium">Location verification failed</p>
                    <p className="text-gray-600 text-sm">You are too far from the office</p>
                    <Button onClick={checkLocation} variant="outline" className="mt-4 bg-transparent">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Take Photo */}
            {currentStep === 2 && (
              <div className="text-center space-y-6">
                <div className="relative">
                  {!cameraActive && !capturedImage && (
                    <div className="w-full max-w-md mx-auto aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Camera preview will appear here</p>
                      </div>
                    </div>
                  )}

                  {cameraActive && (
                    <div className="relative w-full max-w-md mx-auto">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full aspect-[4/3] bg-black rounded-lg object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {capturedImage && (
                    <div className="relative w-full max-w-md mx-auto">
                      <img
                        src={capturedImage || "/placeholder.svg"}
                        alt="Captured"
                        className="w-full aspect-[4/3] rounded-lg object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={retakePhoto}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  {!cameraActive && !capturedImage && (
                    <Button onClick={startCamera} size="lg">
                      Start Camera
                    </Button>
                  )}

                  {cameraActive && (
                    <Button onClick={capturePhoto} size="lg">
                      Capture
                    </Button>
                  )}

                  {capturedImage && (
                    <div className="flex gap-3">
                      <Button onClick={retakePhoto} variant="outline">
                        Retake
                      </Button>
                      <Button onClick={() => setCurrentStep(3)}>Continue</Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Ready to Check In</h3>
                  <p className="text-gray-600 mb-6">Please review your information and confirm your check-in</p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-sm mx-auto">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-green-600">✓ Verified</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Photo:</span>
                        <span className="text-green-600">✓ Captured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={confirmCheckIn} size="lg" className="w-full max-w-sm">
                    Confirm Check In
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
