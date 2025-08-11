"use client"

import React, { useRef, useEffect } from "react"
import { MapPin, Camera, Check, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CheckInFlowProps {
  currentStep: number
  locationStatus: "checking" | "approved" | "denied" | null
  capturedImage: string | null
  currentTime: string
  currentDate: string
  isCameraActive: boolean
  onCheckLocation: () => Promise<"approved" | "denied">
  onStartCamera: () => void
  onCapturePhoto: () => void
  onComplete: () => void
  onBack: () => void
  onLocationRetry: () => void
  onNextStep: () => void
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export default function CheckInFlow({
  currentStep,
  locationStatus,
  capturedImage,
  currentTime,
  currentDate,
  isCameraActive,
  onCheckLocation,
  onStartCamera,
  onCapturePhoto,
  onComplete,
  onBack,
  onLocationRetry,
  onNextStep,
  videoRef,
  canvasRef
}: CheckInFlowProps) {
  const steps = [
    { number: 1, title: "Check Location", icon: MapPin },
    { number: 2, title: "Take Photo", icon: Camera },
    { number: 3, title: "Confirm", icon: Check },
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
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
                  <Button onClick={onCheckLocation} className="bg-blue-600 hover:bg-blue-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    Check Location
                  </Button>
                )}

                {locationStatus === "checking" && <p className="text-gray-600">Checking your location...</p>}

                {locationStatus === "approved" && (
                  <div>
                    <h3 className="text-lg font-medium text-green-600 mb-2">Location Approved</h3>
                    <p className="text-gray-600 mb-4">You are within the required range from the office</p>
                    <Button onClick={onNextStep} className="bg-green-600 hover:bg-green-700">
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
                      onClick={onLocationRetry}
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
                    <Button onClick={onStartCamera} className="bg-purple-600 hover:bg-purple-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={onCapturePhoto} className="bg-purple-600 hover:bg-purple-700">
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
                      {currentTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentDate}
                    </div>
                  </div>
                  <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
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