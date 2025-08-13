"use client"

import React from "react"
import { Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface AttendanceStatusBannerProps {
  isCheckedIn: boolean
  isCheckedOut: boolean
  checkInTime: Date | null
  onCheckIn: () => void
  onCheckOut: () => void
}

export default function AttendanceStatusBanner({
  isCheckedIn,
  isCheckedOut,
  checkInTime,
  onCheckIn,
  onCheckOut
}: AttendanceStatusBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white shadow-lg min-h-[130px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8" />
          <div>
            <h3 className="font-semibold text-2xl">Attendance Status</h3>
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
              onClick={onCheckIn}
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              Check-in
            </Button>
          ) : isCheckedIn && !isCheckedOut ? (
            <Button
              onClick={onCheckOut}
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
            >
              Check-out
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
} 