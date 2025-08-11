"use client"

import React from "react"
import { ArrowRight, MapPin, Clock, Check, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CheckOutFlowProps {
  checkInTime: Date | null
  currentTime: Date
  locationStatus: "checking" | "approved" | "denied" | null
  onBack: () => void
  onCheckLocationAndCheckout: () => void
}

export default function CheckOutFlow({
  checkInTime,
  currentTime,
  locationStatus,
  onBack,
  onCheckLocationAndCheckout
}: CheckOutFlowProps) {
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
                onClick={onCheckLocationAndCheckout}
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